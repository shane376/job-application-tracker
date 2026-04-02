import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { buildApplicationDetailRoute } from '../constants/routes';

const INITIAL_FORM = {
  company: '',
  role: '',
  status: 'applied',
  job_description: '',
  notes: '',
};

function DashboardPage() {
  const [health, setHealth] = useState('Checking backend...');
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [healthResponse, applicationsResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.HEALTH),
        apiClient.get(API_ENDPOINTS.APPLICATIONS),
      ]);
      setHealth(`Backend status: ${healthResponse.data.status}`);
      setApplications(applicationsResponse.data);
    } catch (_error) {
      setHealth('Backend unavailable. Verify API container is running.');
      setError('Unable to fetch your applications right now.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statusCounts = useMemo(() => {
    return applications.reduce(
      (acc, application) => {
        acc[application.status] = (acc[application.status] || 0) + 1;
        return acc;
      },
      { applied: 0, interview: 0, rejected: 0, offer: 0 }
    );
  }, [applications]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onCreate = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.company || !formData.role) {
      setError('Company and role are required.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiClient.post(API_ENDPOINTS.APPLICATIONS, formData);
      setApplications((prev) => [response.data, ...prev]);
      setFormData(INITIAL_FORM);
    } catch (_error) {
      setError('Unable to create application. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <h2>Dashboard</h2>
      <p>{health}</p>
      {error && <p className="form-error">{error}</p>}

      <div className="kpi-grid">
        <article className="kpi-card">
          <h3>Total</h3>
          <p>{applications.length}</p>
        </article>
        <article className="kpi-card">
          <h3>Applied</h3>
          <p>{statusCounts.applied}</p>
        </article>
        <article className="kpi-card">
          <h3>Interview</h3>
          <p>{statusCounts.interview}</p>
        </article>
        <article className="kpi-card">
          <h3>Rejected</h3>
          <p>{statusCounts.rejected}</p>
        </article>
        <article className="kpi-card">
          <h3>Offer</h3>
          <p>{statusCounts.offer}</p>
        </article>
      </div>

      <h3>Add Application</h3>
      <form className="app-form" onSubmit={onCreate}>
        <input name="company" placeholder="Company" value={formData.company} onChange={onChange} />
        <input name="role" placeholder="Role" value={formData.role} onChange={onChange} />
        <select name="status" value={formData.status} onChange={onChange}>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
        </select>
        <textarea
          name="job_description"
          placeholder="Job description"
          value={formData.job_description}
          onChange={onChange}
        />
        <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={onChange} />
        <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Create Application'}</button>
      </form>

      <h3>Applications</h3>
      <div className="application-grid">
        {applications.map((application) => (
          <article key={application.id} className="application-card">
            <h4>{application.company}</h4>
            <p>{application.role}</p>
            <p className={`status-tag ${application.status}`}>{application.status}</p>
            <Link to={buildApplicationDetailRoute(application.id)}>Open details</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
