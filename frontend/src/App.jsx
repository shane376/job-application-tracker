import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ResumeUploadPage from './pages/ResumeUploadPage';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/resumes/upload" element={<ResumeUploadPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
