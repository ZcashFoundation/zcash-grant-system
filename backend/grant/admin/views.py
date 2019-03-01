from functools import reduce
from flask import Blueprint, request, session
from flask_yoloapi import endpoint, parameter
from decimal import Decimal
from datetime import datetime
from sqlalchemy import text

from grant.comment.models import Comment, user_comments_schema, admin_comments_schema, admin_comment_schema
from grant.email.send import generate_email, send_email
from grant.extensions import db
from grant.proposal.models import (
    Proposal,
    ProposalArbiter,
    ProposalContribution,
    proposals_schema,
    proposal_schema,
    user_proposal_contributions_schema,
    admin_proposal_contribution_schema,
    admin_proposal_contributions_schema,
)
from grant.milestone.models import Milestone
from grant.user.models import User, UserSettings, admin_users_schema, admin_user_schema
from grant.rfp.models import RFP, admin_rfp_schema, admin_rfps_schema
import grant.utils.admin as admin
import grant.utils.auth as auth
from grant.utils.misc import make_url
from grant.utils.enums import (
    ProposalStatus,
    ProposalStage,
    ContributionStatus,
    ProposalArbiterStatus,
    MilestoneStage,
    RFPStatus,
)
from grant.utils import pagination
from grant.settings import EXPLORER_URL
from sqlalchemy import func, or_

from .example_emails import example_email_args

blueprint = Blueprint('admin', __name__, url_prefix='/api/v1/admin')


def make_2fa_state():
    return {
        "isLoginFresh": admin.is_auth_fresh(),
        "has2fa": admin.has_2fa_setup(),
        "is2faAuthed": admin.admin_is_2fa_authed(),
        "backupCodeCount": admin.backup_code_count(),
        "isEmailVerified": auth.is_email_verified(),
    }


def make_login_state():
    return {
        "isLoggedIn": admin.admin_is_authed(),
        "is2faAuthed": admin.admin_is_2fa_authed()
    }


@blueprint.route("/checklogin", methods=["GET"])
@endpoint.api()
def loggedin():
    return make_login_state()


@blueprint.route("/login", methods=["POST"])
@endpoint.api(
    parameter('username', type=str, required=False),
    parameter('password', type=str, required=False),
)
def login(username, password):
    if auth.auth_user(username, password):
        if admin.admin_is_authed():
            return make_login_state()
    return {"message": "Username or password incorrect."}, 401


@blueprint.route("/refresh", methods=["POST"])
@endpoint.api(
    parameter('password', type=str, required=True),
)
def refresh(password):
    if auth.refresh_auth(password):
        return make_login_state()
    else:
        return {"message": "Username or password incorrect."}, 401


@blueprint.route("/2fa", methods=["GET"])
@endpoint.api()
def get_2fa():
    if not admin.admin_is_authed():
        return {"message": "Must be authenticated"}, 403
    return make_2fa_state()


@blueprint.route("/2fa/init", methods=["GET"])
@endpoint.api()
def get_2fa_init():
    admin.throw_on_2fa_not_allowed()
    return admin.make_2fa_setup()


@blueprint.route("/2fa/enable", methods=["POST"])
@endpoint.api(
    parameter('backupCodes', type=list, required=True),
    parameter('totpSecret', type=str, required=True),
    parameter('verifyCode', type=str, required=True),
)
def post_2fa_enable(backup_codes, totp_secret, verify_code):
    admin.throw_on_2fa_not_allowed()
    admin.check_and_set_2fa_setup(backup_codes, totp_secret, verify_code)
    db.session.commit()
    return make_2fa_state()


@blueprint.route("/2fa/verify", methods=["POST"])
@endpoint.api(
    parameter('verifyCode', type=str, required=True),
)
def post_2fa_verify(verify_code):
    admin.throw_on_2fa_not_allowed(allow_stale=True)
    admin.admin_auth_2fa(verify_code)
    db.session.commit()
    return make_2fa_state()


@blueprint.route("/logout", methods=["GET"])
@endpoint.api()
def logout():
    admin.logout()
    return {
        "isLoggedIn": False,
        "is2faAuthed": False
    }


@blueprint.route("/stats", methods=["GET"])
@endpoint.api()
@admin.admin_auth_required
def stats():
    user_count = db.session.query(func.count(User.id)).scalar()
    proposal_count = db.session.query(func.count(Proposal.id)).scalar()
    proposal_pending_count = db.session.query(func.count(Proposal.id)) \
        .filter(Proposal.status == ProposalStatus.PENDING) \
        .scalar()
    proposal_no_arbiter_count = db.session.query(func.count(Proposal.id)) \
        .join(Proposal.arbiter) \
        .filter(Proposal.status == ProposalStatus.LIVE) \
        .filter(ProposalArbiter.status == ProposalArbiterStatus.MISSING) \
        .scalar()
    proposal_milestone_payouts_count = db.session.query(func.count(Proposal.id)) \
        .join(Proposal.milestones) \
        .filter(Proposal.status == ProposalStatus.LIVE) \
        .filter(Milestone.stage == MilestoneStage.ACCEPTED) \
        .scalar()
    # Count contributions on proposals that didn't get funded for users who have specified a refund address
    contribution_refundable_count = db.session.query(func.count(ProposalContribution.id)) \
        .filter(ProposalContribution.refund_tx_id == None) \
        .filter(ProposalContribution.staking == False) \
        .filter(ProposalContribution.status == ContributionStatus.CONFIRMED) \
        .join(Proposal) \
        .filter(or_(
            Proposal.stage == ProposalStage.FAILED,
            Proposal.stage == ProposalStage.CANCELED,
        )) \
        .join(ProposalContribution.user) \
        .join(UserSettings) \
        .filter(UserSettings.refund_address != None) \
        .scalar()
    return {
        "userCount": user_count,
        "proposalCount": proposal_count,
        "proposalPendingCount": proposal_pending_count,
        "proposalNoArbiterCount": proposal_no_arbiter_count,
        "proposalMilestonePayoutsCount": proposal_milestone_payouts_count,
        "contributionRefundableCount": contribution_refundable_count,
    }


# USERS


@blueprint.route('/users/<user_id>', methods=['DELETE'])
@endpoint.api()
@admin.admin_auth_required
def delete_user(user_id):
    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": "No user matching that id"}, 404

    db.session.delete(user)
    db.session.commit()
    return None, 200


@blueprint.route("/users", methods=["GET"])
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
@admin.admin_auth_required
def get_users(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.user(
        schema=admin_users_schema,
        query=User.query,
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route('/users/<id>', methods=['GET'])
@endpoint.api()
@admin.admin_auth_required
def get_user(id):
    user_db = User.query.filter(User.id == id).first()
    if user_db:
        user = admin_user_schema.dump(user_db)
        user_proposals = Proposal.query.filter(Proposal.team.any(id=user['userid'])).all()
        user['proposals'] = proposals_schema.dump(user_proposals)
        user_comments = Comment.get_by_user(user_db)
        user['comments'] = user_comments_schema.dump(user_comments)
        contributions = ProposalContribution.get_by_userid(user_db.id)
        contributions_dump = user_proposal_contributions_schema.dump(contributions)
        user["contributions"] = contributions_dump
        return user
    return {"message": f"Could not find user with id {id}"}, 404


@blueprint.route('/users/<user_id>', methods=['PUT'])
@endpoint.api(
    parameter('silenced', type=bool, required=False),
    parameter('banned', type=bool, required=False),
    parameter('bannedReason', type=str, required=False),
    parameter('isAdmin', type=bool, required=False)
)
@admin.admin_auth_required
def edit_user(user_id, silenced, banned, banned_reason, is_admin):
    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": f"Could not find user with id {id}"}, 404

    if silenced is not None:
        user.set_silenced(silenced)

    if banned is not None:
        if banned and not banned_reason:  # if banned true, provide reason
            return {"message": "Please include reason for banning"}, 417
        user.set_banned(banned, banned_reason)

    if is_admin is not None:
        user.set_admin(is_admin)

    db.session.commit()
    return admin_user_schema.dump(user)


# ARBITERS


@blueprint.route("/arbiters", methods=["GET"])
@endpoint.api(
    parameter('search', type=str, required=False),
)
@admin.admin_auth_required
def get_arbiters(search):
    results = []
    error = None
    if len(search) < 3:
        error = 'search query must be at least 3 characters long'
    else:
        users = User.query.filter(
            User.email_address.ilike(f'%{search}%') | User.display_name.ilike(f'%{search}%')
        ).order_by(User.display_name).all()
        results = admin_users_schema.dump(users)

    return {
        'results': results,
        'search': search,
        'error': error
    }


@blueprint.route('/arbiters', methods=['PUT'])
@endpoint.api(
    parameter('proposalId', type=int, required=True),
    parameter('userId', type=int, required=True)
)
@admin.admin_auth_required
def set_arbiter(proposal_id, user_id):
    proposal = Proposal.query.filter(Proposal.id == proposal_id).first()
    if not proposal:
        return {"message": "Proposal not found"}, 404

    for member in proposal.team:
        if member.id == user_id:
            return {"message": "Cannot set proposal team member as arbiter"}, 400

    if proposal.is_failed:
        return {"message": "Cannot set arbiter on failed proposal"}, 400

    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": "User not found"}, 404

    # send email
    code = user.email_verification.code
    send_email(user.email_address, 'proposal_arbiter', {
        'proposal': proposal,
        'proposal_url': make_url(f'/proposals/{proposal.id}'),
        'accept_url': make_url(f'/email/arbiter?code={code}&proposalId={proposal.id}'),
    })
    proposal.arbiter.user = user
    proposal.arbiter.status = ProposalArbiterStatus.NOMINATED
    db.session.add(proposal.arbiter)
    db.session.commit()

    return {
        'proposal': proposal_schema.dump(proposal),
        'user': admin_user_schema.dump(user)
    }, 200


# PROPOSALS


@blueprint.route("/proposals", methods=["GET"])
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
@admin.admin_auth_required
def get_proposals(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.proposal(
        schema=proposals_schema,
        query=Proposal.query,
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route('/proposals/<id>', methods=['GET'])
@endpoint.api()
@admin.admin_auth_required
def get_proposal(id):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if proposal:
        return proposal_schema.dump(proposal)
    return {"message": f"Could not find proposal with id {id}"}, 404


@blueprint.route('/proposals/<id>', methods=['DELETE'])
@endpoint.api()
@admin.admin_auth_required
def delete_proposal(id):
    return {"message": "Not implemented."}, 400


@blueprint.route('/proposals/<id>', methods=['PUT'])
@endpoint.api(
    parameter('contributionMatching', type=float, required=False, default=None),
    parameter('contributionBounty', type=str, required=False, default=None),
)
@admin.admin_auth_required
def update_proposal(id, contribution_matching, contribution_bounty):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if not proposal:
        return {"message": f"Could not find proposal with id {id}"}, 404

    if contribution_matching is not None:
        proposal.set_contribution_matching(contribution_matching)

    if contribution_bounty is not None:
        proposal.set_contribution_bounty(contribution_bounty)

    db.session.add(proposal)
    db.session.commit()

    return proposal_schema.dump(proposal)


@blueprint.route('/proposals/<id>/approve', methods=['PUT'])
@endpoint.api(
    parameter('isApprove', type=bool, required=True),
    parameter('rejectReason', type=str, required=False)
)
@admin.admin_auth_required
def approve_proposal(id, is_approve, reject_reason=None):
    proposal = Proposal.query.filter_by(id=id).first()
    if proposal:
        proposal.approve_pending(is_approve, reject_reason)
        db.session.commit()
        return proposal_schema.dump(proposal)

    return {"message": "No proposal found."}, 404


@blueprint.route('/proposals/<id>/cancel', methods=['PUT'])
@endpoint.api()
@admin.admin_auth_required
def cancel_proposal(id):
    proposal = Proposal.query.filter_by(id=id).first()
    if not proposal:
        return {"message": "No proposal found."}, 404

    proposal.cancel()
    db.session.add(proposal)
    db.session.commit()
    return proposal_schema.dump(proposal)


@blueprint.route("/proposals/<id>/milestone/<mid>/paid", methods=["PUT"])
@endpoint.api(
    parameter('txId', type=str, required=True),
)
@admin.admin_auth_required
def paid_milestone_payout_request(id, mid, tx_id):
    proposal = Proposal.query.filter_by(id=id).first()
    if not proposal:
        return {"message": "No proposal matching id"}, 404
    if not proposal.is_funded:
        return {"message": "Proposal is not fully funded"}, 400
    for ms in proposal.milestones:
        if ms.id == int(mid):
            ms.mark_paid(tx_id)
            db.session.add(ms)
            db.session.flush()
            # check if this is the final ms, and update proposal.stage
            num_paid = reduce(lambda a, x: a + (1 if x.stage == MilestoneStage.PAID else 0), proposal.milestones, 0)
            if num_paid == len(proposal.milestones):
                proposal.stage = ProposalStage.COMPLETED  # WIP -> COMPLETED
                db.session.add(proposal)
                db.session.flush()
            db.session.commit()
            # email TEAM that payout request was PAID
            amount = Decimal(ms.payout_percent) * Decimal(proposal.target) / 100
            for member in proposal.team:
                send_email(member.email_address, 'milestone_paid', {
                    'proposal': proposal,
                    'amount': amount,
                    'tx_explorer_url': f'{EXPLORER_URL}transactions/{tx_id}',
                    'proposal_milestones_url': make_url(f'/proposals/{proposal.id}?tab=milestones'),
                })
            return proposal_schema.dump(proposal), 200

    return {"message": "No milestone matching id"}, 404


# EMAIL


@blueprint.route('/email/example/<type>', methods=['GET'])
@endpoint.api()
@admin.admin_auth_required
def get_email_example(type):
    email = generate_email(type, example_email_args.get(type))
    if email['info'].get('subscription'):
        # Unserializable, so remove
        email['info'].pop('subscription', None)
    return email


# Requests for Proposal


@blueprint.route('/rfps', methods=['GET'])
@endpoint.api()
@admin.admin_auth_required
def get_rfps():
    rfps = RFP.query.all()
    return admin_rfps_schema.dump(rfps)


@blueprint.route('/rfps', methods=['POST'])
@endpoint.api(
    parameter('title', type=str),
    parameter('brief', type=str),
    parameter('content', type=str),
    parameter('category', type=str),
    parameter('bounty', type=str),
    parameter('matching', type=bool, default=False),
    parameter('dateCloses', type=int),
)
@admin.admin_auth_required
def create_rfp(date_closes, **kwargs):
    rfp = RFP(
        **kwargs,
        date_closes=datetime.fromtimestamp(date_closes) if date_closes else None,
    )
    db.session.add(rfp)
    db.session.commit()
    return admin_rfp_schema.dump(rfp), 201


@blueprint.route('/rfps/<rfp_id>', methods=['GET'])
@endpoint.api()
@admin.admin_auth_required
def get_rfp(rfp_id):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    return admin_rfp_schema.dump(rfp)


@blueprint.route('/rfps/<rfp_id>', methods=['PUT'])
@endpoint.api(
    parameter('title', type=str),
    parameter('brief', type=str),
    parameter('content', type=str),
    parameter('category', type=str),
    parameter('bounty', type=str),
    parameter('matching', type=bool, default=False),
    parameter('dateCloses', type=int),
    parameter('status', type=str),
)
@admin.admin_auth_required
def update_rfp(rfp_id, title, brief, content, category, bounty, matching, date_closes, status):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    # Update fields
    rfp.title = title
    rfp.brief = brief
    rfp.content = content
    rfp.category = category
    rfp.bounty = bounty
    rfp.matching = matching
    rfp.date_closes = datetime.fromtimestamp(date_closes) if date_closes else None

    # Update timestamps if status changed
    if rfp.status != status:
        if status == RFPStatus.LIVE and not rfp.date_opened:
            rfp.date_opened = datetime.now()
        if status == RFPStatus.CLOSED:
            rfp.date_closed = datetime.now()
        rfp.status = status

    db.session.add(rfp)
    db.session.commit()
    return admin_rfp_schema.dump(rfp)


@blueprint.route('/rfps/<rfp_id>', methods=['DELETE'])
@endpoint.api()
@admin.admin_auth_required
def delete_rfp(rfp_id):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    db.session.delete(rfp)
    db.session.commit()
    return None, 200


# Contributions


@blueprint.route('/contributions', methods=['GET'])
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
@admin.admin_auth_required
def get_contributions(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.contribution(
        page=page,
        schema=admin_proposal_contributions_schema,
        filters=filters_workaround,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route('/contributions', methods=['POST'])
@endpoint.api(
    parameter('proposalId', type=int, required=True),
    parameter('userId', type=int, required=True),
    parameter('status', type=str, required=True),
    parameter('amount', type=str, required=True),
    parameter('txId', type=str, required=False),
)
@admin.admin_auth_required
def create_contribution(proposal_id, user_id, status, amount, tx_id):
    # Some fields set manually since we're admin, and normally don't do this
    contribution = ProposalContribution(
        proposal_id=proposal_id,
        user_id=user_id,
        amount=amount,
    )
    contribution.status = status
    contribution.tx_id = tx_id

    db.session.add(contribution)
    db.session.flush()

    contribution.proposal.set_pending_when_ready()
    contribution.proposal.set_funded_when_ready()

    db.session.commit()
    return admin_proposal_contribution_schema.dump(contribution), 200


@blueprint.route('/contributions/<contribution_id>', methods=['GET'])
@endpoint.api()
@admin.admin_auth_required
def get_contribution(contribution_id):
    contribution = ProposalContribution.query.filter(ProposalContribution.id == contribution_id).first()
    if not contribution:
        return {"message": "No contribution matching that id"}, 404

    return admin_proposal_contribution_schema.dump(contribution), 200


@blueprint.route('/contributions/<contribution_id>', methods=['PUT'])
@endpoint.api(
    parameter('proposalId', type=int, required=False),
    parameter('userId', type=int, required=False),
    parameter('status', type=str, required=False),
    parameter('amount', type=str, required=False),
    parameter('txId', type=str, required=False),
    parameter('refundTxId', type=str, required=False),
)
@admin.admin_auth_required
def edit_contribution(contribution_id, proposal_id, user_id, status, amount, tx_id, refund_tx_id):
    contribution = ProposalContribution.query.filter(ProposalContribution.id == contribution_id).first()
    if not contribution:
        return {"message": "No contribution matching that id"}, 404
    had_refund = contribution.refund_tx_id

    # do not allow editing certain fields on contributions once a proposal has become funded
    if (proposal_id or user_id or status or amount or tx_id) and contribution.proposal.is_funded:
        return {"message": "Cannot edit contributions to fully-funded proposals"}, 400

    # Proposal ID (must belong to an existing proposal)
    if proposal_id:
        proposal = Proposal.query.filter(Proposal.id == proposal_id).first()
        if not proposal:
            return {"message": "No proposal matching that id"}, 400
        contribution.proposal_id = proposal_id
    # User ID (must belong to an existing user)
    if user_id:
        user = User.query.filter(User.id == user_id).first()
        if not user:
            return {"message": "No user matching that id"}, 400
        contribution.user_id = user_id
    # Status (must be in list of statuses)
    if status:
        if not ContributionStatus.includes(status):
            return {"message": "Invalid status"}, 400
        contribution.status = status
    # Amount (must be a Decimal parseable)
    if amount:
        try:
            contribution.amount = str(Decimal(amount))
        except:
            return {"message": "Amount could not be parsed as number"}, 400
    # Transaction ID (no validation)
    if tx_id is not None:
        contribution.tx_id = tx_id
    # Refund TX ID (no validation)
    if refund_tx_id is not None:
        contribution.refund_tx_id = refund_tx_id

    db.session.add(contribution)
    db.session.flush()

    contribution.proposal.set_pending_when_ready()
    contribution.proposal.set_funded_when_ready()

    db.session.commit()
    return admin_proposal_contribution_schema.dump(contribution), 200


# Comments


@blueprint.route('/comments', methods=['GET'])
@endpoint.api(
    parameter('page', type=int, required=False),
    parameter('filters', type=list, required=False),
    parameter('search', type=str, required=False),
    parameter('sort', type=str, required=False)
)
@admin.admin_auth_required
def get_comments(page, filters, search, sort):
    filters_workaround = request.args.getlist('filters[]')
    page = pagination.comment(
        page=page,
        filters=filters_workaround,
        search=search,
        sort=sort,
        schema=admin_comments_schema
    )
    return page


@blueprint.route('/comments/<comment_id>', methods=['PUT'])
@endpoint.api(
    parameter('hidden', type=bool, required=False),
    parameter('reported', type=bool, required=False),
)
@admin.admin_auth_required
def edit_comment(comment_id, hidden, reported):
    comment = Comment.query.filter(Comment.id == comment_id).first()
    if not comment:
        return {"message": "No comment matching that id"}, 404

    if hidden is not None:
        comment.hide(hidden)

    if reported is not None:
        comment.report(reported)

    db.session.commit()
    return admin_comment_schema.dump(comment)
