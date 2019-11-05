from datetime import datetime, timedelta

from grant.task.models import Task, db
from grant.task.jobs import PruneDraft
from grant.milestone.models import Milestone
from grant.proposal.models import Proposal
from grant.utils.enums import ProposalStatus, Category

from mock import patch, Mock

from ..config import BaseProposalCreatorConfig


class TestTaskAPI(BaseProposalCreatorConfig):

    def test_proposal_reminder_task_is_created(self):
        tasks = Task.query.filter(Task.execute_after <= datetime.now()).filter_by(completed=False).all()
        self.assertEqual(tasks, [])
        self.make_proposal_reminder_task()
        tasks = Task.query.filter(Task.execute_after <= datetime.now()).filter_by(completed=False).all()
        self.assertEqual(len(tasks), 1)

    def test_proposal_reminder_task_is_marked_completed_after_call(self):
        self.make_proposal_reminder_task()
        tasks = Task.query.filter(Task.execute_after <= datetime.now()).filter_by(completed=False).all()
        self.assertEqual(len(tasks), 1)
        self.app.get("/api/v1/task")
        tasks = Task.query.filter(Task.execute_after <= datetime.now()).filter_by(completed=False).all()
        self.assertEqual(tasks, [])

    @patch('grant.task.views.datetime')
    def test_proposal_pruning(self, mock_datetime):
        self.login_default_user()
        resp = self.app.post(
            "/api/v1/proposals/drafts",
        )
        proposal_id = resp.json['proposalId']

        # make sure proposal was created
        proposal = Proposal.query.get(proposal_id)
        self.assertIsNotNone(proposal)

        # make sure the task was created
        self.assertStatus(resp, 201)
        tasks = Task.query.all()
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertEqual(resp.json['proposalId'], task.blob['proposal_id'])
        self.assertFalse(task.completed)

        # mock time so task will run when called
        after_time = datetime.now() + timedelta(seconds=PruneDraft.PRUNE_TIME + 100)
        mock_datetime.now = Mock(return_value=after_time)

        # run task
        resp = self.app.get("/api/v1/task")
        self.assert200(resp)

        # make sure task ran successfully
        tasks = Task.query.all()
        self.assertEqual(len(tasks), 1)
        task = tasks[0]
        self.assertTrue(task.completed)
        proposal = Proposal.query.get(proposal_id)
        self.assertIsNone(proposal)

    def test_proposal_pruning_noops(self):
        # ensure all proposal noop states work as expected

        def status(p):
            p.status = ProposalStatus.LIVE

        def title(p):
            p.title = 'title'

        def brief(p):
            p.brief = 'brief'

        def content(p):
            p.content = 'content'

        def category(p):
            p.category = Category.DEV_TOOL

        def target(p):
            p.target = '100'

        def payout_address(p):
            p.payout_address = 'address'

        def milestones(p):
            milestones_data = [
                {
                    "title": "All the money straightaway",
                    "content": "cool stuff with it",
                    "date_estimated": 1549505307,
                    "payout_percent": "100",
                    "immediate_payout": False
                }
            ]
            Milestone.make(milestones_data, p)

        modifiers = [
            status,
            title,
            brief,
            content,
            category,
            target,
            payout_address,
            milestones
        ]

        for modifier in modifiers:
            proposal = Proposal.create(status=ProposalStatus.DRAFT)
            proposal_id = proposal.id
            modifier(proposal)

            db.session.add(proposal)
            db.session.commit()

            blob = {
                "proposal_id": proposal_id,
            }

            task = Task(
                job_type=PruneDraft.JOB_TYPE,
                blob=blob,
                execute_after=datetime.now()
            )

            PruneDraft.process_task(task)

            proposal = Proposal.query.get(proposal_id)
            self.assertIsNotNone(proposal)
