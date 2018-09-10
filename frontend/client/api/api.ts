import axios from './axios';
import { Proposal } from 'modules/proposals/reducers';

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
  accountAddress;
  crowdFundContractAddress;
  content;
  title;
  milestones;
}) {
  return axios.post(`/api/proposals/create`, payload);
}
