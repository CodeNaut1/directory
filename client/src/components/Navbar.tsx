import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import logoUrl from '../assets/African-Bitcoiners-official_logo.png';
import '../styles/global.css';

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setShowMobileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .navbar-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .navbar-nav {
            display: flex !important;
          }
        }
      `}</style>

      <header
        ref={(el) => {
          if (el) {
            document.documentElement.style.setProperty('--navbar-height', `${el.offsetHeight}px`);
          }
        }}
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <div
          className="navbar-container"
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0.5rem clamp(1rem, 4vw, 2rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 'fit-content',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, zIndex: 101 }}>
            <NavLink to="/">
              <img
                src={logoUrl}
                alt="African Bitcoiners"
                style={{
                  height: 'clamp(50px, 8vw, 60px)',
                  width: 'clamp(50px, 8vw, 60px)',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            </NavLink>
          </div>

          {/* Desktop Nav Links */}
          <nav
            className="navbar-nav"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
            }}
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                borderBottom: isActive ? '2px solid #FD5A47' : '2px solid transparent',
                paddingBottom: '0.25rem',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              })}
            >
              HOME
            </NavLink>
            <NavLink
              to="/infographic-q1-2026"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                borderBottom: isActive ? '2px solid #FD5A47' : '2px solid transparent',
                paddingBottom: '0.25rem',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              })}
            >
              INFOGRAPHIC
            </NavLink>
            <NavLink
              to="/live-map"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                borderBottom: isActive ? '2px solid #FD5A47' : '2px solid transparent',
                paddingBottom: '0.25rem',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              })}
            >
              LIVE MAP
            </NavLink>
            <a
              href="https://bitcoiners.africa/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              style={{
                borderBottom: '2px solid transparent',
                paddingBottom: '0.25rem',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottom = '2px solid #FD5A47';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottom = '2px solid transparent';
              }}
            >
              AFRICAN BITCOINERS
            </a>
          </nav>

          {/* Right Side: Mobile Menu + User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, zIndex: 101 }}>
            {/* Mobile Hamburger Menu */}
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'none',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2">
                {showMobileMenu ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>

            {/* User Menu / Login */}
            {isLoggedIn ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    background: showUserMenu ? '#F3F4F6' : '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!showUserMenu) e.currentTarget.style.background = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!showUserMenu) e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      minWidth: '200px',
                      overflow: 'hidden',
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                        {user?.name || 'User'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                        {user?.email}
                      </p>
                    </div>

                    <div style={{ padding: '0.5rem 0' }}>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin');
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#1F2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F9FAFB';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span style={{ fontSize: '1rem' }}>⚙️</span>
                          Admin Panel
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/dashboard');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#1F2937',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>📊</span>
                        My Dashboard
                      </button>

                      <div style={{ height: '1px', background: '#E5E7EB', margin: '0.5rem 0' }} />

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#DC2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FEF2F2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E04835';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FD5A47';
                }}
              >
                LOGIN
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderBottom: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 99,
            }}
          >
            <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <NavLink
                to="/"
                end
                onClick={() => setShowMobileMenu(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1F2937',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                HOME
              </NavLink>
              <NavLink
                to="/infographic-q1-2026"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1F2937',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                INFOGRAPHIC
              </NavLink>
              <NavLink
                to="/live-map"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1F2937',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                LIVE MAP
              </NavLink>
              <a
                href="https://bitcoiners.africa/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: '#1F2937',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                AFRICAN BITCOINERS
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}