import { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Comment } from '../types/task';
import { AuthUser } from '../types/auth';
import { getUserInitials, getAvatarBackgroundColor } from '../utils/avatars';
import { fetchUsers } from '../api/users';
import './CommentsSection.css';

type CommentsSectionProps = {
  comments: Comment[];
  isLoading: boolean;
  currentUser: AuthUser | null;
  onCreateComment: (content: string) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
};

// Simple markdown renderer for comments
const renderMarkdown = (text: string, users: AuthUser[] = []): JSX.Element => {
  // Create a map of user mentions
  const userMap = new Map(users.map((u) => [`@${u.firstName}${u.lastName}`, u]));
  users.forEach((u) => {
    userMap.set(`@${u.firstName}`, u);
    userMap.set(`@${u.lastName}`, u);
    userMap.set(`@${u.email.split('@')[0]}`, u);
  });

  // Split text and process mentions and markdown
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  const mentionRegex = /@(\w+)/g;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(...formatText(beforeText));
    }

    // Check if mention matches a user
    const mention = match[0];
    const user = userMap.get(mention);
    if (user) {
      parts.push(
        <span key={match.index} className="comment-mention" title={`${user.firstName} ${user.lastName}`}>
          {mention}
        </span>
      );
    } else {
      parts.push(mention);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(...formatText(text.substring(lastIndex)));
  }

  return <>{parts.length > 0 ? parts : formatText(text)}</>;
};

const formatText = (text: string): (string | JSX.Element)[] => {
  const parts: (string | JSX.Element)[] = [];
  let processed = text;

  // Bold: **text**
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Code: `code`
  processed = processed.replace(/`(.+?)`/g, '<code>$1</code>');
  // Links: [text](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Split by line breaks
  const lines = processed.split('\n');
  lines.forEach((line, idx) => {
    if (idx > 0) parts.push(<br key={`br-${idx}`} />);
    parts.push(<span key={`line-${idx}`} dangerouslySetInnerHTML={{ __html: line }} />);
  });

  return parts;
};

export const CommentsSection = ({
  comments,
  isLoading,
  currentUser,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
}: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const filteredMentionUsers = useMemo(() => {
    if (!mentionQuery) return users.slice(0, 5);
    const query = mentionQuery.toLowerCase();
    return users
      .filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [users, mentionQuery]);

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

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setMentionPosition(lastAtIndex);
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);
  };

  const insertMention = (user: AuthUser) => {
    if (!textareaRef.current) return;
    const text = newComment;
    const beforeMention = text.substring(0, mentionPosition);
    const afterMention = text.substring(textareaRef.current.selectionStart);
    const mention = `@${user.firstName}${user.lastName} `;
    const newText = beforeMention + mention + afterMention;
    setNewComment(newText);
    setShowMentionDropdown(false);
    setMentionQuery('');
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = beforeMention.length + mention.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onCreateComment(newComment.trim());
      setNewComment('');
      setShowMentionDropdown(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      onUpdateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const canEdit = (comment: Comment): boolean => {
    return currentUser?.id === comment.author.id;
  };

  const canDelete = (comment: Comment): boolean => {
    return currentUser?.id === comment.author.id;
  };

  if (isLoading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  return (
    <div className="comments-section">
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <span
                    className="assignee-avatar assignee-avatar--small"
                    style={{ backgroundColor: getAvatarBackgroundColor(comment.author.id) }}
                  >
                    {getUserInitials(comment.author)}
                  </span>
                  <div className="comment-author-info">
                    <span className="comment-author-name">
                      {comment.author.firstName} {comment.author.lastName}
                    </span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="comment-edited">(edited)</span>
                    )}
                  </div>
                </div>
                {(canEdit(comment) || canDelete(comment)) && (
                  <div className="comment-actions">
                    {canEdit(comment) && editingId !== comment.id && (
                      <button
                        className="comment-action-btn"
                        onClick={() => handleStartEdit(comment)}
                        title="Edit comment"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete(comment) && (
                      <button
                        className="comment-action-btn--danger"
                        onClick={() => onDeleteComment(comment.id)}
                        title="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <div className="comment-edit">
                  <textarea
                    className="comment-edit-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="comment-edit-actions">
                    <button
                      className="comment-save-btn"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </button>
                    <button className="comment-cancel-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-content">{renderMarkdown(comment.content, users)}</div>
              )}
            </div>
          ))
        )}
      </div>

      {currentUser && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-header">
            <span
              className="assignee-avatar assignee-avatar--small"
              style={{ backgroundColor: getAvatarBackgroundColor(currentUser.id) }}
            >
              {getUserInitials(currentUser)}
            </span>
            <span className="comment-form-author">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </div>
          <div className="comment-form-input-wrapper">
            <textarea
              ref={textareaRef}
              className="comment-form-input"
              value={newComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              onKeyDown={(e) => {
                if (showMentionDropdown && e.key === 'ArrowDown') {
                  e.preventDefault();
                }
              }}
              placeholder="Add a comment... Use @ to mention users, **bold**, *italic*, `code`"
              rows={3}
            />
            {showMentionDropdown && filteredMentionUsers.length > 0 && (
              <div className="comment-mention-dropdown">
                {filteredMentionUsers.map((user) => (
                  <div
                    key={user.id}
                    className="comment-mention-option"
                    onClick={() => insertMention(user)}
                  >
                    <span
                      className="assignee-avatar assignee-avatar--small"
                      style={{ backgroundColor: getAvatarBackgroundColor(user.id) }}
                    >
                      {getUserInitials(user)}
                    </span>
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="comment-form-actions">
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!newComment.trim()}
            >
              Post Comment
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

