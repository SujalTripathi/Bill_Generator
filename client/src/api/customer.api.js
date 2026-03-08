import { axiosInstance } from './auth.api';

const customerApi = {
  create: (data) => axiosInstance.post('/customers', data),
  getAll: (params) => axiosInstance.get('/customers', { params }),
  getById: (id) => axiosInstance.get(`/customers/${id}`),
  update: (id, data) => axiosInstance.put(`/customers/${id}`, data),
  delete: (id) => axiosInstance.delete(`/customers/${id}`),
};

export default customerApi;
