import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { ProposalRevision } from 'components/Proposal/Revisions';
import { Revision, RevisionChange, REVISION_CHANGE_TYPES } from 'types';

const {
  MILESTONE_ADD,
  MILESTONE_REMOVE,
  MILESTONE_EDIT_TITLE,
  MILESTONE_EDIT_AMOUNT,
  MILESTONE_EDIT_CONTENT,
  MILESTONE_EDIT_DAYS,
  MILESTONE_EDIT_IMMEDIATE_PAYOUT,
  MILESTONE_EDIT_PERCENT,
  PROPOSAL_EDIT_BRIEF,
  PROPOSAL_EDIT_CONTENT,
  PROPOSAL_EDIT_TARGET,
  PROPOSAL_EDIT_TITLE,
} = REVISION_CHANGE_TYPES;

const minute = 1000 * 60;
const hour = minute * 60;
const day = 24 * hour;
const week = day * 7;

const now = Date.now();

const oneWeekAgo = now - week;
const twoDaysAgo = now - 2 * day;
const oneHourAgo = now - hour;

const fakeUser: any = {
  displayName: 'Alice',
};

const revision1Changes: RevisionChange[] = [
  {
    type: PROPOSAL_EDIT_TITLE,
  },
  {
    type: MILESTONE_EDIT_TITLE,
    milestoneIndex: 2,
  },
  {
    type: MILESTONE_EDIT_DAYS,
    milestoneIndex: 2,
  },
  {
    type: MILESTONE_REMOVE,
    milestoneIndex: 3,
  },
];

const revision2Changes: RevisionChange[] = [
  {
    type: PROPOSAL_EDIT_BRIEF,
  },
  {
    type: PROPOSAL_EDIT_CONTENT,
  },
  {
    type: PROPOSAL_EDIT_TARGET,
  },
  {
    type: MILESTONE_EDIT_PERCENT,
    milestoneIndex: 1,
  },
  {
    type: MILESTONE_EDIT_PERCENT,
    milestoneIndex: 2,
  },
];

const revision3Changes: RevisionChange[] = [
  {
    type: MILESTONE_EDIT_AMOUNT,
    milestoneIndex: 0,
  },
  {
    type: MILESTONE_EDIT_CONTENT,
    milestoneIndex: 0,
  },
  {
    type: MILESTONE_EDIT_IMMEDIATE_PAYOUT,
    milestoneIndex: 0,
  },
  {
    type: MILESTONE_ADD,
    milestoneIndex: 3,
  },
];

const revision1: Revision = {
  revisionId: '0',
  revisionIndex: 0,
  author: fakeUser,
  dateCreated: oneWeekAgo / 1000,
  changes: revision1Changes,
  proposalArchiveId: '0',
  proposalId: '0',
};

const revision2: Revision = {
  author: fakeUser,
  dateCreated: twoDaysAgo / 1000,
  changes: revision2Changes,
  revisionId: '0',
  revisionIndex: 1,
  proposalArchiveId: '0',
  proposalId: '0',
};

const revision3: Revision = {
  author: fakeUser,
  dateCreated: oneHourAgo / 1000,
  changes: revision3Changes,
  revisionId: '0',
  revisionIndex: 2,
  proposalArchiveId: '0',
  proposalId: '0',
};

const revisions: Revision[] = [revision1, revision2, revision3];

// tslint:disable-next-line
const stubbed: any = () => {};

storiesOf('RevisionTab', module).add('basic', () => (
  <div style={{ padding: '1rem' }}>
    <ProposalRevision
      proposalId={0}
      revisions={revisions}
      fetchProposalRevisions={stubbed}
      isFetchingRevisions={false}
      revisionsError={null}
    />
  </div>
));
