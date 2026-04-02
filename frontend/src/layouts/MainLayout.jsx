import { Link } from 'react-router-dom';

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <h1>Smart Job Tracker</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/resumes/upload">Resume Upload</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default MainLayout;
