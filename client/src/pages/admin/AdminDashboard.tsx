import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  Tags,
  Globe,
  Hash,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AdminLoading, AdminPageHeader, ICON_STROKE } from '../../components/admin/AdminUI';

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

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  link: string;
  highlight?: boolean;
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
          headers: { Authorization: `Bearer ${token}` },
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
    return <AdminLoading message="Loading dashboard..." />;
  }

  const statCards: StatCard[] = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, link: '/admin/projects' },
    { label: 'Approved', value: stats?.publishedProjects || 0, icon: CheckCircle2, link: '/admin/projects?filter=approved' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, link: '/admin/projects/pending', highlight: true },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, link: '/admin/users' },
    { label: 'New This Week', value: stats?.newSubmissionsThisWeek || 0, icon: Sparkles, link: '/admin/projects?filter=recent' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: Tags, link: '/admin/categories' },
    { label: 'Countries', value: stats?.totalCountries || 0, icon: Globe, link: '/admin/countries' },
    { label: 'Tags', value: stats?.totalTags || 0, icon: Hash, link: '/admin/tags' },
  ];

  const quickActions = [
    {
      to: '/admin/projects/pending',
      icon: Clock,
      title: 'Review Pending Projects',
      description: `${stats?.pendingApprovals || 0} waiting for approval`,
    },
    {
      to: '/admin/categories',
      icon: Tags,
      title: 'Manage Categories',
      description: 'Add, edit, or delete',
    },
    {
      to: '/admin/users',
      icon: Users,
      title: 'Manage Users',
      description: 'View and edit user accounts',
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Welcome back. Here's what's happening with your directory."
      />

      <div className="admin-stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className={`admin-stat-card ${stat.highlight ? 'highlight' : ''}`}
            >
              <p className="admin-stat-label">
                <Icon size={14} strokeWidth={ICON_STROKE} />
                {stat.label}
              </p>
              <p className="admin-stat-value">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="admin-card admin-card-lg">
        <h2 className="admin-card-section-title">Quick Actions</h2>
        <div className="admin-quick-actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className="admin-quick-action">
                <div className="admin-quick-action-icon">
                  <Icon size={16} strokeWidth={ICON_STROKE} />
                </div>
                <div>
                  <p className="admin-quick-action-title">{action.title}</p>
                  <p className="admin-quick-action-desc">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
