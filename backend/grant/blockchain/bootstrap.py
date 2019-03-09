from datetime import datetime, timedelta

from grant.proposal.models import ProposalContribution
from grant.utils.requests import blockchain_post
from grant.utils.enums import ContributionStatus


def make_bootstrap_data():
    pending_contributions = ProposalContribution.query \
        .filter_by(status=ContributionStatus.PENDING) \
        .filter(ProposalContribution.date_created + timedelta(hours=24) > datetime.now()) \
        .all()
    latest_contribution = ProposalContribution.query \
        .filter_by(status=ContributionStatus.CONFIRMED) \
        .order_by(ProposalContribution.date_created.desc()) \
        .first()
    serialized_pending_contributions = list(map(lambda c: {"id": c.id}, pending_contributions))
    return {
        "pendingContributions": serialized_pending_contributions,
        "latestTxId": latest_contribution.tx_id if latest_contribution else None,
    }


def send_bootstrap_data():
    data = make_bootstrap_data()
    print('Sending bootstrap data to blockchain watcher microservice')
    print(' * Latest transaction ID: {}'.format(data['latestTxId']))
    print(' * Number of pending contributions: {}'.format(len(data['pendingContributions'])))

    res = blockchain_post('/bootstrap', data)
    print('Blockchain watcher has started')
    print('Starting chain height: {}'.format(res['startHeight']))
    print('Current chain height: {}'.format(res['currentHeight']))
