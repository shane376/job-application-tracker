import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ROUTES } from '../constants/routes';

function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [applicationResponse, resumesResponse] = await Promise.all([
          apiClient.get(API_ENDPOINTS.applicationDetail(id)),
          apiClient.get(API_ENDPOINTS.RESUMES),
        ]);
        setFormData(applicationResponse.data);
        setResumes(resumesResponse.data);
        if (resumesResponse.data.length > 0) {
          setSelectedResumeId(String(resumesResponse.data[0].id));
        }
      } catch (_error) {
        setError('Unable to load application details.');
      }
    };

    loadData();
  }, [id]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await apiClient.put(API_ENDPOINTS.applicationDetail(id), formData);
      navigate(ROUTES.DASHBOARD);
    } catch (_error) {
      setError('Unable to save application changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      await apiClient.delete(API_ENDPOINTS.applicationDetail(id));
      navigate(ROUTES.DASHBOARD);
    } catch (_error) {
      setError('Unable to delete application.');
    }
  };

  const onRunMatch = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume first.');
      return;
    }

    try {
      setError('');
      setIsMatching(true);
      const response = await apiClient.post(API_ENDPOINTS.AI_MATCH, {
        application_id: Number(id),
        resume_id: Number(selectedResumeId),
      });
      setMatchResult(response.data);
    } catch (_error) {
      setError('Unable to run AI match analysis right now.');
    } finally {
      setIsMatching(false);
    }
  };

  if (!formData) {
    return <section><p>Loading application...</p>{error && <p className="form-error">{error}</p>}</section>;
  }

  return (
    <section>
      <h2>Application Detail</h2>
      {error && <p className="form-error">{error}</p>}
      <form className="app-form" onSubmit={onSave}>
        <input name="company" value={formData.company} onChange={onChange} />
        <input name="role" value={formData.role} onChange={onChange} />
        <select name="status" value={formData.status} onChange={onChange}>
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
          <option value="offer">Offer</option>
        </select>
        <textarea name="job_description" value={formData.job_description || ''} onChange={onChange} />
        <textarea name="notes" value={formData.notes || ''} onChange={onChange} />
        <div className="row-actions">
          <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="danger-btn" onClick={onDelete}>Delete</button>
        </div>
      </form>

      <hr />

      <h3>AI Match Analysis</h3>
      <div className="ai-panel">
        <select value={selectedResumeId} onChange={(event) => setSelectedResumeId(event.target.value)}>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>{resume.title}</option>
          ))}
        </select>
        <button type="button" onClick={onRunMatch} disabled={isMatching || resumes.length === 0}>
          {isMatching ? 'Analyzing...' : 'Run AI Match'}
        </button>
      </div>

      {matchResult && (
        <article className="match-card">
          <h4>Match Score: {matchResult.match_score}/100</h4>
          <p><strong>Missing Skills</strong></p>
          <ul>
            {matchResult.missing_skills.map((item, index) => (
              <li key={`missing-skill-${index}-${item}`}>{item}</li>
            ))}
          </ul>
          <p><strong>Improvement Suggestions</strong></p>
          <ul>
            {matchResult.improvement_suggestions.map((item, index) => (
              <li key={`suggestion-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

export default ApplicationDetailPage;
