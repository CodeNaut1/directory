import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, FilePenLine, XCircle } from 'lucide-react';
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
} from '../../components/admin/AdminUI';

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { name: string } | null;
  country: { name: string } | null;
  user: { name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function PendingProjects() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setProjects(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching pending projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: string) => {
    if (!confirm('Are you sure you want to approve this project?')) return;

    setActionLoading(projectId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects/${projectId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Project approved successfully!');
        fetchPendingProjects();
      } else {
        alert('Failed to approve project');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (projectId: string) => {
    if (!confirm('Are you sure you want to reject this project?')) return;

    setActionLoading(projectId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects/${projectId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Project rejected');
        fetchPendingProjects();
      } else {
        alert('Failed to reject project');
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = (project: Project) => {
    setSelectedProject(project);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!selectedProject || !feedbackNotes.trim()) {
      alert('Please enter feedback notes');
      return;
    }

    setActionLoading(selectedProject.id);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/projects/${selectedProject.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: feedbackNotes }),
      });

      if (response.ok) {
        alert('Feedback sent to user!');
        setShowFeedbackModal(false);
        setFeedbackNotes('');
        setSelectedProject(null);
        fetchPendingProjects();
      } else {
        alert('Failed to send feedback');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <AdminLoading message="Loading pending projects..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Pending Approvals"
        subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''} waiting for your review`}
      />

      {projects.length === 0 ? (
        <AdminEmptyState
          icon={CheckCircle2}
          title="All Caught Up"
          description="No projects pending approval at the moment."
        />
      ) : (
        <div className="admin-list">
          {projects.map((project) => {
            const busy = actionLoading === project.id;
            return (
              <div key={project.id} className="admin-list-card">
                <div className="admin-list-card-inner">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <h2 className="admin-list-card-title">{project.name}</h2>
                      <AdminBadge variant="warning">{project.category?.name || 'Uncategorized'}</AdminBadge>
                    </div>

                    <p className="admin-list-card-desc">{project.description}</p>

                    <div className="admin-list-card-meta">
                      <span><strong>Country:</strong> {project.country?.name || 'Global'}</span>
                      <span><strong>Submitted by:</strong> {project.user?.name || project.user?.email || 'Unknown'}</span>
                      <span><strong>Date:</strong> {formatDate(project.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="admin-actions-col">
                    <Link
                      to={`/project/${project.slug}`}
                      target="_blank"
                      className="admin-btn admin-btn-ghost admin-btn-block"
                    >
                      <Eye size={15} strokeWidth={1.75} />
                      View Details
                    </Link>

                    <AdminButton
                      variant="success"
                      block
                      icon={CheckCircle2}
                      onClick={() => handleApprove(project.id)}
                      disabled={busy}
                    >
                      Approve
                    </AdminButton>

                    <AdminButton
                      variant="warning"
                      block
                      icon={FilePenLine}
                      onClick={() => handleRequestChanges(project)}
                      disabled={busy}
                    >
                      Request Changes
                    </AdminButton>

                    <AdminButton
                      variant="danger"
                      block
                      icon={XCircle}
                      onClick={() => handleReject(project.id)}
                      disabled={busy}
                    >
                      Reject
                    </AdminButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showFeedbackModal && selectedProject && (
        <AdminModal
          title="Request Changes"
          description={`Provide feedback to ${selectedProject.user?.name || selectedProject.user?.email || 'the submitter'} about what needs to be changed in ${selectedProject.name}.`}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackNotes('');
            setSelectedProject(null);
          }}
        >
          <textarea
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            placeholder="e.g., Please upload a higher quality logo and add more details about your services..."
            rows={6}
            className="admin-textarea"
          />

          <div className="admin-form-actions">
            <AdminButton
              variant="ghost"
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackNotes('');
                setSelectedProject(null);
              }}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={submitFeedback}
              disabled={actionLoading === selectedProject.id}
            >
              {actionLoading === selectedProject.id ? 'Sending...' : 'Send Feedback'}
            </AdminButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
