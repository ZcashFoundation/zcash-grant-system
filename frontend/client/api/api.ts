import axios from './axios';
import { Proposal, TeamMember, Update } from 'types';
import {
  formatProposalFromGet,
  formatTeamMemberForPost,
  formatTeamMemberFromGet,
} from 'utils/api';
import { PROPOSAL_CATEGORY } from './constants';

export function getProposals(): Promise<{ data: Proposal[] }> {
  return axios.get('/api/v1/proposals/').then(res => {
    res.data = res.data.map(formatProposalFromGet);
    return res;
  });
}

export function getProposal(proposalId: number | string): Promise<{ data: Proposal }> {
  return axios.get(`/api/v1/proposals/${proposalId}`).then(res => {
    res.data = formatProposalFromGet(res.data);
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
  signedMessage: string;
  rawTypedData: string;
}): Promise<{ data: TeamMember }> {
  return axios.post('/api/v1/users', payload).then(res => {
    res.data = formatTeamMemberFromGet(res.data);
    return res;
  });
}

export function authUser(payload: {
  accountAddress: string;
  signedMessage: string;
  rawTypedData: string;
}): Promise<{ data: TeamMember }> {
  return axios.post('/api/v1/users/auth', payload).then(res => {
    res.data = formatTeamMemberFromGet(res.data);
    return res;
  });
}

export function updateUser(user: TeamMember): Promise<{ data: TeamMember }> {
  return axios
    .put(`/api/v1/users/${user.ethAddress}`, formatTeamMemberForPost(user))
    .then(res => {
      res.data = formatTeamMemberFromGet(res.data);
      return res;
    });
}

export function verifyEmail(code: string): Promise<any> {
  return axios.post(`/api/v1/email/${code}/verify`);
}

export async function fetchCrowdFundFactoryJSON(): Promise<any> {
  const res = await axios.get(process.env.CROWD_FUND_FACTORY_URL as string);
  return res.data;
}

export async function fetchCrowdFundJSON(): Promise<any> {
  const res = await axios.get(process.env.CROWD_FUND_URL as string);
  return res.data;
}

export function postProposalUpdate(
  proposalId: number,
  title: string,
  content: string,
): Promise<{ data: Update }> {
  return axios.post(`/api/v1/proposals/${proposalId}/updates`, {
    title,
    content,
  });
}
