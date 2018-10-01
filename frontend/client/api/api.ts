import axios from './axios';
import { Proposal } from 'modules/proposals/reducers';
import { TeamMember } from 'modules/create/types';
import { formatTeamMemberForPost, formatTeamMemberFromGet } from 'utils/api';
import { PROPOSAL_CATEGORY } from './constants';

export function getProposals(): Promise<{ data: Proposal[] }> {
  return axios.get('/api/v1/proposals/').then(res => {
    res.data = res.data.map((proposal: any) => {
      proposal.team = proposal.team.map(formatTeamMemberFromGet);
      return proposal;
    });
    return res;
  });
}

export function getProposal(proposalId: number | string): Promise<{ data: Proposal }> {
  return axios.get(`/api/v1/proposals/${proposalId}`).then(res => {
    res.data.team = res.data.team.map(formatTeamMemberFromGet);
    return res;
  });
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
  team: TeamMember[];
}) {
  return axios.post(`/api/v1/proposals/`, {
    ...payload,
    // Team has a different shape for POST
    team: payload.team.map(formatTeamMemberForPost),
  });
}

export function getUser(address: string): Promise<{ data: TeamMember }> {
  return axios.get(`/api/v1/users/${address}`).then(res => {
    res.data = formatTeamMemberFromGet(res.data);
    return res;
  });
}

export function createUser(payload: {
  accountAddress: string;
  emailAddress: string;
  displayName: string;
  title: string;
  token: string;
}): Promise<{ data: TeamMember }> {
  return axios.post(`/api/v1/users/`, payload).then(res => {
    res.data = formatTeamMemberFromGet(res.data);
    return res;
  });
}
