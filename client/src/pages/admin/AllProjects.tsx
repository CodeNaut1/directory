import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  verified: boolean;
  category: { name: string } | null;
  country: { name: string } | null;
  user: { name: string; email: string } | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; background: string; color: string }> = {
  approved: { label: 'Approved', background: '#D1FAE5', color: '#065F46' },
  pending: { label: 'Pending', background: '#FEF3C7', color: '#92400E' },
  rejected: { label: 'Rejected', background: '#FEE2E2', color: '#991B1B' },
  unpublished: { label: 'Unpublished', background: '#F2F4F7', color: '#475467' },
};

export default function AllProjects() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'unpublished'>('all');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          let filtered = data.data;
          if (filter === 'approved') {
            filtered = filtered.filter((p: Project) => p.status === 'approved');
          } else if (filter === 'unpublished') {
            filtered = filtered.filter((p: Project) => p.status !== 'approved');
          }
          setProjects(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) =>
    STATUS_LABELS[status] || { label: status, background: '#F3F4F6', color: '#4B5563' };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6B7280' }}>Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          All Projects
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          {projects.length} total projects in the directory
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
        {(['all', 'approved', 'unpublished'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: filter === tab ? '2px solid #FD5A47' : '2px solid transparent',
              color: filter === tab ? '#FD5A47' : '#6B7280',
              fontSize: '0.9375rem',
              fontWeight: filter === tab ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Project Name</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Country</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Owner</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Created</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const badge = getStatusBadge(project.status);
              return (
              <tr key={project.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '1rem', fontSize: '0.9375rem', color: '#1F2937', fontWeight: 500 }}>
                  {project.name}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                  {project.category?.name || '-'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                  {project.country?.name || '-'}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                  {project.user ? (project.user.name || project.user.email) : 'No owner'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: badge.background,
                    color: badge.color,
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {badge.label}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                  {formatDate(project.createdAt)}
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link
                    to={`/project/${project.slug}`}
                    target="_blank"
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#F3F4F6',
                      color: '#1F2937',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
