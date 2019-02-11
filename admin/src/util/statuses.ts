import {
  PROPOSAL_STATUS,
  RFP_STATUS,
  CONTRIBUTION_STATUS,
  PROPOSAL_ARBITER_STATUS,
} from 'src/types';

export interface StatusSoT<E> {
  id: E;
  tagDisplay: string;
  tagColor: string;
  hint: string;
}

export const PROPOSAL_STATUSES: Array<StatusSoT<PROPOSAL_STATUS>> = [
  {
    id: PROPOSAL_STATUS.APPROVED,
    tagDisplay: 'Approved',
    tagColor: '#afd500',
    hint: 'Proposal has been approved and is awaiting being published by user.',
  },
  {
    id: PROPOSAL_STATUS.DELETED,
    tagDisplay: 'Deleted',
    tagColor: '#bebebe',
    hint: 'Proposal has been deleted and is not visible on the platform.',
  },
  {
    id: PROPOSAL_STATUS.DRAFT,
    tagDisplay: 'Draft',
    tagColor: '#8d8d8d',
    hint: 'Proposal is being created by the user.',
  },
  {
    id: PROPOSAL_STATUS.LIVE,
    tagDisplay: 'Live',
    tagColor: '#108ee9',
    hint: 'Proposal is live on the platform.',
  },
  {
    id: PROPOSAL_STATUS.PENDING,
    tagDisplay: 'Awaiting Approval',
    tagColor: '#ffaa00',
    hint: 'User is waiting for admin to approve or reject this Proposal.',
  },
  {
    id: PROPOSAL_STATUS.REJECTED,
    tagDisplay: 'Approval Rejected',
    tagColor: '#eb4118',
    hint:
      'Admin has rejected this proposal. User may adjust it and resubmit for approval.',
  },
  {
    id: PROPOSAL_STATUS.STAKING,
    tagDisplay: 'Staking',
    tagColor: '#722ed1',
    hint: 'This proposal is awaiting a staking contribution.',
  },
];

export const PROPOSAL_ARBITER_STATUSES: Array<StatusSoT<PROPOSAL_ARBITER_STATUS>> = [
  {
    id: PROPOSAL_ARBITER_STATUS.MISSING,
    tagDisplay: 'Missing',
    tagColor: '#cf00d5',
    hint: 'Proposal does not have an arbiter.',
  },
  {
    id: PROPOSAL_ARBITER_STATUS.NOMINATED,
    tagDisplay: 'Nominated',
    tagColor: '#cf00d5',
    hint: 'An arbiter has been nominated for this proposal.',
  },
  {
    id: PROPOSAL_ARBITER_STATUS.ACCEPTED,
    tagDisplay: 'Accepted',
    tagColor: '#cf00d5',
    hint: 'Proposal has an arbiter.',
  },
];

export const RFP_STATUSES: Array<StatusSoT<RFP_STATUS>> = [
  {
    id: RFP_STATUS.DRAFT,
    tagDisplay: 'Draft',
    tagColor: '#ffaa00',
    hint: 'RFP is currently being edited by admins and isn’t visible to users.',
  },
  {
    id: RFP_STATUS.LIVE,
    tagDisplay: 'Live',
    tagColor: '#108ee9',
    hint: 'RFP is live and users can submit proposals for it.',
  },
  {
    id: RFP_STATUS.CLOSED,
    tagDisplay: 'Closed',
    tagColor: '#eb4118',
    hint:
      'RFP has been closed to new submissions and will no longer be listed, but can still be viewed, and associated proposals will remain open.',
  },
];

export const CONTRIBUTION_STATUSES: Array<StatusSoT<CONTRIBUTION_STATUS>> = [
  {
    id: CONTRIBUTION_STATUS.PENDING,
    tagDisplay: 'Pending',
    tagColor: '#ffaa00',
    hint: 'Contribution is currently waiting to be sent and confirmed on chain',
  },
  {
    id: CONTRIBUTION_STATUS.CONFIRMED,
    tagDisplay: 'Confirmed',
    tagColor: '#108ee9',
    hint: 'Contribution was confirmed on chain with multiple block confirmations',
  },
  {
    id: CONTRIBUTION_STATUS.DELETED,
    tagDisplay: 'Closed',
    tagColor: '#eb4118',
    hint: 'User deleted the contribution before it was sent or confirmed',
  },
];

export function getStatusById<E>(statuses: Array<StatusSoT<E>>, id: E) {
  const result = statuses.find(s => s.id === id);
  if (!result) {
    throw Error(`getStatusById: could not find status for '${id}'`);
  }
  return result;
}
