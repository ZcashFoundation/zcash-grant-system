import json
import datetime
from mock import patch
from grant.proposal.models import Proposal, db, proposal_schema
from grant.milestone.models import Milestone
from grant.task.models import Task
from grant.task.jobs import MilestoneDeadline
from grant.utils.enums import ProposalStatus, Category, MilestoneStage
from ..config import BaseUserConfig
from ..test_data import test_team, mock_blockchain_api_requests


test_milestones = [
    {
        "title": "first milestone",
        "content": "content",
        "daysEstimated": "30",
        "payoutPercent": "25",
        "immediatePayout": False
    },
    {
        "title": "second milestone",
        "content": "content",
        "daysEstimated": "10",
        "payoutPercent": "25",
        "immediatePayout": False
    },
    {
        "title": "third milestone",
        "content": "content",
        "daysEstimated": "20",
        "payoutPercent": "25",
        "immediatePayout": False
    },
    {
        "title": "fourth milestone",
        "content": "content",
        "daysEstimated": "30",
        "payoutPercent": "25",
        "immediatePayout": False
    }
]

test_proposal = {
    "team": test_team,
    "content": "## My Proposal",
    "title": "Give Me Money",
    "brief": "$$$",
    "milestones": test_milestones,
    "category": Category.ACCESSIBILITY,
    "target": "12345",
    "payoutAddress": "123",
}


class TestMilestoneMethods(BaseUserConfig):

    def init_proposal(self, proposal_data):
        self.login_default_user()
        resp = self.app.post(
            "/api/v1/proposals/drafts"
        )
        self.assertStatus(resp, 201)
        proposal_id = resp.json["proposalId"]

        resp = self.app.put(
            f"/api/v1/proposals/{proposal_id}",
            data=json.dumps(proposal_data),
            content_type='application/json'
        )
        self.assert200(resp)

        proposal = Proposal.query.get(proposal_id)
        proposal.status = ProposalStatus.PENDING

        # accept with funding
        proposal.approve_pending(True, True)
        Milestone.set_v2_date_estimates(proposal)

        db.session.add(proposal)
        db.session.commit()

        print(proposal_schema.dump(proposal))
        return proposal

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_set_v2_date_estimates(self, mock_get):
        proposal_data = test_proposal.copy()
        proposal = self.init_proposal(proposal_data)
        total_days_estimated = 0

        # make sure date_estimated has been populated on all milestones
        for milestone in proposal.milestones:
            total_days_estimated += int(milestone.days_estimated)
            self.assertIsNotNone(milestone.date_estimated)

        # check the proposal `date_approved` has been used for first milestone calculation
        first_milestone = proposal.milestones[0]
        expected_base_date = proposal.date_approved
        expected_days_estimated = first_milestone.days_estimated
        expected_date_estimated = expected_base_date + datetime.timedelta(days=int(expected_days_estimated))

        self.assertEqual(first_milestone.date_estimated, expected_date_estimated)

        # check that the `date_estimated` of the final milestone has been calculated with the cumulative
        # `days_estimated` of the previous milestones
        last_milestone = proposal.milestones[-1]
        expected_date_estimated = expected_base_date + datetime.timedelta(days=int(total_days_estimated))
        self.assertEqual(last_milestone.date_estimated, expected_date_estimated)

        # check to see a task has been created
        tasks = Task.query.filter_by(job_type=MilestoneDeadline.JOB_TYPE).all()
        self.assertEqual(len(tasks), 1)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_set_v2_date_estimates_immediate_payout(self, mock_get):
        proposal_data = test_proposal.copy()
        proposal_data["milestones"][0]["immediate_payout"] = True

        self.init_proposal(proposal_data)
        tasks = Task.query.filter_by(job_type=MilestoneDeadline.JOB_TYPE).all()

        # ensure MilestoneDeadline task not created when immediate payout is set
        self.assertEqual(len(tasks), 0)

    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_set_v2_date_estimates_deadline_recalculation(self, mock_get):
        proposal_data = test_proposal.copy()
        proposal = self.init_proposal(proposal_data)

        first_ms = proposal.milestones[0]
        second_ms = proposal.milestones[1]

        first_ms.stage = MilestoneStage.PAID
        first_ms.date_paid = datetime.datetime.now()

        expected_base_date = datetime.datetime.now() + datetime.timedelta(days=42)
        second_ms.stage = MilestoneStage.PAID
        second_ms.date_paid = expected_base_date

        db.session.add(proposal)
        db.session.commit()

        Milestone.set_v2_date_estimates(proposal)

        proposal = Proposal.query.get(proposal.id)
        third_ms = proposal.milestones[2]
        expected_date_estimated = expected_base_date + datetime.timedelta(days=int(third_ms.days_estimated))

        # ensure `date_estimated` was recalculated as expected
        self.assertEqual(third_ms.date_estimated, expected_date_estimated)
