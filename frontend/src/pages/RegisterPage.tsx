import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }>({});

  const validate = () => {
    const nextErrors: typeof fieldErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    } else if (form.firstName.length > 50) {
      nextErrors.firstName = 'First name must be at most 50 characters';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    } else if (form.lastName.length > 50) {
      nextErrors.lastName = 'Last name must be at most 50 characters';
    }

    if (!form.email) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="form-error">{error}</div>}
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          required
          value={form.firstName}
          onChange={(event) => {
            const value = event.target.value;
            setForm((prev) => ({ ...prev, firstName: value }));
            if (fieldErrors.firstName) {
              setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
            }
          }}
        />
        {fieldErrors.firstName && <div className="field-error">{fieldErrors.firstName}</div>}
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          required
          value={form.lastName}
          onChange={(event) => {
            const value = event.target.value;
            setForm((prev) => ({ ...prev, lastName: value }));
            if (fieldErrors.lastName) {
              setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
            }
          }}
        />
        {fieldErrors.lastName && <div className="field-error">{fieldErrors.lastName}</div>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(event) => {
            const value = event.target.value;
            setForm((prev) => ({ ...prev, email: value }));
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
        />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={form.password}
          onChange={(event) => {
            const value = event.target.value;
            setForm((prev) => ({ ...prev, password: value }));
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
        />
        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

