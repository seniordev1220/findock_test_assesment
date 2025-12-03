import { Task, Comment } from '../types/task';
import { getUserInitials, getAvatarBackgroundColor } from '../utils/avatars';
import './ActivityTimeline.css';

type ActivityTimelineProps = {
  task: Task;
  comments: Comment[];
};

type ActivityItem = {
  type: 'created' | 'updated' | 'comment';
  timestamp: string;
  user?: { id: string; firstName: string; lastName: string };
  content?: string;
};

export const ActivityTimeline = ({ task, comments }: ActivityTimelineProps) => {
  const activities: ActivityItem[] = [];

  // Add task creation
  activities.push({
    type: 'created',
    timestamp: task.createdAt,
    user: task.owner,
  });

  // Add task update if different from creation
  if (task.updatedAt !== task.createdAt) {
    activities.push({
      type: 'updated',
      timestamp: task.updatedAt,
      user: task.owner,
    });
  }

  // Add comments
  comments.forEach((comment) => {
    activities.push({
      type: 'comment',
      timestamp: comment.createdAt,
      user: comment.author,
      content: comment.content,
    });
  });

  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityLabel = (activity: ActivityItem) => {
    if (!activity.user) return '';
    const userName = `${activity.user.firstName} ${activity.user.lastName}`;
    switch (activity.type) {
      case 'created':
        return `${userName} created this task`;
      case 'updated':
        return `${userName} updated this task`;
      case 'comment':
        return `${userName} commented`;
      default:
        return '';
    }
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="activity-timeline">
      <h3>Activity Timeline</h3>
      <div className="activity-timeline-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-item__icon">
              {activity.user && (
                <span
                  className="assignee-avatar assignee-avatar--small"
                  style={{ backgroundColor: getAvatarBackgroundColor(activity.user.id) }}
                >
                  {getUserInitials(activity.user)}
                </span>
              )}
            </div>
            <div className="activity-item__content">
              <div className="activity-item__header">
                <span className="activity-item__label">{getActivityLabel(activity)}</span>
                <span className="activity-item__time">{formatDate(activity.timestamp)}</span>
              </div>
              {activity.content && (
                <div className="activity-item__comment">{activity.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};





