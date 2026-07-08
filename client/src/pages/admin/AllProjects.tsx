import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, RotateCcw, EyeOff, ShieldOff } from 'lucide-react';
import {
  AdminBadge,
  AdminButton,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminTabs,
  statusToBadgeVariant,
} from '../../components/admin/AdminUI';
import { useFeedback } from '../../contexts/FeedbackContext';

interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  verified: boolean;
  category: { name: string } | null;
  country: { name: string } | null;
  user: { name: string; email: string } | null;
  claims?: { id: string }[];
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  changes_requested: 'Needs Update',
  unpublished: 'Unpublished',
};

export default function AllProjects() {
  const { alert, confirm } = useFeedback();
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'approved' | 'unpublished'>('all');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ claimId: string; projectName: string } | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

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
    const ok = await confirm({
      title: 'Unpublish Project',
      message: "Take this project offline? It won't be visible to public but can be republished anytime.",
      variant: 'warning',
    });
    if (!ok) {
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
        const data = await response.json().catch(() => null);
        await alert({ message: data?.error?.message || 'Failed to unpublish project', variant: 'error' });
      }
    } catch (error) {
      console.error('Error unpublishing project:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const openRevokeModal = async (project: Project) => {
    const claimId = project.claims?.[0]?.id;
    if (!claimId) {
      await alert({ message: 'No approved ownership claim found for this project.', variant: 'warning' });
      return;
    }
    setRevokeTarget({ claimId, projectName: project.name });
    setRevokeReason('');
    setShowRevokeModal(true);
  };

  const submitRevoke = async () => {
    if (!revokeTarget) return;

    setActionLoading(revokeTarget.claimId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/claims/${revokeTarget.claimId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: revokeReason.trim() || undefined }),
      });

      if (response.ok) {
        setShowRevokeModal(false);
        setRevokeTarget(null);
        setRevokeReason('');
        fetchProjects();
      } else {
        const data = await response.json().catch(() => null);
        await alert({ message: data?.error?.message || 'Failed to revoke ownership', variant: 'error' });
      }
    } catch (error) {
      console.error('Error revoking ownership:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepublish = async (projectId: string) => {
    const ok = await confirm({
      title: 'Republish Project',
      message: 'Make this project visible to public again?',
    });
    if (!ok) {
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
        await alert({ message: 'Failed to republish project', variant: 'error' });
      }
    } catch (error) {
      console.error('Error republishing project:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
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
              const isBusy = actionLoading === project.id || actionLoading === project.claims?.[0]?.id;
              const statusLabel = STATUS_LABELS[project.status] || project.status;
              const approvedClaimId = project.claims?.[0]?.id;

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
                      {project.user && approvedClaimId && (
                        <button
                          type="button"
                          onClick={() => openRevokeModal(project)}
                          disabled={isBusy}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                        >
                          <ShieldOff size={14} strokeWidth={1.75} />
                          Revoke Ownership
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

      {showRevokeModal && revokeTarget && (
        <AdminModal
          title="Revoke Ownership"
          description={`Are you sure? This will remove the current owner's access to ${revokeTarget.projectName}.`}
          onClose={() => {
            setShowRevokeModal(false);
            setRevokeTarget(null);
            setRevokeReason('');
          }}
        >
          <label htmlFor="revoke-reason" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
            Reason (optional)
          </label>
          <textarea
            id="revoke-reason"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
            placeholder="e.g. Ownership could not be verified..."
            rows={4}
            className="admin-textarea"
          />

          <div className="admin-form-actions">
            <AdminButton
              variant="ghost"
              onClick={() => {
                setShowRevokeModal(false);
                setRevokeTarget(null);
                setRevokeReason('');
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={submitRevoke}
              disabled={actionLoading === revokeTarget.claimId}
            >
              {actionLoading === revokeTarget.claimId ? 'Revoking...' : 'Revoke Ownership'}
            </AdminButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
