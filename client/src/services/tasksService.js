import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/tasks`;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchTasks = () =>
  axios.get(`${API_URL}/getTasks`, getAuthHeader());

export const createTask = (task) =>
  axios.post( `${API_URL}/createTasks`, task, getAuthHeader());

export const updateTask = (id, task) =>
  axios.put(`${API_URL}/${id}/updateTasks`, task, getAuthHeader());

export const deleteTask = (id) =>
  axios.delete(`${API_URL}/${id}/deleteTasks`, getAuthHeader());

export const createSubtask = (task) => 
  axios.post(`${API_URL}/createSubtask`, task, getAuthHeader());


export const updateSubtask = (id, task) => 
  axios.put(`${API_URL}/updateSubtask/${id}`, task, getAuthHeader());