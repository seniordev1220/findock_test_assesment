import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback = 'Unexpected error') => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export type ValidationErrors = Record<string, string[]>;


