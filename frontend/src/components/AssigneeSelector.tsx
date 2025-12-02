import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/users';
import { AuthUser } from '../types/auth';
import { getUserInitials, getAvatarBackgroundColor } from '../utils/avatars';

type AssigneeSelectorProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export const AssigneeSelector = ({ selectedIds, onChange }: AssigneeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const selectedUsers = useMemo(() => {
    return users.filter((user) => selectedIds.includes(user.id));
  }, [users, selectedIds]);

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const removeUser = (userId: string) => {
    onChange(selectedIds.filter((id) => id !== userId));
  };

  return (
    <div className="assignee-selector">
      <label htmlFor="assignee-search">Assignees</label>
      <div className="assignee-selector__container">
        {/* Selected users display */}
        {selectedUsers.length > 0 && (
          <div className="assignee-selector__selected">
            {selectedUsers.map((user) => (
              <span key={user.id} className="assignee-tag">
                <span
                  className="assignee-avatar assignee-avatar--small"
                  style={{ backgroundColor: getAvatarBackgroundColor(user.id) }}
                >
                  {getUserInitials(user)}
                </span>
                <span className="assignee-tag__name">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  type="button"
                  className="assignee-tag__remove"
                  onClick={() => removeUser(user.id)}
                  aria-label={`Remove ${user.firstName} ${user.lastName}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search input and dropdown */}
        <div className="assignee-selector__input-wrapper">
          <input
            id="assignee-search"
            type="text"
            placeholder={selectedUsers.length === 0 ? 'Search users to assign...' : 'Add more assignees...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="assignee-selector__input"
          />
          {isOpen && (
            <>
              <div
                className="assignee-selector__overlay"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              <div className="assignee-selector__dropdown">
                {isLoading ? (
                  <div className="assignee-selector__loading">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="assignee-selector__empty">No users found</div>
                ) : (
                  <ul className="assignee-selector__list">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedIds.includes(user.id);
                      return (
                        <li key={user.id}>
                          <button
                            type="button"
                            className={`assignee-option ${isSelected ? 'assignee-option--selected' : ''}`}
                            onClick={() => {
                              toggleUser(user.id);
                              setSearchQuery('');
                            }}
                          >
                            <span
                              className="assignee-avatar"
                              style={{ backgroundColor: getAvatarBackgroundColor(user.id) }}
                            >
                              {getUserInitials(user)}
                            </span>
                            <span className="assignee-option__info">
                              <span className="assignee-option__name">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="assignee-option__meta">
                                {user.email} • {user.roles.join(', ')}
                              </span>
                            </span>
                            {isSelected && <span className="assignee-option__check">✓</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

