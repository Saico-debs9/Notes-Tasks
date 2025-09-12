import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

export const login = (data) =>  axios.post(`${API_URL}/login`, data);
export const signup = (data) =>  axios.post(`${API_URL}/signup`, data);
export const googleLogin = (tokenId) =>
  axios.post(`${API_URL}/google-login`, { tokenId });
