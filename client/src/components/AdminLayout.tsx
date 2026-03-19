import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'moderator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch pending count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/admin/projects/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setPendingCount(data.data.length);
          }
        }
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      fetchPendingCount();
    }
  }, [user, API_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/projects/pending', label: 'Pending Approvals', icon: '⏳', badge: pendingCount },
    { path: '/admin/claims', label: 'Ownership Claims', icon: '✋' },
    { path: '/admin/projects', label: 'All Projects', icon: '📁' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { path: '/admin/countries', label: 'Countries', icon: '🌍' },
    { path: '/admin/tags', label: 'Tags', icon: '🔖' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <>
      {/* ... rest of the styles ... */}
      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: ${showSidebar ? 'translateX(0)' : 'translateX(-100%)'};
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .mobile-sidebar-toggle {
            display: block !important;
          }
        }
        @media (min-width: 1025px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .mobile-sidebar-toggle {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5' }}>
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="mobile-sidebar-toggle"
          style={{
            position: 'fixed',
            top: 'calc(var(--navbar-height, 72px) + 1rem)',
            left: showSidebar ? '296px' : '1rem',
            zIndex: 51,
            background: '#1F2937',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'none',
            transition: 'left 0.3s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {showSidebar ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Sidebar */}
        <aside
          className="admin-sidebar"
          style={{
            width: '280px',
            background: '#1F2937',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            zIndex: 50,
            paddingTop: 'var(--navbar-height, 0px)',
            transition: 'transform 0.3s ease',
          }}
        >
          {/* Header */}
          <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#FD5A47' }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0.5rem 0 0 0' }}>
              {user.name || user.email}
            </p>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '1.5rem 0', overflowY: 'auto' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowSidebar(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.5rem',
                  color: isActive(item.path) ? '#FFFFFF' : '#9CA3AF',
                  background: isActive(item.path) ? 'rgba(253, 90, 71, 0.1)' : 'transparent',
                  borderLeft: isActive(item.path) ? '3px solid #FD5A47' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#9CA3AF';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '1rem 1.5rem' }} />

            {/* Back to Dashboard */}
            <Link
              to="/dashboard"
              onClick={() => setShowSidebar(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                color: '#9CA3AF',
                background: 'transparent',
                borderLeft: '3px solid transparent',
                textDecoration: 'none',
                fontSize: '0.9375rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>←</span>
              <span style={{ flex: 1 }}>Back to My Dashboard</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                color: '#EF4444',
                background: 'transparent',
                border: 'none',
                borderLeft: '3px solid transparent',
                textAlign: 'left',
                fontSize: '0.9375rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderLeft = '3px solid #EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '3px solid transparent';
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🚪</span>
              <span style={{ flex: 1 }}>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className="admin-main"
          style={{
            marginLeft: '280px',
            flex: 1,
            padding: 'clamp(1rem, 4vw, 2rem)',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}