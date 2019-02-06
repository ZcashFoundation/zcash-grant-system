import { pick } from 'lodash';
import { store } from 'react-easy-state';
import axios, { AxiosError } from 'axios';
import {
  User,
  Proposal,
  Contribution,
  ContributionArgs,
  RFP,
  RFPArgs,
  EmailExample,
  PageQuery,
  PageData,
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
  return data.isLoggedIn;
}

async function logout() {
  const { data } = await api.get('/admin/logout');
  return data.isLoggedIn;
}

async function checkLogin() {
  const { data } = await api.get('/admin/checklogin');
  return data.isLoggedIn;
}

async function fetchStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

async function fetchUsers() {
  const { data } = await api.get('/admin/users');
  return data;
}

async function fetchUserDetail(id: number) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
}

async function deleteUser(id: number) {
  const { data } = await api.delete('/admin/users/' + id);
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

async function approveProposal(id: number, isApprove: boolean, rejectReason?: string) {
  const { data } = await api.put(`/admin/proposals/${id}/approve`, {
    isApprove,
    rejectReason,
  });
  return data;
}

async function getEmailExample(type: string) {
  const { data } = await api.get(`/admin/email/example/${type}`);
  return data;
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
  loginError: '',
  generalError: [] as string[],
  statsFetched: false,
  statsFetching: false,
  stats: {
    userCount: 0,
    proposalCount: 0,
    proposalPendingCount: 0,
  },

  usersFetching: false,
  usersFetched: false,
  users: [] as User[],
  userDetailFetching: false,
  userDetail: null as null | User,
  userDeleting: false,
  userDeleted: false,

  proposals: {
    page: createDefaultPageData<Proposal>('CREATED:DESC'),
  },

  proposalDetail: null as null | Proposal,
  proposalDetailFetching: false,
  proposalDetailApproving: false,

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
  contributionDetailApproving: false,
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

  // Auth

  async checkLogin() {
    app.isLoggedIn = await checkLogin();
    app.hasCheckedLogin = true;
  },

  async login(username: string, password: string) {
    try {
      app.isLoggedIn = await login(username, password);
    } catch (e) {
      app.loginError = e.response.data.message;
    }
  },

  async logout() {
    try {
      app.isLoggedIn = await logout();
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

  // Users

  async fetchUsers() {
    app.usersFetching = true;
    try {
      app.users = await fetchUsers();
      app.usersFetched = true;
    } catch (e) {
      handleApiError(e);
    }
    app.usersFetching = false;
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

  async deleteUser(id: number) {
    app.userDeleting = false;
    app.userDeleted = false;
    try {
      await deleteUser(id);
      app.users = app.users.filter(u => u.userid !== id);
      app.userDeleted = true;
      app.userDetail = null;
    } catch (e) {
      handleApiError(e);
    }
    app.userDeleting = false;
  },

  // Proposals

  async fetchProposals() {
    app.proposals.page.fetching = true;
    try {
      const page = await fetchProposals(app.getProposalPageQuery());
      app.proposals.page = {
        ...app.proposals.page,
        ...page,
        fetched: true,
      };
    } catch (e) {
      handleApiError(e);
    }
    app.proposals.page.fetching = false;
  },

  setProposalPageQuery(query: Partial<PageQuery>) {
    app.proposals.page = {
      ...app.proposals.page,
      ...query,
    };
  },

  getProposalPageQuery() {
    return pick(app.proposals.page, ['page', 'search', 'filters', 'sort']) as PageQuery;
  },

  resetProposalPageQuery() {
    app.proposals.page.page = 1;
    app.proposals.page.search = '';
    app.proposals.page.sort = 'CREATED:DESC';
    app.proposals.page.filters = [];
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
    try {
      const res = await updateProposal({
        ...updates,
        proposalId: app.proposalDetail.proposalId,
      });
      app.updateProposalInStore(res);
    } catch (e) {
      handleApiError(e);
    }
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

  async approveProposal(isApprove: boolean, rejectReason?: string) {
    if (!app.proposalDetail) {
      const m = 'store.approveProposal(): Expected proposalDetail to be populated!';
      app.generalError.push(m);
      console.error(m);
      return;
    }
    app.proposalDetailApproving = true;
    try {
      const { proposalId } = app.proposalDetail;
      const res = await approveProposal(proposalId, isApprove, rejectReason);
      app.updateProposalInStore(res);
    } catch (e) {
      handleApiError(e);
    }
    app.proposalDetailApproving = false;
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
    app.contributions.page.fetching = true;
    try {
      const page = await getContributions(app.getContributionPageQuery());
      app.contributions.page = {
        ...app.contributions.page,
        ...page,
        fetched: true,
      };
    } catch (e) {
      handleApiError(e);
    }
    app.contributions.page.fetching = false;
  },

  setContributionPageQuery(query: Partial<PageQuery>) {
    app.contributions.page = {
      ...app.contributions.page,
      ...query,
    };
  },

  getContributionPageQuery() {
    return pick(app.contributions.page, ['page', 'search', 'filters', 'sort']) as PageQuery;
  },

  resetContributionPageQuery() {
    app.contributions.page.page = 1;
    app.contributions.page.search = '';
    app.contributions.page.sort = 'CREATED:DESC';
    app.contributions.page.filters = [];
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
  }
});

// Utils
function handleApiError(e: AxiosError) {
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
  }
}

// Attach to window for inspection
(window as any).appStore = app;

// check login status periodically
app.checkLogin();
window.setInterval(app.checkLogin, 10000);

export type TApp = typeof app;
export default app;
