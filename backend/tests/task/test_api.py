import json

from grant.utils import totp_2fa
from grant.task.jobs import MilestoneDeadline
from datetime import datetime, timedelta

from grant.task.models import Task, db
from grant.task.jobs import PruneDraft
from grant.milestone.models import Milestone
from grant.proposal.models import Proposal, ProposalUpdate
from grant.utils.enums import ProposalStatus, ProposalStage, Category

from ..config import BaseProposalCreatorConfig
from ..test_data import mock_blockchain_api_requests

from mock import patch, Mock

test_update = {
    "title": "Update Title",
    "content": "Update content."
}

milestones_data = [
    {
        "title": "All the money straightaway",
        "content": "cool stuff with it",
        "days_estimated": 30,
        "payout_percent": "100",
        "immediate_payout": False
    }
]

class TestTaskAPI(BaseProposalCreatorConfig):
    def p(self, path, data):
        return self.app.post(path, data=json.dumps(data), content_type="application/json")

    def login_admin(self):
        # set admin
        self.user.set_admin(True)
        db.session.commit()

        # login
        r = self.p("/api/v1/admin/login", {
            "username": self.user.email_address,
            "password": self.user_password
        })
        self.assert200(r)

        # 2fa on the natch
        r = self.app.get("/api/v1/admin/2fa")
        self.assert200(r)

        # ... init
        r = self.app.get("/api/v1/admin/2fa/init")
        self.assert200(r)

        codes = r.json['backupCodes']
        secret = r.json['totpSecret']
        uri = r.json['totpUri']

        # ... enable/verify
        r = self.p("/api/v1/admin/2fa/enable", {
            "backupCodes": codes,
            "totpSecret": secret,
            "verifyCode": totp_2fa.current_totp(secret)
        })
        self.assert200(r)
        return r

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

    @patch('grant.task.jobs.send_email')
    @patch('grant.task.views.datetime')
    @patch('requests.get', side_effect=mock_blockchain_api_requests)
    def test_milestone_deadline(self, mock_get, mock_datetime, mock_send_email):
        tasks = Task.query.filter_by(completed=False).all()
        self.assertEqual(len(tasks), 0)

        self.proposal.arbiter.user = self.user
        db.session.add(self.proposal)

        # unset immediate_payout so task will be added
        for milestone in self.proposal.milestones:
            if milestone.immediate_payout:
                milestone.immediate_payout = False
                db.session.add(milestone)

        db.session.commit()

        self.login_admin()

        # proposal needs to be PENDING
        self.proposal.status = ProposalStatus.PENDING

        # approve proposal with funding
        resp = self.app.put(
            "/api/v1/admin/proposals/{}/accept".format(self.proposal.id),
            data=json.dumps({"isAccepted": True, "withFunding": True})
        )
        self.assert200(resp)

        tasks = Task.query.filter_by(completed=False).all()
        self.assertEqual(len(tasks), 1)

        # fast forward the clock so task will run
        after_time = datetime.now() + timedelta(days=365)
        mock_datetime.now = Mock(return_value=after_time)

        # run task
        resp = self.app.get("/api/v1/task")
        self.assert200(resp)

        # make sure task ran
        tasks = Task.query.filter_by(completed=False).all()
        self.assertEqual(len(tasks), 0)
        mock_send_email.assert_called()

    @patch('grant.task.jobs.send_email')
    def test_milestone_deadline_update_posted(self, mock_send_email):
        tasks = Task.query.all()
        self.assertEqual(len(tasks), 0)

        # set date_estimated on milestone to be in the past
        milestone = self.proposal.milestones[0]
        milestone.date_estimated = datetime.now() - timedelta(hours=1)
        db.session.add(milestone)
        db.session.commit()

        # make task
        ms_deadline = MilestoneDeadline(self.proposal, milestone)
        ms_deadline.make_task()

        # check make task
        tasks = Task.query.all()
        self.assertEqual(len(tasks), 1)

        # login and post proposal update
        self.login_default_user()
        resp = self.app.post(
            "/api/v1/proposals/{}/updates".format(self.proposal.id),
            data=json.dumps(test_update),
            content_type='application/json'
        )
        self.assertStatus(resp, 201)

        # run task
        resp = self.app.get("/api/v1/task")
        self.assert200(resp)

        # make sure task ran and did NOT send out an email
        tasks = Task.query.filter_by(completed=False).all()
        self.assertEqual(len(tasks), 0)
        mock_send_email.assert_not_called()

    @patch('grant.task.jobs.send_email')
    def test_milestone_deadline_noops(self, mock_send_email):
        # make sure all milestone deadline noop states work as expected

        def proposal_delete(p, m):
            db.session.delete(p)

        def proposal_status(p, m):
            p.status = ProposalStatus.DELETED
            db.session.add(p)

        def proposal_stage(p, m):
            p.stage = ProposalStage.CANCELED
            db.session.add(p)

        def milestone_delete(p, m):
            db.session.delete(m)

        def milestone_date_requested(p, m):
            m.date_requested = datetime.now()
            db.session.add(m)

        def update_posted(p, m):
            # login and post proposal update
            self.login_default_user()
            resp = self.app.post(
                "/api/v1/proposals/{}/updates".format(proposal.id),
                data=json.dumps(test_update),
                content_type='application/json'
            )
            self.assertStatus(resp, 201)

        modifiers = [
            proposal_delete,
            proposal_status,
            proposal_stage,
            milestone_delete,
            milestone_date_requested,
            update_posted
        ]

        for modifier in modifiers:
            # make proposal and milestone
            proposal = Proposal.create(status=ProposalStatus.LIVE)
            proposal.arbiter.user = self.other_user
            proposal.team.append(self.user)
            proposal_id = proposal.id
            Milestone.make(milestones_data, proposal)

            db.session.add(proposal)
            db.session.commit()

            # grab update count for blob
            update_count = len(ProposalUpdate.query.filter_by(proposal_id=proposal_id).all())

            # run modifications to trigger noop
            proposal = Proposal.query.get(proposal_id)
            milestone = proposal.milestones[0]
            milestone_id = milestone.id
            modifier(proposal, milestone)
            db.session.commit()

            # make task
            blob = {
                "proposal_id": proposal_id,
                "milestone_id": milestone_id,
                "update_count": update_count
            }
            task = Task(
                job_type=MilestoneDeadline.JOB_TYPE,
                blob=blob,
                execute_after=datetime.now()
            )

            # run task
            MilestoneDeadline.process_task(task)

            # check to make sure noop occurred
            mock_send_email.assert_not_called()
