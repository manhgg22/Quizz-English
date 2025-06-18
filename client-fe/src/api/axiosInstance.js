import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:9999/api', // base URL từ backend
});

export default instance;
