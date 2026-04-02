import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.username || !formData.password || !formData.confirm_password) {
      setError('Username and password fields are required.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate(ROUTES.LOGIN);
    } catch (_error) {
      setError('Registration failed. Username/email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Register</h2>
      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="username">
          Username
          <input id="username" name="username" type="text" value={formData.username} onChange={onChange} />
        </label>
        <label htmlFor="email">
          Email
          <input id="email" name="email" type="email" value={formData.email} onChange={onChange} />
        </label>
        <label htmlFor="password">
          Password
          <input id="password" name="password" type="password" value={formData.password} onChange={onChange} />
        </label>
        <label htmlFor="confirm_password">
          Confirm Password
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={onChange}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </section>
  );
}

export default RegisterPage;
