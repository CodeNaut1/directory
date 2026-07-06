import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Project approved successfully!');
        fetchPendingProjects(); // Refresh list
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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
          'Authorization': `Bearer ${token}`,
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6B7280' }}>Loading pending projects...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          Pending Approvals
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} waiting for your review
        </p>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>All Caught Up!</h2>
          <p style={{ color: '#6B7280' }}>No projects pending approval at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {projects.map((project) => (
            <div key={project.id} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Project Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                      {project.name}
                    </h2>
                    <span style={{ padding: '0.25rem 0.75rem', background: '#FEF3C7', color: '#92400E', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {project.category?.name || 'Uncategorized'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {project.description}
                  </p>

                  <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    <div>
                      <strong style={{ color: '#1F2937' }}>Country:</strong> {project.country?.name || 'Global'}
                    </div>
                    <div>
                      <strong style={{ color: '#1F2937' }}>Submitted by:</strong> {project.user?.name || project.user?.email || 'Unknown'}
                    </div>
                    <div>
                      <strong style={{ color: '#1F2937' }}>Date:</strong> {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
                  <Link
                    to={`/project/${project.slug}`}
                    target="_blank"
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#F3F4F6',
                      color: '#1F2937',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E5E7EB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F3F4F6';
                    }}
                  >
                    👁️ View Details
                  </Link>

                  <button
                    onClick={() => handleApprove(project.id)}
                    disabled={actionLoading === project.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: actionLoading === project.id ? '#D1D5DB' : '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: actionLoading === project.id ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (actionLoading !== project.id) {
                        e.currentTarget.style.background = '#059669';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (actionLoading !== project.id) {
                        e.currentTarget.style.background = '#10B981';
                      }
                    }}
                  >
                    ✅ Approve
                  </button>

                  <button
                    onClick={() => handleRequestChanges(project)}
                    disabled={actionLoading === project.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: actionLoading === project.id ? '#D1D5DB' : '#F59E0B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: actionLoading === project.id ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (actionLoading !== project.id) {
                        e.currentTarget.style.background = '#D97706';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (actionLoading !== project.id) {
                        e.currentTarget.style.background = '#F59E0B';
                      }
                    }}
                  >
                    📝 Request Changes
                  </button>

                  <button
                    onClick={() => handleReject(project.id)}
                    disabled={actionLoading === project.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: actionLoading === project.id ? '#D1D5DB' : '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: actionLoading === project.id ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (actionLoading !== project.id) {
                        e.currentTarget.style.background = '#DC2626';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (actionLoading !== project.id) {
                        e.currentTarget.style.background = '#EF4444';
                      }
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
              Request Changes
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Provide feedback to <strong>{selectedProject.user?.name || selectedProject.user?.email || 'the submitter'}</strong> about what needs to be changed in <strong>{selectedProject.name}</strong>.
            </p>

            <textarea
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g., Please upload a higher quality logo and add more details about your services..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '1.5rem',
              }}
            />

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackNotes('');
                  setSelectedProject(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={actionLoading === selectedProject.id}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: actionLoading === selectedProject.id ? '#D1D5DB' : '#FD5A47',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: actionLoading === selectedProject.id ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading === selectedProject.id ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}