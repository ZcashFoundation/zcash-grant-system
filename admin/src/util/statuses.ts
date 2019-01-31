import { PROPOSAL_STATUS, RFP_STATUS } from 'src/types';

export interface StatusSoT<E> {
  id: E;
  filterDisplay: string;
  tagDisplay: string;
  tagColor: string;
  hint: string;
}

export const PROPOSAL_STATUSES: Array<StatusSoT<PROPOSAL_STATUS>> = [
  {
    id: PROPOSAL_STATUS.APPROVED,
    filterDisplay: 'Status: approved',
    tagDisplay: 'Approved',
    tagColor: '#afd500',
    hint: 'Proposal has been approved and is awaiting being published by user.',
  },
  {
    id: PROPOSAL_STATUS.DELETED,
    filterDisplay: 'Status: deleted',
    tagDisplay: 'Deleted',
    tagColor: '#bebebe',
    hint: 'Proposal has been deleted and is not visible on the platform.',
  },
  {
    id: PROPOSAL_STATUS.DRAFT,
    filterDisplay: 'Status: draft',
    tagDisplay: 'Draft',
    tagColor: '#8d8d8d',
    hint: 'Proposal is being created by the user.',
  },
  {
    id: PROPOSAL_STATUS.LIVE,
    filterDisplay: 'Status: live',
    tagDisplay: 'Live',
    tagColor: '#108ee9',
    hint: 'Proposal is live on the platform.',
  },
  {
    id: PROPOSAL_STATUS.PENDING,
    filterDisplay: 'Status: pending',
    tagDisplay: 'Awaiting Approval',
    tagColor: '#ffaa00',
    hint: 'User is waiting for admin to approve or reject this Proposal.',
  },
  {
    id: PROPOSAL_STATUS.REJECTED,
    filterDisplay: 'Status: rejected',
    tagDisplay: 'Approval Rejected',
    tagColor: '#eb4118',
    hint:
      'Admin has rejected this proposal. User may adjust it and resubmit for approval.',
  },
  {
    id: PROPOSAL_STATUS.STAKING,
    filterDisplay: 'Status: staking',
    tagDisplay: 'Staking',
    tagColor: '#722ed1',
    hint: 'This proposal is awaiting a staking contribution.',
  },
];

export const RFP_STATUSES: Array<StatusSoT<RFP_STATUS>> = [
  {
    id: RFP_STATUS.DRAFT,
    filterDisplay: 'Status: draft',
    tagDisplay: 'Draft',
    tagColor: '#ffaa00',
    hint: 'RFP is currently being edited by admins and isn’t visible to users.',
  },
  {
    id: RFP_STATUS.LIVE,
    filterDisplay: 'Status: live',
    tagDisplay: 'Live',
    tagColor: '#108ee9',
    hint: 'RFP is live and users can submit proposals for it.',
  },
  {
    id: RFP_STATUS.CLOSED,
    filterDisplay: 'Status: closed',
    tagDisplay: 'Closed',
    tagColor: '#eb4118',
    hint:
      'RFP has been closed to new submissions and will no longer be listed, but can still be viewed, and associated proposals will remain open.',
  },
];

export function getStatusById<E>(statuses: Array<StatusSoT<E>>, id: E) {
  const result = statuses.find(s => s.id === id);
  if (!result) {
    throw Error(`getStatusById: could not find status for '${id}'`);
  }
  return result;
}
