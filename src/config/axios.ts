import axios from 'axios';
axios.defaults.validateStatus = function (status) {
  return status >= 100 && status < 500;
};

export const api = axios.create({
  baseURL: 'https://2factor.in/API/V1/',
  headers: {
    'Content-Type': 'application/json',
  },
  
});
