import { axiosInstance } from './auth.api';

const businessApi = {
  create: (data) => axiosInstance.post('/business', data),
  get: () => axiosInstance.get('/business'),
  update: (data) => axiosInstance.put('/business', data),
  uploadLogo: (formData) =>
    axiosInstance.post('/business/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default businessApi;
