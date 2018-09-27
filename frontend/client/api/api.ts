import axios from './axios';
import { Proposal } from 'modules/proposals/reducers';
import { TeamMember } from 'modules/create/types';
import { socialAccountsToUrls } from 'utils/social';
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
  team: TeamMember[];
}) {
  return axios.post(`/api/v1/proposals/`, {
    ...payload,
    // Team has a different shape for POST
    team: payload.team.map(u => ({
      displayName: u.name,
      title: u.title,
      accountAddress: u.ethAddress,
      emailAddress: u.emailAddress,
      avatar: { link: u.avatarUrl },
      socialMedias: socialAccountsToUrls(u.socialAccounts).map(url => ({
        link: url,
      })),
    })),
  });
}
