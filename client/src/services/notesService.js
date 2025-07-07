import axios from 'axios';

const API_URL = 'http://192.168.0.7:9089/api/notes'; // adjust to your backend IP

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchNotes = () =>
  axios.get(`${API_URL}/getNotes`, getAuthHeader());

export const createNote = (note) =>
  axios.post( `${API_URL}/createNotes`, note, getAuthHeader());

export const updateNote = (id, note) =>
  axios.put(`${API_URL}/${id}/updateNotes`, note, getAuthHeader());

export const deleteNote = (id) =>
  axios.delete(`${API_URL}/${id}/deleteNotes`, getAuthHeader());
