import { axiosInstance } from './auth.api';

const invoiceApi = {
  parse: (text) => axiosInstance.post('/invoices/parse', { text }),
  create: (data) => axiosInstance.post('/invoices', data),
  getAll: (params) => axiosInstance.get('/invoices', { params }),
  getStats: () => axiosInstance.get('/invoices/stats'),
  getById: (id) => axiosInstance.get(`/invoices/${id}`),
  getPublic: (token) => axiosInstance.get(`/invoices/public/${token}`),
  update: (id, data) => axiosInstance.put(`/invoices/${id}`, data),
  updateStatus: (id, data) => axiosInstance.put(`/invoices/${id}/status`, data),
  delete: (id) => axiosInstance.delete(`/invoices/${id}`),
  duplicate: (id) => axiosInstance.post(`/invoices/${id}/duplicate`),
  sendWhatsApp: (id, data) => axiosInstance.post(`/invoices/${id}/send-whatsapp`, data),
};

export default invoiceApi;
