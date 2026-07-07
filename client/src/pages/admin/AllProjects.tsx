import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, RotateCcw, EyeOff } from 'lucide-react';
import {
  AdminBadge,
  AdminLoading,
  AdminPageHeader,
  AdminTabs,
  statusToBadgeVariant,
} from '../../components/admin/AdminUI';

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

const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  unpublished: 'Unpublished',
};

export default function AllProjects() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'unpublished'>('all');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          let filtered = data.data;
          if (filter === 'approved') {
            filtered = filtered.filter((p: Project) => p.status === 'approved');
          } else if (filter === 'unpublished') {
            filtered = filtered.filter((p: Project) => p.status === 'unpublished');
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

  const handleUnpublish = async (projectId: string) => {
    if (!confirm("Take this project offline? It won't be visible to public but can be republished anytime.")) {
      return;
    }

    setActionLoading(projectId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects/${projectId}/unpublish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert('Failed to unpublish project');
      }
    } catch (error) {
      console.error('Error unpublishing project:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepublish = async (projectId: string) => {
    if (!confirm('Make this project visible to public again?')) {
      return;
    }

    setActionLoading(projectId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects/${projectId}/republish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert('Failed to republish project');
      }
    } catch (error) {
      console.error('Error republishing project:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <AdminLoading message="Loading projects..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="All Projects"
        subtitle={`${projects.length} total projects in the directory`}
      />

      <AdminTabs
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'approved', label: 'Approved' },
          { id: 'unpublished', label: 'Unpublished' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Category</th>
              <th>Country</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const isBusy = actionLoading === project.id;
              const statusLabel = STATUS_LABELS[project.status] || project.status;

              return (
                <tr key={project.id}>
                  <td className="cell-primary">{project.name}</td>
                  <td>{project.category?.name || '—'}</td>
                  <td>{project.country?.name || '—'}</td>
                  <td>{project.user ? (project.user.name || project.user.email) : 'No owner'}</td>
                  <td>
                    <AdminBadge variant={statusToBadgeVariant(project.status)}>
                      {statusLabel}
                    </AdminBadge>
                  </td>
                  <td>{formatDate(project.createdAt)}</td>
                  <td>
                    <div className="admin-actions-row">
                      <Link
                        to={`/project/${project.slug}`}
                        target="_blank"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                      >
                        <Eye size={14} strokeWidth={1.75} />
                        View
                      </Link>
                      {project.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleUnpublish(project.id)}
                          disabled={isBusy}
                          className="admin-btn admin-btn-warning admin-btn-sm"
                        >
                          <EyeOff size={14} strokeWidth={1.75} />
                          Unpublish
                        </button>
                      )}
                      {project.status === 'unpublished' && (
                        <button
                          type="button"
                          onClick={() => handleRepublish(project.id)}
                          disabled={isBusy}
                          className="admin-btn admin-btn-success admin-btn-sm"
                        >
                          <RotateCcw size={14} strokeWidth={1.75} />
                          Republish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
