import { PROPOSAL_STATUS } from 'src/types';

export interface ProposalStatusSoT {
  id: PROPOSAL_STATUS;
  filterDisplay: string;
  tagDisplay: string;
  tagColor: string;
  hint: string;
}

const STATUSES: ProposalStatusSoT[] = [
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
];

export const getStatusById = (id: PROPOSAL_STATUS) => {
  const result = STATUSES.find(s => s.id === id);
  if (!result) {
    throw Error(`getStatusById: could not find status for '${id}'`);
  }
  return result;
};

export default STATUSES;
