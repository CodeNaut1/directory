import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  pendingApprovals: number;
  totalUsers: number;
  newSubmissionsThisWeek: number;
  totalCategories: number;
  totalCountries: number;
  totalTags: number;
}

export default function AdminDashboard() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6B7280', fontSize: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, color: '#3B82F6', icon: '📁', link: '/admin/projects' },
    { label: 'Approved', value: stats?.publishedProjects || 0, color: '#10B981', icon: '✅', link: '/admin/projects?filter=approved' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, color: '#F59E0B', icon: '⏳', link: '/admin/projects/pending', highlight: true },
    { label: 'Total Users', value: stats?.totalUsers || 0, color: '#8B5CF6', icon: '👥', link: '/admin/users' },
    { label: 'New This Week', value: stats?.newSubmissionsThisWeek || 0, color: '#EC4899', icon: '🆕', link: '/admin/projects?filter=recent' },
    { label: 'Categories', value: stats?.totalCategories || 0, color: '#14B8A6', icon: '🏷️', link: '/admin/categories' },
    { label: 'Countries', value: stats?.totalCountries || 0, color: '#F97316', icon: '🌍', link: '/admin/countries' },
    { label: 'Tags', value: stats?.totalTags || 0, color: '#06B6D4', icon: '🔖', link: '/admin/tags' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          Welcome back! Here's what's happening with your directory.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: stat.highlight ? '0 4px 12px rgba(253, 90, 71, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: stat.highlight ? '2px solid #FD5A47' : 'none',
              textDecoration: 'none',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = stat.highlight ? '0 8px 20px rgba(253, 90, 71, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = stat.highlight ? '0 4px 12px rgba(253, 90, 71, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Background Icon */}
            <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '5rem', opacity: 0.05 }}>
              {stat.icon}
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </p>
              </div>
              <p style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, margin: 0 }}>
                {stat.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <Link
            to="/admin/projects/pending"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              background: '#FEF3F2',
              border: '2px solid #FD5A47',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FD5A47';
              (e.currentTarget.querySelector('.action-icon') as HTMLElement).style.color = '#FFFFFF';
              (e.currentTarget.querySelector('.action-text') as HTMLElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FEF3F2';
              (e.currentTarget.querySelector('.action-icon') as HTMLElement).style.color = '#FD5A47';
              (e.currentTarget.querySelector('.action-text') as HTMLElement).style.color = '#1F2937';
            }}
          >
            <div className="action-icon" style={{ fontSize: '2rem', color: '#FD5A47', transition: 'color 0.2s' }}>⏳</div>
            <div>
              <p className="action-text" style={{ fontSize: '1rem', fontWeight: 600, color: '#1F2937', margin: 0, transition: 'color 0.2s' }}>
                Review Pending Projects
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                {stats?.pendingApprovals || 0} waiting for approval
              </p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              background: '#F9FAFB',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
            }}
          >
            <div style={{ fontSize: '2rem' }}>🏷️</div>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Manage Categories
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                Add, edit, or delete
              </p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              background: '#F9FAFB',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
            }}
          >
            <div style={{ fontSize: '2rem' }}>👥</div>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                Manage Users
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
                View and edit user accounts
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}