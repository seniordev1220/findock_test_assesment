import { apiClient } from './client';
import { Task, TaskFilters, TaskInput, TaskListResponse } from '../types/task';

export const fetchTasks = async (filters?: TaskFilters): Promise<TaskListResponse> => {
  const params: Record<string, unknown> = {};

  if (filters?.search) {
    params.search = filters.search;
  }
  if (filters?.statuses && filters.statuses.length) {
    params.statuses = filters.statuses.join(',');
  }
  if (typeof filters?.page === 'number') {
    params.page = filters.page;
  }
  if (typeof filters?.pageSize === 'number') {
    params.limit = filters.pageSize;
  }
  if (filters?.sortBy) {
    params.sortBy = filters.sortBy;
  }
  if (filters?.sortOrder) {
    params.sortOrder = filters.sortOrder;
  }
  if (filters?.myTasks) {
    params.myTasks = 'true';
  }

  const { data } = await apiClient.get<TaskListResponse>('/tasks', { params });
  return data;
};

export const createTask = async (payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
};

export const updateTask = async (id: string, payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

