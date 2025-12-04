import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('task_app_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simple retry logic for transient errors (bonus)
const shouldRetryRequest = (error: AxiosError) => {
  if (!error.config) return false;
  const status = error.response?.status;
  // Retry on network errors and 5xx responses
  return !status || (status >= 500 && status < 600);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (AxiosRequestConfig & { __retryCount?: number }) | undefined;

    if (config && shouldRetryRequest(error)) {
      config.__retryCount = config.__retryCount ?? 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        const delay = 300 * config.__retryCount;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
      console.error('Make sure the backend is running on', API_BASE_URL);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  },
);

