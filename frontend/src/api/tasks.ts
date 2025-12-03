import { apiClient } from './client';
import { Task, TaskFilters, TaskInput, TaskListResponse, Comment, CommentInput } from '../types/task';

export const fetchTask = async (id: string): Promise<Task> => {
  const { data } = await apiClient.get<Task>(`/tasks/${id}`);
  return data;
};

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

// Comment API functions
export const fetchComments = async (taskId: string): Promise<Comment[]> => {
  const { data } = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
  return data;
};

export const createComment = async (taskId: string, payload: CommentInput): Promise<Comment> => {
  const { data } = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, payload);
  return data;
};

export const updateComment = async (id: string, payload: CommentInput): Promise<Comment> => {
  const { data } = await apiClient.put<Comment>(`/comments/${id}`, payload);
  return data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await apiClient.delete(`/comments/${id}`);
};

