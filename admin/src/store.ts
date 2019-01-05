import { store } from 'react-easy-state';
import qs from 'query-string';
import axios, { AxiosError } from 'axios';
import { User, Proposal, PROPOSAL_STATUS } from './types';

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

async function deleteUser(id: string) {
  const { data } = await api.delete('/admin/users/' + id);
  return data;
}

async function fetchProposals(statusFilters?: PROPOSAL_STATUS[]) {
  const { data } = await api.get('/admin/proposals', {
    params: { statusFilters },
    // paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
  });
  return data;
}

async function deleteProposal(id: number) {
  const { data } = await api.delete('/admin/proposals/' + id);
  return data;
}

// STORE
const app = store({
  hasCheckedLogin: false,
  isLoggedIn: false,
  loginError: '',
  generalError: [] as string[],
  stats: {
    userCount: -1,
    proposalCount: -1,
  },
  usersFetched: false,
  users: [] as User[],
  proposalsFetching: false,
  proposalsFetched: false,
  proposals: [] as Proposal[],

  removeGeneralError(i: number) {
    app.generalError.splice(i, 1);
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
    try {
      app.stats = await fetchStats();
    } catch (e) {
      handleApiError(e);
    }
  },

  async fetchUsers() {
    try {
      app.users = await fetchUsers();
      app.usersFetched = true;
    } catch (e) {
      handleApiError(e);
    }
  },

  async deleteUser(id: string) {
    try {
      await deleteUser(id);
      app.users = app.users.filter(u => u.accountAddress !== id && u.emailAddress !== id);
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

  async deleteProposal(id: number) {
    try {
      await deleteProposal(id);
      app.proposals = app.proposals.filter(p => p.proposalId === id);
    } catch (e) {
      handleApiError(e);
    }
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
