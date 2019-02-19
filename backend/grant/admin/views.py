from datetime import datetime
from decimal import Decimal
from functools import reduce

from flask import Blueprint, request
from marshmallow import fields
from sqlalchemy import func

from grant.comment.models import Comment, user_comments_schema
from grant.email.send import generate_email, send_email
from grant.extensions import db
from grant.milestone.models import Milestone
from grant.parser import body, query
from grant.proposal.models import (
    Proposal,
    ProposalArbiter,
    ProposalContribution,
    proposals_schema,
    proposal_schema,
    proposal_contribution_schema,
    user_proposal_contributions_schema,
)
from grant.rfp.models import RFP, admin_rfp_schema, admin_rfps_schema
from grant.settings import EXPLORER_URL
from grant.user.models import User, admin_users_schema, admin_user_schema
from grant.utils import pagination
from grant.utils.admin import admin_auth_required, admin_is_authed, admin_login, admin_logout
from grant.utils.enums import (
    ProposalStatus,
    ProposalStage,
    ContributionStatus,
    ProposalArbiterStatus,
    MilestoneStage,
    RFPStatus,
)
from grant.utils.misc import make_url
from .example_emails import example_email_args

blueprint = Blueprint('admin', __name__, url_prefix='/api/v1/admin')


@blueprint.route("/checklogin", methods=["GET"])
def loggedin():
    return {"isLoggedIn": admin_is_authed()}


@blueprint.route("/login", methods=["POST"])
@body({
    "username": fields.Str(required=False, missing=None),
    "password": fields.Str(required=False, missing=None)
})
def login(username, password):
    if admin_login(username, password):
        return {"isLoggedIn": True}
    else:
        return {"message": "Username or password incorrect."}, 401


@blueprint.route("/logout", methods=["GET"])
def logout():
    admin_logout()
    return {"isLoggedIn": False}


@blueprint.route("/stats", methods=["GET"])
@admin_auth_required
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
    return {
        "userCount": user_count,
        "proposalCount": proposal_count,
        "proposalPendingCount": proposal_pending_count,
        "proposalNoArbiterCount": proposal_no_arbiter_count,
        "proposalMilestonePayoutsCount": proposal_milestone_payouts_count,
    }


# USERS


@blueprint.route('/users/<user_id>', methods=['DELETE'])
@admin_auth_required
def delete_user(user_id):
    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": "No user matching that id"}, 404

    db.session.delete(user)
    db.session.commit()
    return {"message", "ok"}, 200


@blueprint.route("/users", methods=["GET"])
@query({
    "page": fields.Int(required=False, missing=None),
    "filters": fields.List(fields.Str(), required=False, missing=None),
    "search": fields.Str(required=False, missing=None),
    "sort": fields.Str(required=False, missing=None)
})
@admin_auth_required
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
@admin_auth_required
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
@body({
    "silenced": fields.Bool(required=False, missing=None),
    "banned": fields.Bool(required=False, missing=None),
    "bannedReason": fields.Str(required=False, missing=None)
})
@admin_auth_required
def edit_user(user_id, silenced, banned, banned_reason):
    user = User.query.filter(User.id == user_id).first()
    if not user:
        return {"message": f"Could not find user with id {id}"}, 404

    if silenced is not None:
        user.silenced = silenced
        db.session.add(user)

    if banned is not None:
        if banned and not banned_reason:  # if banned true, provide reason
            return {"message": "Please include reason for banning"}, 417
        user.banned = banned
        user.banned_reason = banned_reason
        db.session.add(user)

    db.session.commit()
    return admin_user_schema.dump(user)


# ARBITERS


@blueprint.route("/arbiters", methods=["GET"])
@query({
    "search": fields.Str(required=False, missing=None)
})
@admin_auth_required
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
@body({
    "proposalId": fields.Int(required=True),
    "userId": fields.Int(required=True),
})
@admin_auth_required
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
@query({
    "page": fields.Int(required=False, missing=None),
    "filters": fields.List(fields.Str(), required=False, missing=None),
    "search": fields.Str(required=False, missing=None),
    "sort": fields.Str(required=False, missing=None),
})
@admin_auth_required
def get_proposals(page, filters, search, sort):
    print(filters)
    page = pagination.proposal(
        schema=proposals_schema,
        query=Proposal.query,
        page=page,
        filters=filters,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route('/proposals/<id>', methods=['GET'])
@admin_auth_required
def get_proposal(id):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if proposal:
        return proposal_schema.dump(proposal)
    return {"message": f"Could not find proposal with id {id}"}, 404


@blueprint.route('/proposals/<id>', methods=['DELETE'])
@admin_auth_required
def delete_proposal(id):
    return {"message": "Not implemented."}, 400


@blueprint.route('/proposals/<id>', methods=['PUT'])
@body({
    "contributionMatching": fields.Int(required=True)
})
@admin_auth_required
def update_proposal(id, contribution_matching):
    proposal = Proposal.query.filter(Proposal.id == id).first()
    if proposal:
        proposal.set_contribution_matching(float(contribution_matching))
        db.session.commit()
        return proposal_schema.dump(proposal)

    return {"message": f"Could not find proposal with id {id}"}, 404


@blueprint.route('/proposals/<proposal_id>/approve', methods=['PUT'])
@body({
    "isApprove": fields.Bool(required=True),
    "rejectReason": fields.Str(required=False, missing=None)
})
@admin_auth_required
def approve_proposal(proposal_id, is_approve, reject_reason=None):
    proposal = Proposal.query.filter_by(id=proposal_id).first()
    if proposal:
        proposal.approve_pending(is_approve, reject_reason)
        db.session.commit()
        return proposal_schema.dump(proposal)

    return {"message": "No proposal found."}, 404


@blueprint.route("/proposals/<id>/milestone/<mid>/paid", methods=["PUT"])
@body({
    "txId": fields.Str(required=True),
})
@admin_auth_required
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
@admin_auth_required
def get_email_example(type):
    email = generate_email(type, example_email_args.get(type))
    if email['info'].get('subscription'):
        # Unserializable, so remove
        email['info'].pop('subscription', None)
    return email


# Requests for Proposal


@blueprint.route('/rfps', methods=['GET'])
@admin_auth_required
def get_rfps():
    rfps = RFP.query.all()
    return admin_rfps_schema.dump(rfps)


@blueprint.route('/rfps', methods=['POST'])
@body({
    "title": fields.Str(required=True),
    "brief": fields.Str(required=True),
    "content": fields.Str(required=True),
    "category": fields.Str(required=True),
    "bounty": fields.Str(required=True),
    "matching": fields.Bool(required=True, default=False, missing=False),
    "dateCloses": fields.Int(required=True)
})
@admin_auth_required
def create_rfp(date_closes, **kwargs):
    rfp = RFP(
        **kwargs,
        date_closes=datetime.fromtimestamp(date_closes) if date_closes else None,
    )
    db.session.add(rfp)
    db.session.commit()
    return admin_rfp_schema.dump(rfp), 201


@blueprint.route('/rfps/<rfp_id>', methods=['GET'])
@admin_auth_required
def get_rfp(rfp_id):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    return admin_rfp_schema.dump(rfp)


@blueprint.route('/rfps/<rfp_id>', methods=['PUT'])
@body({
    "title": fields.Str(required=True),
    "brief": fields.Str(required=True),
    "content": fields.Str(required=True),
    "category": fields.Str(required=True),
    "bounty": fields.Str(required=True),
    "matching": fields.Bool(required=True, default=False, missing=False),
    "dateCloses": fields.Int(required=True)
})
@admin_auth_required
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
@admin_auth_required
def delete_rfp(rfp_id):
    rfp = RFP.query.filter(RFP.id == rfp_id).first()
    if not rfp:
        return {"message": "No RFP matching that id"}, 404

    db.session.delete(rfp)
    db.session.commit()
    return {"message": "ok"}, 200


# Contributions


@blueprint.route('/contributions', methods=['GET'])
@query({
    "page": fields.Int(required=False, missing=None),
    "filters": fields.List(fields.Str(), required=False, missing=None),
    "search": fields.Str(required=False, missing=None),
    "sort": fields.Str(required=False, missing=None)
})
@admin_auth_required
def get_contributions(page, filters, search, sort):
    print(filters)
    page = pagination.contribution(
        page=page,
        filters=filters,
        search=search,
        sort=sort,
    )
    return page


@blueprint.route('/contributions', methods=['POST'])
@body({
    "proposalId": fields.Int(required=True),
    "userId": fields.Int(required=True),
    "status": fields.Str(required=True),
    "amount": fields.Str(required=True),
    "txId": fields.Str(required=False, missing=None)
})
@admin_auth_required
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
    return proposal_contribution_schema.dump(contribution), 200


@blueprint.route('/contributions/<contribution_id>', methods=['GET'])
@admin_auth_required
def get_contribution(contribution_id):
    contribution = ProposalContribution.query.filter(ProposalContribution.id == contribution_id).first()
    if not contribution:
        return {"message": "No contribution matching that id"}, 404

    return proposal_contribution_schema.dump(contribution), 200


@blueprint.route('/contributions/<contribution_id>', methods=['PUT'])
@blueprint.route('/contributions', methods=['POST'])
@body({
    "proposalId": fields.Int(required=False, missing=None),
    "userId": fields.Int(required=False, missing=None),
    "status": fields.Str(required=False, missing=None),
    "amount": fields.Str(required=False, missing=None),
    "txId": fields.Str(required=False, missing=None)
})
@admin_auth_required
def edit_contribution(contribution_id, proposal_id, user_id, status, amount, tx_id):
    contribution = ProposalContribution.query.filter(ProposalContribution.id == contribution_id).first()
    if not contribution:
        return {"message": "No contribution matching that id"}, 404

    # do not allow editing contributions once a proposal has become funded
    if contribution.proposal.is_funded:
        return {"message": "Cannot edit contributions to fully-funded proposals"}, 400

    print((contribution_id, proposal_id, user_id, status, amount, tx_id))

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
    if tx_id:
        contribution.tx_id = tx_id

    db.session.add(contribution)
    db.session.flush()

    contribution.proposal.set_pending_when_ready()
    contribution.proposal.set_funded_when_ready()

    db.session.commit()
    return proposal_contribution_schema.dump(contribution), 200
