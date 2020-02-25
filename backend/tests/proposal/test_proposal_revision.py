
from ..config import BaseProposalCreatorConfig
import json
from grant.proposal.models import Proposal, ProposalRevision
from grant.utils.enums import ProposalChange
from ..test_data import test_team


test_milestones_a = [
    {
        "title": "first milestone a",
        "content": "content a",
        "daysEstimated": "30",
        "payoutPercent": "25",
        "immediatePayout": False
    },
    {
        "title": "second milestone a",
        "content": "content a",
        "daysEstimated": "10",
        "payoutPercent": "25",
        "immediatePayout": False
    },
    {
        "title": "third milestone a",
        "content": "content a",
        "daysEstimated": "20",
        "payoutPercent": "25",
        "immediatePayout": False
    },
    {
        "title": "fourth milestone a",
        "content": "content a",
        "daysEstimated": "30",
        "payoutPercent": "25",
        "immediatePayout": False
    }
]

test_proposal_a = {
    "team": test_team,
    "content": "## My Proposal A",
    "title": "Give Me Money A",
    "brief": "$$$ A",
    "milestones": test_milestones_a,
    "target": "200",
    "payoutAddress": "123",
}

test_milestones_b = [
    {
        "title": "first milestone b",
        "content": "content b",
        "daysEstimated": "30",
        "payoutPercent": "25",
        "immediatePayout": True
    },
    {
        "title": "second milestone b",
        "content": "content b",
        "daysEstimated": "40",
        "payoutPercent": "75",
        "immediatePayout": False
    }
]

test_proposal_b = {
    "team": test_team,
    "content": "## My Proposal B",
    "title": "Give Me Money B",
    "brief": "$$$ B",
    "milestones": test_milestones_b,
    "target": "100",
    "payoutAddress": "123",
}

test_proposal_c = {
    "team": test_team,
    "content": "## My Proposal C",
    "title": "Give Me Money C",
    "brief": "$$$ C",
    "milestones": test_milestones_b,
    "target": "100",
    "payoutAddress": "123",
}

test_proposal_d = {
    "team": test_team,
    "content": "## My Proposal B",
    "title": "Give Me Money B",
    "brief": "$$$ B",
    "milestones": test_milestones_b,
    "target": "200",
    "payoutAddress": "123",
}


class TestProposalMethods(BaseProposalCreatorConfig):
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
        return proposal_id

    def validate_changes(self, changes, expected_change, expected_milestone_index=None):
        if expected_milestone_index is not None:
            change = {"type": expected_change, "milestone_index": expected_milestone_index}
        else:
            change = {"type": expected_change}

        self.assertTrue(change in changes)

    def test_calculate_milestone_changes_no_changes(self):
        old_proposal_id = self.init_proposal(test_proposal_a)
        new_proposal_id = self.init_proposal(test_proposal_a)
        old_proposal = Proposal.query.get(old_proposal_id)
        new_proposal = Proposal.query.get(new_proposal_id)

        changes = ProposalRevision.calculate_milestone_changes(old_proposal.milestones, new_proposal.milestones)
        self.assertEqual(len(changes), 0)

    def test_calculate_milestone_changes_a_to_b(self):
        old_proposal_id = self.init_proposal(test_proposal_a)
        new_proposal_id = self.init_proposal(test_proposal_b)
        old_proposal = Proposal.query.get(old_proposal_id)
        new_proposal = Proposal.query.get(new_proposal_id)

        changes = ProposalRevision.calculate_milestone_changes(old_proposal.milestones, new_proposal.milestones)

        print(changes)

        # going from milestones a to b, there should be 9 total changes
        self.assertEqual(len(changes), 9)

        # the following change types should be detected
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_TITLE, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_CONTENT, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_IMMEDIATE_PAYOUT, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_TITLE, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_CONTENT, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_DAYS, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_PERCENT, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_REMOVE, 2)
        self.validate_changes(changes, ProposalChange.MILESTONE_REMOVE, 3)

    def test_calculate_milestone_changes_b_to_a(self):
        old_proposal_id = self.init_proposal(test_proposal_b)
        new_proposal_id = self.init_proposal(test_proposal_a)
        old_proposal = Proposal.query.get(old_proposal_id)
        new_proposal = Proposal.query.get(new_proposal_id)

        changes = ProposalRevision.calculate_milestone_changes(old_proposal.milestones, new_proposal.milestones)

        print(changes)

        # going from milestones b to a, there should be 9 total changes
        self.assertEqual(len(changes), 9)

        # the following change types should be detected
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_TITLE, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_CONTENT, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_IMMEDIATE_PAYOUT, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_TITLE, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_CONTENT, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_DAYS, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_PERCENT, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_ADD, 2)
        self.validate_changes(changes, ProposalChange.MILESTONE_ADD, 3)

    def test_calculate_proposal_changes_c_to_d(self):
        old_proposal_id = self.init_proposal(test_proposal_c)
        new_proposal_id = self.init_proposal(test_proposal_d)
        old_proposal = Proposal.query.get(old_proposal_id)
        new_proposal = Proposal.query.get(new_proposal_id)

        changes = ProposalRevision.calculate_proposal_changes(old_proposal, new_proposal)

        print(changes)

        # going from proposal c to d, there should be 4 total changes
        self.assertEqual(len(changes), 4)

        # the following change types should be detected
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_CONTENT)
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_TITLE)
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_BRIEF)
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_TARGET)

    def test_calculate_proposal_changes_d_to_a(self):
        old_proposal_id = self.init_proposal(test_proposal_d)
        new_proposal_id = self.init_proposal(test_proposal_a)
        old_proposal = Proposal.query.get(old_proposal_id)
        new_proposal = Proposal.query.get(new_proposal_id)

        changes = ProposalRevision.calculate_proposal_changes(old_proposal, new_proposal)

        print(changes)

        # going from proposal d to a, there should be 4 total changes
        self.assertEqual(len(changes), 12)

        # the following proposal change types should be detected
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_CONTENT)
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_TITLE)
        self.validate_changes(changes, ProposalChange.PROPOSAL_EDIT_BRIEF)

        # the following milestone change types should be detected
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_TITLE, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_CONTENT, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_IMMEDIATE_PAYOUT, 0)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_TITLE, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_CONTENT, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_DAYS, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_EDIT_PERCENT, 1)
        self.validate_changes(changes, ProposalChange.MILESTONE_ADD, 2)
        self.validate_changes(changes, ProposalChange.MILESTONE_ADD, 3)









