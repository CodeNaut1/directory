import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  Shield,
  FolderOpen,
  Tags,
  Globe,
  Hash,
  Users,
  Download,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { ICON_STROKE } from './admin/AdminUI';
import '../styles/admin.css';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'moderator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/admin/projects/pending`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const isActive = (path: string) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/projects/pending', label: 'Pending Approvals', icon: Clock, badge: pendingCount },
    { path: '/admin/claims', label: 'Ownership Claims', icon: Shield },
    { path: '/admin/projects', label: 'All Projects', icon: FolderOpen },
    { path: '/admin/categories', label: 'Categories', icon: Tags },
    { path: '/admin/countries', label: 'Countries', icon: Globe },
    { path: '/admin/tags', label: 'Tags', icon: Hash },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/export', label: 'Export CSV', icon: Download },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="admin-shell">
      <button
        type="button"
        onClick={() => setShowSidebar(!showSidebar)}
        className="admin-mobile-toggle"
        style={{ left: showSidebar ? '276px' : '1rem' }}
        aria-label={showSidebar ? 'Close menu' : 'Open menu'}
      >
        {showSidebar ? <X size={18} strokeWidth={ICON_STROKE} /> : <Menu size={18} strokeWidth={ICON_STROKE} />}
      </button>

      <aside className={`admin-sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h1 className="admin-sidebar-title">Admin</h1>
          <p className="admin-sidebar-subtitle">{user.name || user.email}</p>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowSidebar(false)}
                className={`admin-nav-link ${active ? 'active' : ''}`}
              >
                <Icon size={16} strokeWidth={ICON_STROKE} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}

          <div className="admin-nav-divider" />

          <Link
            to="/dashboard"
            onClick={() => setShowSidebar(false)}
            className="admin-nav-link"
          >
            <ArrowLeft size={16} strokeWidth={ICON_STROKE} />
            <span style={{ flex: 1 }}>Back to My Dashboard</span>
          </Link>

          <button type="button" onClick={handleLogout} className="admin-nav-link logout">
            <LogOut size={16} strokeWidth={ICON_STROKE} />
            <span style={{ flex: 1 }}>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
