import axios from './axios';
import {
  Proposal,
  ProposalDraft,
  ProposalPage,
  User,
  Update,
  TeamInvite,
  TeamInviteWithProposal,
  SOCIAL_SERVICE,
  ContributionWithAddressesAndUser,
  EmailSubscriptions,
  RFP,
  ProposalPageParams,
  PageParams,
  UserSettings,
  CCR,
} from 'types';
import {
  formatUserForPost,
  formatProposalFromGet,
  formatUserFromGet,
  formatRFPFromGet,
  formatProposalPageParamsForGet,
  formatProposalPageFromGet,
} from 'utils/api';
import { CCRDraft } from 'types/ccr';

export function getProposals(page?: ProposalPageParams): Promise<{ data: ProposalPage }> {
  let serverParams;
  if (page) {
    serverParams = formatProposalPageParamsForGet(page);
  }
  return axios.get('/api/v1/proposals/', { params: serverParams || {} }).then(res => {
    res.data = formatProposalPageFromGet(res.data);
    return res;
  });
}

export function getProposal(proposalId: number | string): Promise<{ data: Proposal }> {
  return axios.get(`/api/v1/proposals/${proposalId}`).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
}

export function getArchivedProposal(
  proposalId: number | string,
): Promise<{ data: Proposal }> {
  return axios.get(`/api/v1/proposals/${proposalId}/archive`).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
}

export function followProposal(proposalId: number, isFollow: boolean) {
  return axios.put(`/api/v1/proposals/${proposalId}/follow`, { isFollow });
}

export function likeProposal(proposalId: number, isLiked: boolean) {
  return axios.put(`/api/v1/proposals/${proposalId}/like`, { isLiked });
}

export function likeRfp(rfpId: number, isLiked: boolean) {
  return axios.put(`/api/v1/rfps/${rfpId}/like`, { isLiked });
}

export function likeComment(commentId: number, isLiked: boolean) {
  return axios
    .put(`/api/v1/comment/${commentId}/like`, { isLiked })
    .then(({ data }) => data);
}

export function getProposalComments(proposalId: number | string, params: PageParams) {
  return axios.get(`/api/v1/proposals/${proposalId}/comments`, { params });
}

export function reportProposalComment(proposalId: number, commentId: number) {
  return axios.put(`/api/v1/proposals/${proposalId}/comments/${commentId}/report`);
}

export function getProposalUpdates(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/updates`);
}

export function getProposalRevisions(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/revisions`);
}

export function getProposalContributions(proposalId: number | string) {
  return axios.get(`/api/v1/proposals/${proposalId}/contributions`);
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
        withRequests: true,
        withProposals: true,
        withComments: true,
        withFunded: true,
        withPending: true,
        withArbitrated: true,
        withRejectedPermanently: true,
      },
    })
    .then(res => {
      res.data = formatUserFromGet(res.data);
      return res;
    });
}

export function createUser(user: {
  email: string;
  password: string;
  name: string;
  title: string;
}): Promise<{ data: User }> {
  const payload = {
    emailAddress: user.email,
    password: user.password,
    displayName: user.name,
    title: user.title,
  };
  return axios.post('/api/v1/users', payload);
}

export function authUser(payload: {
  email: string;
  password: string;
}): Promise<{ data: User }> {
  return axios.post('/api/v1/users/auth', payload);
}

export function logoutUser() {
  return axios.post('/api/v1/users/logout');
}

export function checkUserAuth(): Promise<{ data: User }> {
  return axios.get(`/api/v1/users/me`);
}

export function updateUserPassword(
  currentPassword: string,
  password: string,
): Promise<any> {
  return axios.put(`/api/v1/users/me/password`, { currentPassword, password });
}

export function updateUserEmail(email: string, password: string): Promise<any> {
  return axios.put('/api/v1/users/me/email', { email, password });
}

export function updateUser(user: User): Promise<{ data: User }> {
  return axios.put(`/api/v1/users/${user.userid}`, formatUserForPost(user));
}

export function getUserSettings(
  userId: string | number,
): Promise<{ data: UserSettings }> {
  return axios.get(`/api/v1/users/${userId}/settings`);
}

interface SettingsArgs {
  emailSubscriptions?: EmailSubscriptions;
  refundAddress?: string;
  tipJarAddress?: string;
  tipJarViewKey?: string;
}
export function updateUserSettings(
  userId: string | number,
  args?: SettingsArgs,
): Promise<{ data: UserSettings }> {
  return axios.put(`/api/v1/users/${userId}/settings`, args);
}

export function updateUserArbiter(
  userId: number,
  proposalId: number,
  isAccept: boolean,
): Promise<any> {
  return axios.put(`/api/v1/users/${userId}/arbiter/${proposalId}`, { isAccept });
}

export function requestUserRecoveryEmail(email: string): Promise<any> {
  return axios.post(`/api/v1/users/recover`, { email });
}

export function resetPassword(code: string, password: string): Promise<any> {
  return axios.post(`/api/v1/users/recover/${code}`, { password });
}

export function verifyEmail(code: string): Promise<any> {
  return axios.post(`/api/v1/email/${code}/verify`);
}

export function unsubscribeEmail(code: string): Promise<any> {
  return axios.post(`/api/v1/email/${code}/unsubscribe`);
}

export function arbiterEmail(code: string, proposalId: number): Promise<any> {
  return axios.post(`/api/v1/email/${code}/arbiter/${proposalId}`);
}

export function getSocialAuthUrl(service: SOCIAL_SERVICE): Promise<any> {
  return axios.get(`/api/v1/users/social/${service}/authurl`);
}

export function verifySocial(service: SOCIAL_SERVICE, code: string): Promise<any> {
  return axios.post(`/api/v1/users/social/${service}/verify`, { code });
}

interface ProposalTipJarArgs {
  address?: string;
  viewKey?: string;
}
export function updateProposalTipJarSettings(
  proposalId: string | number,
  args?: ProposalTipJarArgs,
): Promise<{ data: Proposal }> {
  return axios.put(`/api/v1/proposals/${proposalId}/tips`, args).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
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

export function postProposalDraft(rfpId?: number): Promise<{ data: ProposalDraft }> {
  return axios.post('/api/v1/proposals/drafts', { rfpId });
}

export function deleteProposal(proposalId: number): Promise<any> {
  return axios.delete(`/api/v1/proposals/${proposalId}`);
}

export function putProposal(proposal: ProposalDraft): Promise<{ data: ProposalDraft }> {
  // Exclude some keys
  const { proposalId, stage, dateCreated, team, rfpOptIn, ...rest } = proposal;
  // add rfpOptIn if it is not null
  if (rfpOptIn !== null) {
    (rest as any).rfpOptIn = rfpOptIn;
  }
  return axios.put(`/api/v1/proposals/${proposal.proposalId}`, rest);
}

export async function putProposalSubmitForApproval(
  proposal: ProposalDraft,
): Promise<{ data: Proposal }> {
  return axios
    .put(`/api/v1/proposals/${proposal.proposalId}/submit_for_approval`)
    .then(res => {
      res.data = formatProposalFromGet(res.data);
      return res;
    });
}

export async function postProposalMakeLiveDraft(
  proposalId: number,
): Promise<{ data: Proposal }> {
  return axios.post(`/api/v1/proposals/${proposalId}/draft`).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
}

export async function putProposalSubmitLiveDraft(
  proposal: ProposalDraft,
): Promise<{ data: Proposal }> {
  return axios.put(`/api/v1/proposals/${proposal.proposalId}/publish/live`).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
}

export async function putProposalPublish(
  proposalId: number,
): Promise<{ data: Proposal }> {
  return axios.put(`/api/v1/proposals/${proposalId}/publish`).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
}

export async function putMarkProposalRequestedChangesAsResolved(
  proposalId: number,
): Promise<{ data: Proposal }> {
  return axios.put(`/api/v1/proposals/${proposalId}/resolve`).then(res => {
    res.data = formatProposalFromGet(res.data);
    return res;
  });
}

export async function deleteProposalRFPLink(proposalId: number): Promise<any> {
  return axios.delete(`/api/v1/proposals/${proposalId}/rfp`);
}

export async function requestProposalPayout(
  proposalId: number,
  milestoneId: number,
): Promise<{ data: Proposal }> {
  return axios
    .put(`/api/v1/proposals/${proposalId}/milestone/${milestoneId}/request`)
    .then(res => {
      res.data = formatProposalFromGet(res.data);
      return res;
    });
}
export async function acceptProposalPayout(
  proposalId: number,
  milestoneId: number,
): Promise<{ data: Proposal }> {
  return axios
    .put(`/api/v1/proposals/${proposalId}/milestone/${milestoneId}/accept`)
    .then(res => {
      res.data = formatProposalFromGet(res.data);
      return res;
    });
}
export async function rejectProposalPayout(
  proposalId: number,
  milestoneId: number,
  reason: string,
): Promise<{ data: Proposal }> {
  return axios
    .put(`/api/v1/proposals/${proposalId}/milestone/${milestoneId}/reject`, { reason })
    .then(res => {
      res.data = formatProposalFromGet(res.data);
      return res;
    });
}

export function getProposalInvites(
  proposalId: number,
): Promise<{ data: { invites: TeamInvite[], team: User[] } }> {
  return axios.get(`/api/v1/proposals/${proposalId}/invites`);
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
  amount: string,
  isPrivate: boolean = true,
): Promise<{ data: ContributionWithAddressesAndUser }> {
  return axios.post(`/api/v1/proposals/${proposalId}/contributions`, {
    amount,
    private: isPrivate,
  });
}

export function postProposalComment(payload: {
  proposalId: number;
  parentCommentId?: number;
  comment: string;
}): Promise<{ data: any }> {
  const { proposalId, ...args } = payload;
  return axios.post(`/api/v1/proposals/${proposalId}/comments`, args);
}

export function deleteProposalContribution(contributionId: string | number) {
  return axios.delete(`/api/v1/proposals/contribution/${contributionId}`);
}

export function getProposalContribution(
  proposalId: number,
  contributionId: number,
): Promise<{ data: ContributionWithAddressesAndUser }> {
  return axios.get(`/api/v1/proposals/${proposalId}/contributions/${contributionId}`);
}

export function getRFPs(): Promise<{ data: RFP[] }> {
  return axios.get('/api/v1/rfps/').then(res => {
    res.data = res.data.map(formatRFPFromGet);
    return res;
  });
}

export function getRFP(rfpId: number | string): Promise<{ data: RFP }> {
  return axios.get(`/api/v1/rfps/${rfpId}`).then(res => {
    res.data = formatRFPFromGet(res.data);
    return res;
  });
}

export function resendEmailVerification(): Promise<{ data: void }> {
  return axios.put(`/api/v1/users/me/resend-verification`);
}

export function getHomeLatest(): Promise<{
  data: {
    latestProposals: Proposal[];
    latestRfps: RFP[];
  };
}> {
  return axios.get('/api/v1/home/latest').then(res => {
    res.data = {
      latestProposals: res.data.latestProposals.map(formatProposalFromGet),
      latestRfps: res.data.latestRfps.map(formatRFPFromGet),
    };
    return res;
  });
}

// CCRs
export function getCCRDrafts(): Promise<{ data: CCRDraft[] }> {
  return axios.get('/api/v1/ccrs/drafts');
}

export function postCCRDraft(): Promise<{ data: CCRDraft }> {
  return axios.post('/api/v1/ccrs/drafts');
}

export function deleteCCR(ccrId: number): Promise<any> {
  return axios.delete(`/api/v1/ccrs/${ccrId}`);
}

export function putCCR(ccr: CCRDraft): Promise<{ data: CCRDraft }> {
  // Exclude some keys
  const { ccrId, author, dateCreated, status, ...rest } = ccr;
  return axios.put(`/api/v1/ccrs/${ccrId}`, rest);
}

export function getCCR(ccrId: number | string): Promise<{ data: CCR }> {
  return axios.get(`/api/v1/ccrs/${ccrId}`).then(res => {
    return res;
  });
}

export async function putCCRSubmitForApproval(ccr: CCRDraft): Promise<{ data: CCR }> {
  return axios.put(`/api/v1/ccrs/${ccr.ccrId}/submit_for_approval`).then(res => {
    return res;
  });
}
