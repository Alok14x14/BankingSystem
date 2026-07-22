import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
              <path d="M3 7h18v4H3z" />
              <path d="M6 11v10" />
              <path d="M10 11v10" />
              <path d="M14 11v10" />
              <path d="M18 11v10" />
            </svg>
          </div>
          NexBank
        </Link>

        <div className="navbar-actions">
          <Link to="/" className="btn btn-ghost" id="nav-dashboard-link">
            Dashboard
          </Link>
          <Link to="/transfer" className="btn btn-ghost" id="nav-transfer-link">
            Transfer
          </Link>
          <div className="navbar-user">
            <div className="navbar-avatar">{getInitials(user?.name)}</div>
            <span>{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" id="logout-btn" style={{ color: 'var(--color-error-light)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
