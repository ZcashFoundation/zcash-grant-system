import { store } from 'react-easy-state';
import axios, { AxiosError } from 'axios';
import { User, Proposal, RFP, RFPArgs, EmailExample, PROPOSAL_STATUS } from './types';

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

async function deleteUser(id: number | string) {
  const { data } = await api.delete('/admin/users/' + id);
  return data;
}

async function fetchProposals(statusFilters?: PROPOSAL_STATUS[]) {
  const { data } = await api.get('/admin/proposals', {
    params: { statusFilters },
  });
  return data;
}

async function fetchProposalDetail(id: number) {
  const { data } = await api.get(`/admin/proposals/${id}`);
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
  },

  usersFetching: false,
  usersFetched: false,
  users: [] as User[],
  userDetailFetching: false,
  userDetail: null as null | User,

  proposalsFetching: false,
  proposalsFetched: false,
  proposals: [] as Proposal[],
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
    const index = app.proposals.findIndex(x => x.proposalId === p.proposalId);
    if (index > -1) {
      app.proposals[index] = p;
    }
    if (app.proposalDetail && app.proposalDetail.proposalId === p.proposalId) {
      app.proposalDetail = p;
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

  async deleteUser(id: string | number) {
    try {
      await deleteUser(id);
      app.users = app.users.filter(u => u.userid !== id && u.emailAddress !== id);
    } catch (e) {
      handleApiError(e);
    }
  },

  async fetchProposals(statusFilters?: PROPOSAL_STATUS[]) {
    app.proposalsFetching = true;
    try {
      app.proposals = await fetchProposals(statusFilters);
      app.proposalsFetched = true;
    } catch (e) {
      handleApiError(e);
    }
    app.proposalsFetching = false;
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

  async deleteProposal(id: number) {
    try {
      await deleteProposal(id);
      app.proposals = app.proposals.filter(p => p.proposalId === id);
    } catch (e) {
      handleApiError(e);
    }
  },

  async approveProposal(isApprove: boolean, rejectReason?: string) {
    if (!app.proposalDetail) {
      (x => {
        app.generalError.push(x);
        console.error(x);
      })('store.approveProposal(): Expected proposalDetail to be populated!');
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
