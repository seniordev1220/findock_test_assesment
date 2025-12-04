import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTask, fetchComments, createComment, updateComment, deleteComment } from '../api/tasks';
import { Comment, CommentInput } from '../types/task';
import { useAuth } from '../hooks/useAuth';
import { getUserInitials, getAvatarBackgroundColor } from '../utils/avatars';
import { CommentsSection } from '../components/CommentsSection';
import { ActivityTimeline } from '../components/ActivityTimeline';
import './TaskDetailPage.css';
import { getApiErrorMessage } from '../utils/apiError';

export const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id!),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const createCommentMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: CommentInput }) =>
      createComment(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Failed to create comment');
      window.alert(message);
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ id: commentId, payload }: { id: string; payload: CommentInput }) =>
      updateComment(commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Failed to update comment');
      window.alert(message);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Failed to delete comment');
      window.alert(message);
    },
  });

  const handleCreateComment = (content: string) => {
    if (!id) return;
    createCommentMutation.mutate({ taskId: id, payload: { content } });
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    updateCommentMutation.mutate({ id: commentId, payload: { content } });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (taskLoading) {
    return (
      <div className="task-detail-page">
        <div className="task-detail-loading">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-page">
        <div className="task-detail-error">Task not found</div>
        <button onClick={() => navigate('/tasks')}>Back to Tasks</button>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <div className="task-detail-header">
        <button className="task-detail-back" onClick={() => navigate('/tasks')}>
          ← Back to Tasks
        </button>
        <h1 className="task-detail-title">{task.title}</h1>
      </div>

      <div className="task-detail-content">
        <div className="task-detail-main">
          <section className="task-detail-section">
            <h2>Description</h2>
            <p className="task-detail-description">{task.description || 'No description provided.'}</p>
          </section>

          <section className="task-detail-section">
            <h2>Details</h2>
            <dl className="task-detail-details">
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`status status-${task.status}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd className="task-detail-user">
                  <span
                    className="assignee-avatar"
                    style={{ backgroundColor: getAvatarBackgroundColor(task.owner.id) }}
                  >
                    {getUserInitials(task.owner)}
                  </span>
                  <span>
                    {task.owner.firstName} {task.owner.lastName}
                    {formatRoles(task.owner.roles) && (
                      <span className="task-detail-role"> ({formatRoles(task.owner.roles)})</span>
                    )}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Assignees</dt>
                <dd>
                  {task.assignees.length > 0 ? (
                    <div className="task-detail-assignees">
                      {task.assignees.map((assignee) => (
                        <div key={assignee.id} className="task-detail-user">
                          <span
                            className="assignee-avatar assignee-avatar--small"
                            style={{ backgroundColor: getAvatarBackgroundColor(assignee.id) }}
                          >
                            {getUserInitials(assignee)}
                          </span>
                          <span>
                            {assignee.firstName} {assignee.lastName}
                            {formatRoles(assignee.roles) && (
                              <span className="task-detail-role"> ({formatRoles(assignee.roles)})</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
              <div>
                <dt>Last Updated</dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {task.attachments && task.attachments.length > 0 && (
            <section className="task-detail-section">
              <h2>Attachments</h2>
              <ul className="task-detail-attachments">
                {task.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/static/${attachment.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.filename}
                    </a>
                    <span className="task-detail-attachment-type">({attachment.mimetype})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="task-detail-section">
            <h2>Comments</h2>
            <CommentsSection
              comments={comments}
              isLoading={commentsLoading}
              currentUser={user}
              onCreateComment={handleCreateComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
          </section>
        </div>

        <div className="task-detail-sidebar">
          <ActivityTimeline task={task} comments={comments} />
        </div>
      </div>
    </div>
  );
};

