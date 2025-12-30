import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoUrl from '../assets/African-Bitcoiners-official_logo.png';
import '../styles/global.css';

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        className="navbar-container"
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 'fit-content',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 1 }}>
          <img
            src={logoUrl}
            alt="African Bitcoiners"
            style={{
              height: 80,
              width: 80,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>

        <nav
          className="navbar-nav"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem',
            zIndex: 1,
          }}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            HOME
          </NavLink>
          <NavLink
            to="/infographic"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            INFOGRAPHIC
          </NavLink>
          <NavLink
            to="/live-map"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            LIVE MAP
          </NavLink>
          <NavLink
            to="/african-bitcoiners"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            AFRICAN BITCOINERS
          </NavLink>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              LOGOUT
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              LOGIN
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}