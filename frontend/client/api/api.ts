import axios from './axios';
import { Proposal, ProposalDraft, TeamMember, Update } from 'types';
import {
  formatTeamMemberForPost,
  formatTeamMemberFromGet,
  generateProposalUrl,
} from 'utils/api';

export function getProposals(): Promise<{ data: Proposal[] }> {
  return axios.get('/api/v1/proposals/').then(res => {
    res.data = res.data.map((proposal: any) => {
      proposal.team = proposal.team.map(formatTeamMemberFromGet);
      proposal.proposalUrlId = generateProposalUrl(proposal.proposalId, proposal.title);
      return proposal;
    });
    return res;
  });
}

export function getProposal(proposalId: number | string): Promise<{ data: Proposal }> {
  return axios.get(`/api/v1/proposals/${proposalId}`).then(res => {
    res.data.team = res.data.team.map(formatTeamMemberFromGet);
    res.data.proposalUrlId = generateProposalUrl(res.data.proposalId, res.data.title);
    return res;
  });
}

export function getProposalComments(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/comments`);
}

export function getProposalUpdates(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/updates`);
}

export function postProposal(payload: ProposalDraft) {
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

export function getProposalDrafts(): Promise<{ data: ProposalDraft[] }> {
  return axios.get('/api/v1/proposals/drafts').then(res => {
    res.data = res.data.map((draft: any) => ({
      ...draft,
      team: draft.team.map(formatTeamMemberFromGet),
    }));
    return res;
  });
}

export function postProposalDraft(): Promise<{ data: ProposalDraft }> {
  return axios.post('/api/v1/proposals/drafts');
}

export function putProposal(proposal: ProposalDraft): Promise<{ data: ProposalDraft }> {
  // Exclude some keys
  const { proposalId, stage, dateCreated, team, ...rest } = proposal;
  return axios.put(`/api/v1/proposals/${proposal.proposalId}`, rest);
}
