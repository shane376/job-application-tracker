import { useParams } from 'react-router-dom';

function ApplicationDetailPage() {
  const { id } = useParams();

  return (
    <section>
      <h2>Application Detail</h2>
      <p>Viewing application #{id}</p>
      <p>CRUD detail editor will be implemented in Phase 3.</p>
    </section>
  );
}

export default ApplicationDetailPage;
