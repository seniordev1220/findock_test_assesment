import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { Task, TaskInput, TaskStatus, TaskFilters } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useAuth } from '../hooks/useAuth';

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialFilters: TaskFilters = useMemo(() => {
    const search = searchParams.get('search') ?? undefined;
    const statusesParam = searchParams.get('statuses') ?? '';
    const statuses = statusesParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as TaskStatus[];
    const page = parseInt(searchParams.get('page') ?? '1', 10) || 1;
    const sortBy = (searchParams.get('sortBy') as TaskFilters['sortBy']) ?? 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as TaskFilters['sortOrder']) ?? 'desc';
    const myTasks = searchParams.get('myTasks') === 'true';

    return {
      search,
      statuses: statuses.length ? statuses : undefined,
      page,
      pageSize: 5,
      sortBy,
      sortOrder,
      myTasks,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<TaskFilters>(initialFilters);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = data?.page ?? filters.page ?? 1;
  const pageSize = data?.pageSize ?? filters.pageSize ?? 5;
  const totalPages = data?.totalPages ?? 1;

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setEditingTask(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskInput }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleCreate = (payload: TaskInput) => {
    createMutation.mutate(payload);
  };

  const handleUpdate = (payload: TaskInput) => {
    if (!editingTask) return;
    updateMutation.mutate({ id: editingTask.id, payload });
  };

  const canManage = user?.roles.some((role) => role === 'admin' || role === 'manager');

  const handleSearchChange = (value: string) => {
    const nextFilters: TaskFilters = { ...filters, search: value || undefined, page: 1 };
    setFilters(nextFilters);
    const nextParams: Record<string, string> = {};
    if (nextFilters.search) nextParams.search = nextFilters.search;
    if (nextFilters.statuses?.length) nextParams.statuses = nextFilters.statuses.join(',');
    nextParams.page = String(nextFilters.page ?? 1);
    nextParams.sortBy = nextFilters.sortBy ?? 'createdAt';
    nextParams.sortOrder = nextFilters.sortOrder ?? 'desc';
    if (nextFilters.myTasks) nextParams.myTasks = 'true';
    setSearchParams(nextParams);
  };

  const handleStatusToggle = (status: TaskStatus) => {
    const current = filters.statuses ?? [];
    const exists = current.includes(status);
    const nextStatuses = exists ? current.filter((s) => s !== status) : [...current, status];
    const nextFilters: TaskFilters = {
      ...filters,
      statuses: nextStatuses.length ? nextStatuses : undefined,
      page: 1,
    };
    setFilters(nextFilters);
    const nextParams: Record<string, string> = {};
    if (nextFilters.search) nextParams.search = nextFilters.search;
    if (nextFilters.statuses?.length) nextParams.statuses = nextFilters.statuses.join(',');
    nextParams.page = String(nextFilters.page ?? 1);
    nextParams.sortBy = nextFilters.sortBy ?? 'createdAt';
    nextParams.sortOrder = nextFilters.sortOrder ?? 'desc';
    if (nextFilters.myTasks) nextParams.myTasks = 'true';
    setSearchParams(nextParams);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const nextFilters: TaskFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    const nextParams: Record<string, string> = {};
    if (nextFilters.search) nextParams.search = nextFilters.search;
    if (nextFilters.statuses?.length) nextParams.statuses = nextFilters.statuses.join(',');
    nextParams.page = String(nextFilters.page ?? 1);
    nextParams.sortBy = nextFilters.sortBy ?? 'createdAt';
    nextParams.sortOrder = nextFilters.sortOrder ?? 'desc';
    if (nextFilters.myTasks) nextParams.myTasks = 'true';
    setSearchParams(nextParams);
  };

  const handleMyTasksToggle = () => {
    const nextFilters: TaskFilters = { ...filters, myTasks: !filters.myTasks, page: 1 };
    setFilters(nextFilters);
    const nextParams: Record<string, string> = {};
    if (nextFilters.search) nextParams.search = nextFilters.search;
    if (nextFilters.statuses?.length) nextParams.statuses = nextFilters.statuses.join(',');
    nextParams.page = String(nextFilters.page ?? 1);
    nextParams.sortBy = nextFilters.sortBy ?? 'createdAt';
    nextParams.sortOrder = nextFilters.sortOrder ?? 'desc';
    if (nextFilters.myTasks) nextParams.myTasks = 'true';
    setSearchParams(nextParams);
  };

  return (
    <div className="tasks-page">
      <section className="tasks-section">
        <div className="tasks-section__header">
          <h2>Tasks</h2>
          <div className="tasks-filters-inline">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={filters.search ?? ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="tasks-search-input"
            />
            <div className="tasks-status-filters">
              <label>
                <input
                  type="checkbox"
                  checked={filters.statuses?.includes('todo') ?? false}
                  onChange={() => handleStatusToggle('todo')}
                />
                Todo
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.statuses?.includes('in_progress') ?? false}
                  onChange={() => handleStatusToggle('in_progress')}
                />
                In Progress
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.statuses?.includes('done') ?? false}
                  onChange={() => handleStatusToggle('done')}
                />
                Done
              </label>
            </div>
            <button
              type="button"
              className={`tasks-my-toggle ${filters.myTasks ? 'tasks-my-toggle--active' : ''}`}
              onClick={handleMyTasksToggle}
            >
              My Tasks
            </button>
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
              >
                Create Task
              </button>
            )}
          </div>
        </div>
        {isLoading ? (
          <p>Loading tasks…</p>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onEdit={
                canManage
                  ? (task) => {
                      setEditingTask(task);
                      setIsModalOpen(true);
                    }
                  : undefined
              }
              onDelete={canManage ? (task) => deleteMutation.mutate(task.id) : undefined}
            />
            <div className="tasks-pagination">
              <span className="tasks-pagination__info">
                Showing{' '}
                {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}{' '}
                tasks (page {page} of {totalPages})
              </span>
              <div className="tasks-pagination__controls">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="tasks-pagination__current">{page}</span>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {canManage && isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
        >
          <div
            className="modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="modal__header">
              <h3>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
              <button
                type="button"
                className="modal__close"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <TaskForm
              initialValue={
                editingTask
                  ? {
                      title: editingTask.title,
                      description: editingTask.description,
                      status: editingTask.status,
                      assigneeIds: editingTask.assignees.map((assignee) => assignee.id),
                    }
                  : undefined
              }
              onSubmit={editingTask ? handleUpdate : handleCreate}
              submitLabel={editingTask ? 'Update Task' : 'Create Task'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

