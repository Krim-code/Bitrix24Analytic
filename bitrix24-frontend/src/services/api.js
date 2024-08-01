// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const login = (username, password) => {
  return api.post('token/', { username, password });
};

export const register = (username, password) => {
  return api.post('register/', { username, password });
};

export const fetchReports = () => {
  return api.get('reports/');
};

export const fetchReport = (id) => {
  return api.get(`reports/${id}/`);
};

export const updateReport = (id, report) => {
  return api.put(`reports/${id}/`, report);
};

export const deleteReport = (id) => {
  return api.delete(`reports/${id}/`);
};

export const exportReportToExcel = (id) => {
  return api.get(`reports/${id}/export_excel/`, { responseType: 'blob' });
};

export const exportReportToImage = (id) => {
  return api.get(`reports/${id}/export_image/`, { responseType: 'blob' });
};

export const createReport = (report) => {
  return api.post('reports/', report);
};

export const fetchReportFields = (entityTypeId) => {
  return api.get(`fields/${entityTypeId}`);
};

export const fetchReportData = (id) => {
  return api.get(`reports/${id}/data/`);
};

export const fetchEntityTypes = () => {
  return api.get('entity_types/');
};

export default api;
