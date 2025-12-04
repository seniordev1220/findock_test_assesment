import { FormEvent, useEffect, useMemo, useState } from 'react';
import { TaskInput, TaskStatus } from '../types/task';
import { AssigneeSelector } from './AssigneeSelector';

type TaskFormProps = {
  initialValue?: TaskInput;
  onSubmit: (payload: TaskInput) => void;
  submitLabel?: string;
};

const defaultTask: TaskInput = {
  title: '',
  description: '',
  status: 'todo',
  assigneeIds: [],
};

const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TaskForm = ({ initialValue, onSubmit, submitLabel = 'Create Task' }: TaskFormProps) => {
  const computedInitialValue = useMemo<TaskInput>(
    () => initialValue ?? { ...defaultTask },
    [initialValue],
  );

  const [form, setForm] = useState<TaskInput>(computedInitialValue);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    setForm(computedInitialValue);
  }, [computedInitialValue]);

  const handleChange = (key: keyof TaskInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'title' && errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
    if (key === 'description' && errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleAssigneesChange = (assigneeIds: string[]) => {
    setForm((prev) => ({ ...prev, assigneeIds }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { title?: string; description?: string } = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Title is required';
    } else if (form.title.length < 3) {
      nextErrors.title = 'Title must be at least 3 characters';
    } else if (form.title.length > 120) {
      nextErrors.title = 'Title must be at most 120 characters';
    }

    if (form.description && form.description.length > 2000) {
      nextErrors.description = 'Description must be at most 2000 characters';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(form);
    setForm({ ...defaultTask });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          required
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={form.description || ''}
          onChange={(event) => handleChange('description', event.target.value)}
        />
        {errors.description && <div className="field-error">{errors.description}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={form.status || 'todo'}
          onChange={(event) => handleChange('status', event.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <AssigneeSelector
          selectedIds={form.assigneeIds || []}
          onChange={handleAssigneesChange}
        />
      </div>
      <button type="submit">{submitLabel}</button>
    </form>
  );
};

