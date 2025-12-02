import { Task } from '../entities/Task';
import { AuthTokenPayload } from './auth';

const hasRole = (user: AuthTokenPayload | undefined, role: string): boolean =>
  !!user?.roles.includes(role);

export const canEditTask = (user: AuthTokenPayload | undefined, task: Task): boolean => {
  if (!user) return false;
  if (hasRole(user, 'admin')) return true;
  if (hasRole(user, 'manager')) return true;
  // Regular users: only edit tasks they own
  return task.owner?.id === user.userId;
};

export const canDeleteTask = (user: AuthTokenPayload | undefined, task: Task): boolean => {
  if (!user) return false;
  if (hasRole(user, 'admin')) return true;
  // Managers: delete only tasks they own
  if (hasRole(user, 'manager')) {
    return task.owner?.id === user.userId;
  }
  // Regular users: delete only tasks they own
  return task.owner?.id === user.userId;
};



