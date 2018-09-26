import axios from './axios';
import { Proposal } from 'modules/proposals/reducers';
import { PROPOSAL_CATEGORY } from './constants';

export function getProposals(): Promise<{ data: Proposal[] }> {
  return axios.get('/api/v1/proposals/');
}

export function getProposal(proposalId: number | string): Promise<{ data: Proposal }> {
  return axios.get(`/api/v1/proposals/${proposalId}`);
}

export function getProposalComments(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/comments`);
}

export function getProposalUpdates(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/updates`);
}

export function postProposal(payload: {
  // TODO type Milestone
  accountAddress: string;
  crowdFundContractAddress: string;
  content: string;
  title: string;
  category: PROPOSAL_CATEGORY;
  milestones: object[];
}) {
  return axios.post(`/api/v1/proposals/`, {
    ...payload,
    team: [{ accountAddress: payload.accountAddress }],
  });
}
