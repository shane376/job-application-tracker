import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Username and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData);
      navigate(ROUTES.DASHBOARD);
    } catch (_error) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Login</h2>
      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="username">
          Username
          <input id="username" name="username" type="text" value={formData.username} onChange={onChange} />
        </label>
        <label htmlFor="password">
          Password
          <input id="password" name="password" type="password" value={formData.password} onChange={onChange} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
