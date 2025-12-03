import { AuthUser } from './auth';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskAttachment = {
  id: string;
  filename: string;
  mimetype: string;
  path: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  owner: AuthUser;
  assignees: AuthUser[];
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeIds?: string[];
};

export type TaskSortField = 'createdAt' | 'title' | 'status';

export type TaskFilters = {
  search?: string;
  statuses?: TaskStatus[];
  page?: number;
  pageSize?: number;
  sortBy?: TaskSortField;
  sortOrder?: 'asc' | 'desc';
  myTasks?: boolean;
};

export type TaskListResponse = {
  items: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type Comment = {
  id: string;
  content: string;
  task: Task;
  author: AuthUser;
  createdAt: string;
  updatedAt: string;
};

export type CommentInput = {
  content: string;
};

