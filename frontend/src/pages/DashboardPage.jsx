import { useEffect, useState } from 'react';
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
  const [analytics, setAnalytics] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDashboardData = async () => {
    const [
      healthResult,
      applicationsResult,
      analyticsResult,
      matchesResult,
    ] = await Promise.allSettled([
      apiClient.get(API_ENDPOINTS.HEALTH),
      apiClient.get(API_ENDPOINTS.APPLICATIONS),
      apiClient.get(API_ENDPOINTS.ANALYTICS_OVERVIEW),
      apiClient.get(API_ENDPOINTS.AI_MATCHES),
    ]);

    const failures = [];

    if (healthResult.status === "fulfilled") {
      setHealth(`Backend status: ${healthResult.value.data.status}`);
    } else {
      setHealth('Backend unavailable. Verify API container is running.');
      failures.push('health');
    }

    if (applicationsResult.status === "fulfilled") {
      setApplications(applicationsResult.value.data);
    } else {
      setApplications([]);
      failures.push('applications');
    }

    if (analyticsResult.status === "fulfilled") {
      setAnalytics(analyticsResult.value.data);
    } else {
      setAnalytics(null);
      failures.push('analytics');
    }

    if (matchesResult.status === "fulfilled") {
      setRecentMatches(matchesResult.value.data.slice(0, 5));
    } else {
      setRecentMatches([]);
      failures.push('ai matches');
    }

    if (failures.length > 0) {
      setError(`Some dashboard data could not be loaded (${failures.join(', ')}).`);
    } else {
      setError('');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      await fetchDashboardData();
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
        <article className="kpi-card"><h3>Total Applications</h3><p>{analytics?.total_applications ?? applications.length}</p></article>
        <article className="kpi-card"><h3>Applied</h3><p>{analytics?.status_breakdown?.applied ?? 0}</p></article>
        <article className="kpi-card"><h3>Interview</h3><p>{analytics?.status_breakdown?.interview ?? 0}</p></article>
        <article className="kpi-card"><h3>Rejected</h3><p>{analytics?.status_breakdown?.rejected ?? 0}</p></article>
        <article className="kpi-card"><h3>Offer</h3><p>{analytics?.status_breakdown?.offer ?? 0}</p></article>
        <article className="kpi-card"><h3>Resumes</h3><p>{analytics?.resumes_uploaded ?? 0}</p></article>
        <article className="kpi-card"><h3>AI Matches</h3><p>{analytics?.matches_generated ?? 0}</p></article>
        <article className="kpi-card"><h3>Avg Match Score</h3><p>{analytics?.avg_match_score ?? 0}</p></article>
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
        <textarea name="job_description" placeholder="Job description" value={formData.job_description} onChange={onChange} />
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

      <h3>Recent AI Match Results</h3>
      <div className="application-grid">
        {recentMatches.length === 0 && <p>No AI matches yet. Run one from an application detail page.</p>}
        {recentMatches.map((match) => (
          <article key={match.id} className="application-card">
            <h4>Match #{match.id}</h4>
            <p>Score: {match.match_score}/100</p>
            <p>Missing skills: {match.missing_skills.length}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
