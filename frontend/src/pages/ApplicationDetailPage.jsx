import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ROUTES } from '../constants/routes';

function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.applicationDetail(id));
        setFormData(response.data);
      } catch (_error) {
        setError('Unable to load application details.');
      }
    };

    loadApplication();
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
    </section>
  );
}

export default ApplicationDetailPage;
