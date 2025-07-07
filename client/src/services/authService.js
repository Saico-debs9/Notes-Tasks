import axios from 'axios';

const API_URL = 'http://192.168.0.7:9089/api/auth';

export const login = (data) =>  axios.post(`${API_URL}/login`, data);
export const signup = (data) =>  axios.post(`${API_URL}/signup`, data);
