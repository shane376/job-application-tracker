import { useEffect, useState } from 'react';
import apiClient from '../api/client';

function DashboardPage() {
  const [health, setHealth] = useState('Checking backend...');

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await apiClient.get('/health/');
        setHealth(`Backend status: ${response.data.status}`);
      } catch (_error) {
        setHealth('Backend unavailable. Verify API container is running.');
      }
    };

    fetchHealth();
  }, []);

  return (
    <section>
      <h2>Dashboard</h2>
      <p>{health}</p>
      <p>Application metrics and analytics arrive in later phases.</p>
    </section>
  );
}

export default DashboardPage;
