import { Task } from '../types/task';
import { AuthUser } from '../types/auth';
import { getUserInitials, getAvatarBackgroundColor } from '../utils/avatars';

type TaskListProps = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  currentUser?: AuthUser | null;
};

// Backend returns roles for task.owner/assignees as Role objects,
// whereas AuthUser expects string role names. This helper normalises both.
const formatRoles = (roles: unknown): string => {
  if (!roles) return '';
  if (Array.isArray(roles)) {
    const names = roles
      .map((role) => {
        if (typeof role === 'string') return role;
        if (role && typeof role === 'object' && 'name' in role) {
          return String((role as { name?: unknown }).name ?? '');
        }
        return '';
      })
      .filter(Boolean);

    return names.join(', ');
  }

  return String(roles);
};

export const TaskList = ({ tasks, onEdit, onDelete, currentUser }: TaskListProps) => {
  if (!tasks.length) {
    return <p className="empty-state">No tasks yet.</p>;
  }

  const isAssignedToCurrentUser = (task: Task): boolean => {
    if (!currentUser) return false;
    return task.assignees.some((assignee) => assignee.id === currentUser.id);
  };

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const isAssigned = isAssignedToCurrentUser(task);
        return (
          <article
            key={task.id}
            className={`task-card ${isAssigned ? 'task-card--assigned' : ''}`}
          >
            <header className="task-card__header">
              <h3>
                {task.title}
                {isAssigned && (
                  <span className="task-card__badge" title="Assigned to you">
                    You
                  </span>
                )}
              </h3>
              <span className={`status status-${task.status}`}>{task.status.replace('_', ' ')}</span>
            </header>
            <p>{task.description}</p>
            <dl>
              <div>
                <dt>Owner</dt>
                <dd className="task-card__user-info">
                  <span
                    className="assignee-avatar assignee-avatar--small"
                    style={{ backgroundColor: getAvatarBackgroundColor(task.owner.id) }}
                  >
                    {getUserInitials(task.owner)}
                  </span>
                  <span>
                    {task.owner.firstName} {task.owner.lastName}
                    {formatRoles(task.owner.roles) && (
                      <span className="task-card__role"> ({formatRoles(task.owner.roles)})</span>
                    )}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Assignees</dt>
                <dd>
                  {task.assignees.length > 0 ? (
                    <div className="task-card__assignees">
                      {task.assignees.map((assignee) => (
                        <span key={assignee.id} className="task-card__assignee">
                          <span
                            className="assignee-avatar assignee-avatar--small"
                            style={{ backgroundColor: getAvatarBackgroundColor(assignee.id) }}
                          >
                            {getUserInitials(assignee)}
                          </span>
                          <span>
                            {assignee.firstName} {assignee.lastName}
                            {formatRoles(assignee.roles) && (
                              <span className="task-card__role"> ({formatRoles(assignee.roles)})</span>
                            )}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
            {(onEdit || onDelete) && (
              <footer className="task-card__actions">
                {onEdit && (
                  <button type="button" onClick={() => onEdit(task)}>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button type="button" onClick={() => onDelete(task)} className="danger">
                    Delete
                  </button>
                )}
              </footer>
            )}
          </article>
        );
      })}
    </div>
  );
};

