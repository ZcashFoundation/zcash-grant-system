import axios from 'axios';
import { getStoreRef } from 'store/configure';
import { checkUser } from 'modules/auth/actions';

const instance = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {},
  // for session cookies
  withCredentials: true,
});

let lastAuthed = null as null | string;

instance.interceptors.response.use(
  // - watch for changes to auth header and trigger checkUser action if it changes
  // - this allows for external authorization events to be registered in this context
  // - external auth events include login/logout in another tab, or
  //   the user getting banned
  res => {
    const authed = res.headers['x-grantio-authed'];
    if (lastAuthed !== null && lastAuthed !== authed) {
      const store = getStoreRef();
      if (store) {
        store.dispatch<any>(checkUser());
      }
    }
    lastAuthed = authed;
    return res;
  },
  // Try to parse error message if possible
  err => {
    if (err.response && err.response.data) {
      // Our backend's handled error responses
      if (err.response.data.message) {
        err.message = err.response.data.message;
      }
      // Some flask middlewares return error data like this
      if (err.response.data.data) {
        err.message = err.response.data.data;
      }
    }
    return Promise.reject(err);
  },
);

export default instance;
