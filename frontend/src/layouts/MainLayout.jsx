import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

function MainLayout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="top-nav">
        <h1>Smart Job Tracker</h1>
        <nav>
          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.username}</span>
              <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
              <Link to={ROUTES.RESUME_UPLOAD}>Resume Upload</Link>
              <button type="button" className="ghost-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>Login</Link>
              <Link to={ROUTES.REGISTER}>Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default MainLayout;
