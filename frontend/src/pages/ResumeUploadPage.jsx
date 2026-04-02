import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

function ResumeUploadPage() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadResumes = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESUMES);
      setResumes(response.data);
    } catch (_error) {
      setError('Unable to load uploaded resumes.');
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const onUpload = async (event) => {
    event.preventDefault();
    setError('');

    if (!title || !file) {
      setError('Resume title and PDF file are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      setIsUploading(true);
      await apiClient.post(API_ENDPOINTS.RESUMES, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setFile(null);
      await loadResumes();
    } catch (_error) {
      setError('Upload failed. Make sure you are uploading a valid PDF file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section>
      <h2>Resume Upload</h2>
      {error && <p className="form-error">{error}</p>}

      <form className="app-form" onSubmit={onUpload}>
        <input
          name="title"
          placeholder="Resume title (e.g. Backend Engineer Resume)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          name="resume_file"
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <button type="submit" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload Resume'}</button>
      </form>

      <h3>Uploaded Resumes</h3>
      <div className="application-grid">
        {resumes.map((resume) => (
          <article key={resume.id} className="application-card">
            <h4>{resume.title}</h4>
            <p>Uploaded: {new Date(resume.uploaded_at).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResumeUploadPage;
