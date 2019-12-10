import { pick } from 'lodash';
import { store } from 'react-easy-state';
import axios, { AxiosError } from 'axios';
import {
  User,
  Proposal,
  CCR,
  Contribution,
  ContributionArgs,
  RFP,
  RFPArgs,
  EmailExample,
  PageQuery,
  PageData,
  CommentArgs,
} from './types';

// API
const api = axios.create({
  baseURL: process.env.BACKEND_URL + '/api/v1',
  withCredentials: true,
});

async function login(username: string, password: string) {
  const { data } = await api.post('/admin/login', {
    username,
    password,
  });
  return data;
}

export async function refresh(password: string) {
  const { data } = await api.post('/admin/refresh', {
    password,
  });
  return data;
}

async function logout() {
  const { data } = await api.get('/admin/logout');
  return data;
}

async function checkLogin() {
  const { data } = await api.get('/admin/checklogin');
  return data;
}

export async function get2fa() {
  const { data } = await api.get('/admin/2fa');
  return data;
}

export async function get2faInit() {
  const { data } = await api.get('/admin/2fa/init');
  return data;
}

export async function post2faEnable(args: {
  backupCodes: string[];
  totpSecret: string;
  verifyCode: string;
}) {
  const { data } = await api.post('/admin/2fa/enable', args);
  return data;
}

export async function post2faVerify(args: { verifyCode: string }) {
  const { data } = await api.post('/admin/2fa/verify', args);
  return data;
}

async function fetchStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

async function fetchFinancials() {
  const { data } = await api.get('/admin/financials');
  return data;
}

async function fetchUsers(params: Partial<PageQuery>) {
  const { data } = await api.get('/admin/users', { params });
  return data;
}

async function fetchUserDetail(id: number) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
}

async function editUser(id: number, args: Partial<User>) {
  const { data } = await api.put(`/admin/users/${id}`, args);
  return data;
}

async function deleteUser(id: number) {
  const { data } = await api.delete('/admin/users/' + id);
  return data;
}

async function fetchArbiters(search: string) {
  const { data } = await api.get(`/admin/arbiters`, { params: { search } });
  return data;
}

async function setArbiter(proposalId: number, userId: number) {
  const { data } = await api.put(`/admin/arbiters`, { proposalId, userId });
  return data;
}

async function fetchProposals(params: Partial<PageQuery>) {
  const { data } = await api.get('/admin/proposals', { params });
  return data;
}

async function fetchProposalDetail(id: number) {
  const { data } = await api.get(`/admin/proposals/${id}`);
  return data;
}

async function updateProposal(p: Partial<Proposal>) {
  const { data } = await api.put('/admin/proposals/' + p.proposalId, p);
  return data;
}

async function deleteProposal(id: number) {
  const { data } = await api.delete('/admin/proposals/' + id);
  return data;
}

async function approveProposal(
  id: number,
  isAccepted: boolean,
  withFunding: boolean,
  rejectReason?: string,
) {
  const { data } = await api.put(`/admin/proposals/${id}/accept`, {
    isAccepted,
    withFunding,
    rejectReason,
  });
  return data;
}

async function cancelProposal(id: number) {
  const { data } = await api.put(`/admin/proposals/${id}/cancel`);
  return data;
}

async function changeProposalToAcceptedWithFunding(id: number) {
  const { data } = await api.put(`/admin/proposals/${id}/accept/fund`);
  return data;
}

async function fetchComments(params: Partial<PageQuery>) {
  const { data } = await api.get('/admin/comments', { params });
  return data;
}

async function updateComment(id: number, args: Partial<CommentArgs>) {
  const { data } = await api.put(`/admin/comments/${id}`, args);
  return data;
}

async function markMilestonePaid(proposalId: number, milestoneId: number, txId: string) {
  const { data } = await api.put(
    `/admin/proposals/${proposalId}/milestone/${milestoneId}/paid`,
    { txId },
  );
  return data;
}

async function getEmailExample(type: string) {
  const { data } = await api.get(`/admin/email/example/${type}`);
  return data;
}

async function fetchCCRDetail(id: number) {
  const { data } = await api.get(`/admin/ccrs/${id}`);
  return data;
}

async function approveCCR(id: number, isAccepted: boolean, rejectReason?: string) {
  const { data } = await api.put(`/admin/ccrs/${id}/accept`, {
    isAccepted,
    rejectReason,
  });
  return data;
}

async function fetchCCRs(params: Partial<PageQuery>) {
  const { data } = await api.get(`/admin/ccrs`, { params });
  return data;
}

export async function deleteCCR(id: number) {
  await api.delete(`/admin/ccrs/${id}`);
}

async function getRFPs() {
  const { data } = await api.get(`/admin/rfps`);
  return data;
}

async function createRFP(args: RFPArgs) {
  const { data } = await api.post('/admin/rfps', args);
  return data;
}

async function editRFP(id: number, args: RFPArgs) {
  const { data } = await api.put(`/admin/rfps/${id}`, args);
  return data;
}

async function deleteRFP(id: number) {
  await api.delete(`/admin/rfps/${id}`);
}

async function getContributions(params: PageQuery) {
  const { data } = await api.get('/admin/contributions', { params });
  return data;
}

async function getContribution(id: number) {
  const { data } = await api.get(`/admin/contributions/${id}`);
  return data;
}

async function createContribution(args: ContributionArgs) {
  const { data } = await api.post('/admin/contributions', args);
  return data;
}

async function editContribution(id: number, args: ContributionArgs) {
  const { data } = await api.put(`/admin/contributions/${id}`, args);
  return data;
}

// STORE
const app = store({
  /*** DATA ***/

  hasCheckedLogin: false,
  isLoggedIn: false,
  is2faAuthed: false,
  loginError: '',
  generalError: [] as string[],
  statsFetched: false,
  statsFetching: false,
  stats: {
    userCount: 0,
    proposalCount: 0,
    ccrPendingCount: 0,
    proposalPendingCount: 0,
    proposalNoArbiterCount: 0,
    proposalMilestonePayoutsCount: 0,
    contributionRefundableCount: 0,
  },

  financialsFetched: false,
  financialsFetching: false,
  financials: {
    grants: {
      total: '0',
      matching: '0',
      bounty: '0',
    },
    contributions: {
      total: '0',
      gross: '0',
      staking: '0',
      funding: '0',
      funded: '0',
      refunding: '0',
      refunded: '0',
      donations: '0',
    },
    payouts: {
      total: '0',
      due: '0',
      paid: '0',
      future: '0',
    },
  },

  users: {
    page: createDefaultPageData<User>('EMAIL:DESC'),
  },
  userSaving: false,
  userSaved: false,

  userDetailFetching: false,
  userDetail: null as null | User,
  userDeleting: false,
  userDeleted: false,

  arbiterSaving: false,
  arbiterSaved: false,

  arbitersSearch: {
    search: '',
    results: [] as User[],
    fetching: false,
    error: null as string | null,
  },

  proposals: {
    page: createDefaultPageData<Proposal>('CREATED:DESC'),
  },

  proposalDetail: null as null | Proposal,
  proposalDetailFetching: false,
  proposalDetailApproving: false,
  proposalDetailMarkingMilestonePaid: false,
  proposalDetailCanceling: false,
  proposalDetailUpdating: false,
  proposalDetailUpdated: false,
  proposalDetailChangingToAcceptedWithFunding: false,

  ccrs: {
    page: createDefaultPageData<CCR>('CREATED:DESC'),
  },
  ccrSaving: false,
  ccrSaved: false,
  ccrDeleting: false,
  ccrDeleted: false,

  ccrDetail: null as null | CCR,
  ccrDetailFetching: false,
  ccrDetailApproving: false,
  ccrDetailMarkingMilestonePaid: false,
  ccrDetailCanceling: false,
  ccrDetailUpdating: false,
  ccrDetailUpdated: false,
  ccrDetailChangingToAcceptedWithFunding: false,
  ccrCreatedRFPId: null,

  comments: {
    page: createDefaultPageData<Comment>('CREATED:DESC'),
  },
  commentSaving: false,
  commentSaved: false,

  rfps: [] as RFP[],
  rfpsFetching: false,
  rfpsFetched: false,
  rfpSaving: false,
  rfpSaved: false,
  rfpDeleting: false,
  rfpDeleted: false,

  contributions: {
    page: createDefaultPageData<Contribution>('CREATED:DESC'),
  },

  contributionDetail: null as null | Contribution,
  contributionDetailFetching: false,
  contributionSaving: false,
  contributionSaved: false,

  emailExamples: {} as { [type: string]: EmailExample },

  /*** ACTIONS ***/

  removeGeneralError(i: number) {
    app.generalError.splice(i, 1);
  },

  updateProposalInStore(p: Proposal) {
    const index = app.proposals.page.items.findIndex(x => x.proposalId === p.proposalId);
    if (index > -1) {
      app.proposals.page.items[index] = p;
    }
    if (app.proposalDetail && app.proposalDetail.proposalId === p.proposalId) {
      app.proposalDetail = p;
    }
  },

  updateUserInStore(u: User) {
    const index = app.users.page.items.findIndex(x => x.userid === u.userid);
    if (index > -1) {
      app.users.page.items[index] = u;
    }
    if (app.userDetail && app.userDetail.userid === u.userid) {
      app.userDetail = {
        ...app.userDetail,
        ...u,
      };
    }
  },

  // Auth

  async checkLogin() {
    const res = await checkLogin();
    app.isLoggedIn = res.isLoggedIn;
    app.is2faAuthed = res.is2faAuthed;
    app.hasCheckedLogin = true;
  },

  async login(username: string, password: string) {
    try {
      const res = await login(username, password);
      app.isLoggedIn = res.isLoggedIn;
      app.is2faAuthed = res.is2faAuthed;
    } catch (e) {
      app.loginError = e.response.data.message;
    }
  },

  async logout() {
    try {
      const res = await logout();
      app.isLoggedIn = res.isLoggedIn;
      app.is2faAuthed = res.is2faAuthed;
    } catch (e) {
      app.generalError.push(e.toString());
    }
  },

  async fetchStats() {
    app.statsFetching = true;
    try {
      app.stats = await fetchStats();
      app.statsFetched = true;
    } catch (e) {
      handleApiError(e);
    }
    app.statsFetching = false;
  },

  async fetchFinancials() {
    app.financialsFetching = true;
    try {
      app.financials = await fetchFinancials();
      app.financialsFetched = true;
    } catch (e) {
      handleApiError(e);
    }
    app.financialsFetching = false;
  },

  // Users

  async fetchUsers() {
    return await pageFetch(app.users, fetchUsers);
  },

  setUserPageQuery(params: Partial<PageQuery>) {
    setPageParams(app.users, params);
  },

  resetUserPageQuery() {
    resetPageParams(app.users);
  },

  async fetchUserDetail(id: number) {
    app.userDetailFetching = true;
    try {
      app.userDetail = await fetchUserDetail(id);
    } catch (e) {
      handleApiError(e);
    }
    app.userDetailFetching = false;
  },

  async editUser(id: number, args: Partial<User>) {
    app.userSaving = true;
    app.userSaved = false;
    try {
      const user = await editUser(id, args);
      app.updateUserInStore(user);
      app.userSaved = true;
    } catch (e) {
      handleApiError(e);
    }
    app.userSaving = false;
  },

  async deleteUser(id: number) {
    app.userDeleting = false;
    app.userDeleted = false;
    try {
      await deleteUser(id);
      app.users.page.items = app.users.page.items.filter(u => u.userid !== id);
      app.userDeleted = true;
      app.userDetail = null;
    } catch (e) {
      handleApiError(e);
    }
    app.userDeleting = false;
  },

  // Arbiters

  async searchArbiters(search: string) {
    app.arbitersSearch = {
      ...app.arbitersSearch,
      search,
      fetching: true,
    };
    try {
      const data = await fetchArbiters(search);
      app.arbitersSearch = {
        ...app.arbitersSearch,
        ...data,
      };
    } catch (e) {
      handleApiError(e);
    }
    app.arbitersSearch.fetching = false;
  },

  async searchArbitersClear() {
    app.arbitersSearch = {
      search: '',
      results: [] as User[],
      fetching: false,
      error: null,
    };
  },

  async setArbiter(proposalId: number, userId: number) {
    app.arbiterSaving = true;
    app.arbiterSaved = false;
    try {
      const { proposal, user } = await setArbiter(proposalId, userId);
      this.updateProposalInStore(proposal);
      this.updateUserInStore(user);
      app.arbiterSaved = true;
    } catch (e) {
      handleApiError(e);
    }
    app.arbiterSaving = false;
  },

  // CCRS

  async fetchCCRs() {
    return await pageFetch(app.ccrs, fetchCCRs);
  },

  setCCRPageQuery(params: Partial<PageQuery>) {
    setPageParams(app.ccrs, params);
  },

  resetCCRPageQuery() {
    resetPageParams(app.ccrs);
  },

  async fetchCCRDetail(id: number) {
    app.ccrDetailFetching = true;
    try {
      app.ccrDetail = await fetchCCRDetail(id);
    } catch (e) {
      handleApiError(e);
    }
    app.ccrDetailFetching = false;
  },

  async approveCCR(isAccepted: boolean, rejectReason?: string) {
    if (!app.ccrDetail) {
      const m = 'store.approveCCR(): Expected ccrDetail to be populated!';
      app.generalError.push(m);
      console.error(m);
      return;
    }
    app.ccrCreatedRFPId = null;
    app.ccrDetailApproving = true;
    try {
      const { ccrId } = app.ccrDetail;
      const res = await approveCCR(ccrId, isAccepted, rejectReason);
      await app.fetchCCRs();
      await app.fetchRFPs();
      if (isAccepted) {
        app.ccrCreatedRFPId = res.rfpId;
      }
    } catch (e) {
      handleApiError(e);
    }
    app.ccrDetailApproving = false;
  },

  // Proposals

  async fetchProposals() {
    return await pageFetch(app.proposals, fetchProposals);
  },

  setProposalPageQuery(params: Partial<PageQuery>) {
    setPageParams(app.proposals, params);
  },

  resetProposalPageQuery() {
    resetPageParams(app.proposals);
  },

  async fetchProposalDetail(id: number) {
    app.proposalDetailFetching = true;
    try {
      app.proposalDetail = await fetchProposalDetail(id);
    } catch (e) {
      handleApiError(e);
    }
    app.proposalDetailFetching = false;
  },

  async updateProposalDetail(updates: Partial<Proposal>) {
    if (!app.proposalDetail) {
      return;
    }
    app.proposalDetailUpdating = true;
    app.proposalDetailUpdated = false;
    try {
      const res = await updateProposal({
        ...updates,
        proposalId: app.proposalDetail.proposalId,
      });
      app.updateProposalInStore(res);
      app.proposalDetailUpdated = true;
    } catch (e) {
      handleApiError(e);
    }
    app.proposalDetailUpdating = false;
  },

  async deleteProposal(id: number) {
    try {
      await deleteProposal(id);
      app.proposals.page.items = app.proposals.page.items.filter(
        p => p.proposalId === id,
      );
    } catch (e) {
      handleApiError(e);
    }
  },

  async approveProposal(
    isAccepted: boolean,
    withFunding: boolean,
    rejectReason?: string,
  ) {
    if (!app.proposalDetail) {
      const m = 'store.approveProposal(): Expected proposalDetail to be populated!';
      app.generalError.push(m);
      console.error(m);
      return;
    }
    app.proposalDetailApproving = true;
    try {
      const { proposalId } = app.proposalDetail;
      const res = await approveProposal(
        proposalId,
        isAccepted,
        withFunding,
        rejectReason,
      );
      app.updateProposalInStore(res);
    } catch (e) {
      handleApiError(e);
    }
    app.proposalDetailApproving = false;
  },

  async cancelProposal(id: number) {
    app.proposalDetailCanceling = true;
    try {
      const res = await cancelProposal(id);
      app.updateProposalInStore(res);
    } catch (e) {
      handleApiError(e);
    }
    app.proposalDetailCanceling = false;
  },

  async changeProposalToAcceptedWithFunding(id: number) {
    app.proposalDetailChangingToAcceptedWithFunding = true;

    try {
      const res = await changeProposalToAcceptedWithFunding(id);
      app.updateProposalInStore(res);
    } catch (e) {
      handleApiError(e);
    }

    app.proposalDetailChangingToAcceptedWithFunding = false;
  },

  async markMilestonePaid(proposalId: number, milestoneId: number, txId: string) {
    app.proposalDetailMarkingMilestonePaid = true;
    try {
      const res = await markMilestonePaid(proposalId, milestoneId, txId);
      app.updateProposalInStore(res);
    } catch (e) {
      handleApiError(e);
    }
    app.proposalDetailMarkingMilestonePaid = false;
  },

  // Comments

  async fetchComments() {
    return await pageFetch(app.comments, fetchComments);
  },

  setCommentPageParams(params: Partial<PageQuery>) {
    setPageParams(app.comments, params);
  },

  resetCommentPageParams() {
    resetPageParams(app.comments);
  },

  async updateComment(id: number, args: Partial<CommentArgs>) {
    app.commentSaving = true;
    app.commentSaved = false;
    try {
      await updateComment(id, args);
      app.commentSaved = true;
      await app.fetchComments();
    } catch (e) {
      handleApiError(e);
    }
    app.commentSaving = false;
  },

  // Email

  async getEmailExample(type: string) {
    try {
      const example = await getEmailExample(type);
      app.emailExamples = {
        ...app.emailExamples,
        [type]: example,
      };
    } catch (e) {
      handleApiError(e);
    }
  },

  // RFPs

  async fetchRFPs() {
    app.rfpsFetching = true;
    try {
      app.rfps = await getRFPs();
      app.rfpsFetched = true;
    } catch (e) {
      handleApiError(e);
    }
    app.rfpsFetching = false;
  },

  async createRFP(args: RFPArgs) {
    app.rfpSaving = true;
    try {
      const data = await createRFP(args);
      app.rfps = [data, ...app.rfps];
      app.rfpSaved = true;
    } catch (e) {
      handleApiError(e);
    }
    app.rfpSaving = false;
  },

  async editRFP(id: number, args: RFPArgs) {
    app.rfpSaving = true;
    app.rfpSaved = false;
    try {
      await editRFP(id, args);
      app.rfpSaved = true;
      await app.fetchRFPs();
    } catch (e) {
      handleApiError(e);
    }
    app.rfpSaving = false;
  },

  async deleteRFP(id: number) {
    app.rfpDeleting = true;
    app.rfpDeleted = false;
    try {
      await deleteRFP(id);
      app.rfps = app.rfps.filter(rfp => rfp.id !== id);
      app.rfpDeleted = true;
    } catch (e) {
      handleApiError(e);
    }
    app.rfpDeleting = false;
  },

  // Contributions

  async fetchContributions() {
    return await pageFetch(app.contributions, getContributions);
  },

  setContributionPageQuery(params: Partial<PageQuery>) {
    setPageParams(app.contributions, params);
  },

  resetContributionPageQuery() {
    resetPageParams(app.contributions);
  },

  async fetchContributionDetail(id: number) {
    app.contributionDetailFetching = true;
    try {
      app.contributionDetail = await getContribution(id);
    } catch (e) {
      handleApiError(e);
    }
    app.contributionDetailFetching = false;
  },

  async editContribution(id: number, args: ContributionArgs) {
    app.contributionSaving = true;
    app.contributionSaved = false;
    try {
      await editContribution(id, args);
      app.contributionSaved = true;
    } catch (e) {
      handleApiError(e);
    }
    app.contributionSaving = false;
  },

  async createContribution(args: ContributionArgs) {
    app.contributionSaving = true;
    app.contributionSaved = false;
    try {
      await createContribution(args);
      app.contributionSaved = true;
    } catch (e) {
      handleApiError(e);
    }
    app.contributionSaving = false;
  },
});

// Utils
export function handleApiError(e: AxiosError) {
  if (e.response && e.response.data!.message) {
    app.generalError.push(e.response!.data.message);
  } else if (e.response && e.response.data!.data!) {
    app.generalError.push(e.response!.data.data);
  } else {
    app.generalError.push(e.toString());
  }
}

function createDefaultPageData<T>(sort: string): PageData<T> {
  return {
    sort,
    page: 1,
    search: '',
    filters: [] as string[],
    pageSize: 0,
    total: 0,
    items: [] as T[],
    fetching: false,
    fetched: false,
  };
}

type FNFetchPage = (params: PageQuery) => Promise<any>;
interface PageParent<T> {
  page: PageData<T>;
}

async function pageFetch<T>(ref: PageParent<T>, fetch: FNFetchPage) {
  ref.page.fetching = true;
  try {
    const params = getPageParams(ref.page);
    const newPage = await fetch(params);
    ref.page = {
      ...ref.page,
      ...newPage,
      fetched: true,
    };
  } catch (e) {
    handleApiError(e);
  }
  ref.page.fetching = false;
}

function getPageParams<T>(page: PageData<T>) {
  return pick(page, ['page', 'search', 'filters', 'sort']) as PageQuery;
}

function setPageParams<T>(ref: PageParent<T>, query: Partial<PageQuery>) {
  // sometimes we need to reset page to 1
  if (query.filters || query.search) {
    query.page = 1;
  }
  ref.page = {
    ...ref.page,
    ...query,
  };
}

function resetPageParams<T>(ref: PageParent<T>) {
  ref.page.page = 1;
  ref.page.search = '';
  ref.page.sort = 'CREATED:DESC';
  ref.page.filters = [];
}

// Attach to window for inspection
(window as any).appStore = app;

// check login status periodically
app.checkLogin();
window.setInterval(app.checkLogin, 10000);

export type TApp = typeof app;
export default app;
