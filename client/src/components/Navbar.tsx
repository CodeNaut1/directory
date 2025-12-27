import { NavLink } from 'react-router-dom';
import logoUrl from '../assets/African-Bitcoiners-official_logo.png';
import '../styles/global.css';

export default function Navbar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
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
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 80,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 1 }}>
          <img
            src={logoUrl}
            alt="African Bitcoiners"
            style={{
              height: 50,
              width: 50,
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
            to="/infographic-q1-2026"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            INFOGRAPHIC Q1 2026
          </NavLink>
          <NavLink
            to="/live-map"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            LIVE MAP
          </NavLink>
        </nav>

        <div style={{ flexShrink: 0, zIndex: 1 }}>
          <a
            href="https://bitcoiners.africa"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link-external"
          >
            VISIT AFRICAN BITCOINERS WEBSITE
          </a>
        </div>
      </div>
    </header>
  );
}


