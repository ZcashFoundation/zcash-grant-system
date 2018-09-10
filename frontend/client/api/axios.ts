import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {},
});

export default instance;
