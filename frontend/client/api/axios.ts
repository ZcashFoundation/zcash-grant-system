import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {},
});

instance.interceptors.response.use(
  // Do nothing to responses
  res => res,
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
