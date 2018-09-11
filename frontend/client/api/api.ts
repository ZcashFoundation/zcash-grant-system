import axios from './axios';
import { Proposal } from 'modules/proposals/reducers';
import { PROPOSAL_CATEGORY } from './constants';

export function getProposals(): Promise<{ data: Proposal[] }> {
  return axios.get('/api/proposals/');
}

export function getProposal(proposalId: number | string): Promise<{ data: Proposal }> {
  return axios.get(`/api/proposals/${proposalId}`);
}

export function getProposalComments(proposalId: number | string) {
  return axios.get(`/api/proposals/${proposalId}/comments`);
}

export function getProposalUpdates(proposalId: number | string) {
  return axios.get(`/api/proposals/${proposalId}/updates`);
}

export function postProposal(payload: {
  accountAddress: string;
  crowdFundContractAddress: string;
  content: string;
  title: string;
  category: PROPOSAL_CATEGORY;
  milestones: object[]; // TODO: Type me
}) {
  return axios.post(`/api/proposals/create`, payload);
}
