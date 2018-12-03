import axios from './axios';
import {
  Proposal,
  ProposalDraft,
  User,
  Update,
  TeamInvite,
  TeamInviteWithProposal,
  Contribution,
} from 'types';
import { formatUserForPost, formatProposalFromGet, formatUserFromGet } from 'utils/api';

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

export function postProposal(payload: ProposalDraft) {
  return axios.post(`/api/v1/proposals/`, {
    ...payload,
    // Team has a different shape for POST
    team: payload.team.map(formatUserForPost),
  });
}

export function getUser(address: string): Promise<{ data: User }> {
  return axios
    .get(`/api/v1/users/${address}`, {
      params: {
        withProposals: true,
        withComments: true,
        withFunded: true,
      },
    })
    .then(res => {
      res.data = formatUserFromGet(res.data);
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
}): Promise<{ data: User }> {
  return axios.post('/api/v1/users', payload);
}

export function authUser(payload: {
  accountAddress: string;
  signedMessage: string;
  rawTypedData: string;
}): Promise<{ data: User }> {
  return axios.post('/api/v1/users/auth', payload);
}

export function updateUser(user: User): Promise<{ data: User }> {
  return axios.put(`/api/v1/users/${user.accountAddress}`, formatUserForPost(user));
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

export function getProposalDrafts(): Promise<{ data: ProposalDraft[] }> {
  return axios.get('/api/v1/proposals/drafts');
}

export function postProposalDraft(): Promise<{ data: ProposalDraft }> {
  return axios.post('/api/v1/proposals/drafts');
}

export function deleteProposalDraft(proposalId: number): Promise<any> {
  return axios.delete(`/api/v1/proposals/${proposalId}`);
}

export function putProposal(proposal: ProposalDraft): Promise<{ data: ProposalDraft }> {
  // Exclude some keys
  const { proposalId, stage, dateCreated, team, ...rest } = proposal;
  return axios.put(`/api/v1/proposals/${proposal.proposalId}`, rest);
}

export function putProposalPublish(
  proposal: ProposalDraft,
  contractAddress: string,
): Promise<{ data: ProposalDraft }> {
  return axios.put(`/api/v1/proposals/${proposal.proposalId}/publish`, {
    contractAddress,
  });
}

export function postProposalInvite(
  proposalId: number,
  address: string,
): Promise<{ data: TeamInvite }> {
  return axios.post(`/api/v1/proposals/${proposalId}/invite`, { address });
}

export function deleteProposalInvite(
  proposalId: number,
  inviteIdOrAddress: number | string,
): Promise<{ data: TeamInvite }> {
  return axios.delete(`/api/v1/proposals/${proposalId}/invite/${inviteIdOrAddress}`);
}

export function fetchUserInvites(
  userid: string | number,
): Promise<{ data: TeamInviteWithProposal[] }> {
  return axios.get(`/api/v1/users/${userid}/invites`);
}

export function putInviteResponse(
  userid: string | number,
  inviteid: string | number,
  response: boolean,
): Promise<{ data: void }> {
  return axios.put(`/api/v1/users/${userid}/invites/${inviteid}/respond`, {
    response,
  });
}

export function postProposalContribution(
  proposalId: number,
  txId: string,
  fromAddress: string,
  amount: string,
): Promise<{ data: Contribution }> {
  return axios.post(`/api/v1/proposals/${proposalId}/contributions`, {
    txId,
    fromAddress,
    amount,
  });
}

export function postProposalComment(payload: {
  proposalId: number;
  parentCommentId?: number;
  comment: string;
  signedMessage: string;
  rawTypedData: string;
}): Promise<{ data: any }> {
  const { proposalId, ...args } = payload;
  return axios.post(`/api/v1/proposals/${proposalId}/comments`, args);
}
