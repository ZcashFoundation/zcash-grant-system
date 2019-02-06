import { pick } from 'lodash';
import { store } from 'react-easy-state';
import axios, { AxiosError } from 'axios';
import {
  User,
  Proposal,
  RFP,
  RFPArgs,
  EmailExample,
  PageQuery,
  PROPOSAL_STATUS,
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

async function fetchArbiters(search: string) {
  const { data } = await api.get(`/admin/arbiters`, { params: { search } });
  return data;
}

async function setArbiter(proposalId: number, userId: number) {
  const { data } = await api.put(`/admin/arbiters`, { proposalId, userId });
  return data;
}

async function fetchProposals(params: Partial<PageQuery>) {
  const { data } = await api.get('/admin/proposals', {
    params,
  });
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

// STORE
const app = store({
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
    proposalNoArbiterCount: 0,
  },

  usersFetching: false,
  usersFetched: false,
  users: [] as User[],
  userDetailFetching: false,
  userDetail: null as null | User,
  userDeleting: false,
  userDeleted: false,

  arbitersSearch: {
    search: '',
    results: [] as User[],
    fetching: false,
    error: null as string | null,
  },

  proposals: {
    page: {
      page: 1,
      search: '',
      sort: 'CREATED:DESC',
      filters: {
        status: [] as PROPOSAL_STATUS[],
        other: [] as string[],
      },
      pageSize: 0,
      total: 0,
      items: [] as Proposal[],
      fetching: false,
      fetched: false,
    },
  },

  proposalDetailFetching: false,
  proposalDetail: null as null | Proposal,
  proposalDetailApproving: false,

  rfps: [] as RFP[],
  rfpsFetching: false,
  rfpsFetched: false,
  rfpSaving: false,
  rfpSaved: false,
  rfpDeleting: false,
  rfpDeleted: false,

  emailExamples: {} as { [type: string]: EmailExample },

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
    const index = app.users.findIndex(x => x.userid === u.userid);
    if (index > -1) {
      app.users[index] = u;
    }
    if (app.userDetail && app.userDetail.userid === u.userid) {
      app.userDetail = u;
    }
  },

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
    // let component handle errors for this one
    const { proposal, user } = await setArbiter(proposalId, userId);
    this.updateProposalInStore(proposal);
    this.updateUserInStore(user);
  },

  async fetchProposals() {
    app.proposals.page.fetching = true;
    try {
      const page = await fetchProposals(app.getProposalPageQuery());
      // filter strings with prefix p, and remove the prefix
      const swp = (p: string, a: string[]) =>
        a.filter((s: string) => s.startsWith(p)).map(x => x.replace(p, ''));
      app.proposals.page = {
        ...app.proposals.page,
        ...page,
        filters: {
          status: swp('STATUS_', page.filters),
          other: swp('OTHER_', page.filters),
        },
        fetched: true,
      };
    } catch (e) {
      handleApiError(e);
    }
    app.proposals.page.fetching = false;
  },

  getProposalPageQuery() {
    const pq = pick(app.proposals.page, ['page', 'search', 'filters', 'sort']) as any;
    const pfx = (p: string) => (s: string) => p + s;
    pq.filters = [
      ...pq.filters.status.map(pfx('STATUS_')),
      ...pq.filters.other.map(pfx('OTHER_')),
    ];
    return pq as PageQuery;
  },

  resetProposalPageQuery() {
    app.proposals.page = {
      ...app.proposals.page,
      page: 1,
      search: '',
      sort: 'CREATED:DESC',
      filters: { status: [], other: [] },
    };
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
});

function handleApiError(e: AxiosError) {
  if (e.response && e.response.data!.message) {
    app.generalError.push(e.response!.data.message);
  } else if (e.response && e.response.data!.data!) {
    app.generalError.push(e.response!.data.data);
  } else {
    app.generalError.push(e.toString());
  }
}

(window as any).appStore = app;

// check login status periodically
app.checkLogin();
window.setInterval(app.checkLogin, 10000);

export type TApp = typeof app;
export default app;
