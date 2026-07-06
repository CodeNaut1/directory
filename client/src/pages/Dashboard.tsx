import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProjectUrl } from '../utils/projectUrl';
import ProjectStatusBadge, { type ProjectStatus } from '../components/ProjectStatusBadge';

interface Project {
  id: string;
  slug: string;
  name: string;
  verified: boolean;
  status: string;
  updatedAt: string;
  updated_at: string;
}

type ProjectStatusType = ProjectStatus;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'account'>('projects');
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const getProjectStatus = (project: Project): ProjectStatusType => {
    if (project.status === 'approved') {
      return 'verified';
    }

    if (project.status === 'pending') {
      return 'under_review';
    }

    if (project.status === 'rejected') {
      return 'needs_update';
    }

    if (project.status === 'unpublished') {
      return 'unpublished';
    }

    return 'under_review';
  };

  const getFirstName = (fullName: string | null | undefined): string => {
    if (!fullName) return 'User';
    const firstName = fullName.trim().split(' ')[0];
    return firstName || 'User';
  };

  const displayName = getFirstName(authUser?.name);

  useEffect(() => {
    document.title = "Dashboard - African Bitcoin Directory";
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/projects/my-projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProjects(data.data);
          } else {
            setProjects([]);
          }
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    // Try both updatedAt and updated_at from API
    const dateToFormat = dateString;

    if (!dateToFormat) return 'N/A';

    try {
      const date = new Date(dateToFormat);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setIsUpdatingEmail(true);

    if (!emailForm.newEmail.trim()) {
      setEmailError('New email is required');
      setIsUpdatingEmail(false);
      return;
    }

    if (!emailForm.password.trim()) {
      setEmailError('Password is required to change email');
      setIsUpdatingEmail(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      setEmailError('Please enter a valid email address');
      setIsUpdatingEmail(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/auth/update-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password,
        }),
      });

      if (response.ok) {
        setEmailSuccess(true);
        setEmailForm({ newEmail: '', password: '' });
        setTimeout(() => setEmailSuccess(false), 3000);
      } else {
        const data = await response.json();
        setEmailError(data.error?.message || data.error || 'Failed to update email. Please try again.');
      }
    } catch (error) {
      console.error('Error updating email:', error);
      setEmailError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsUpdatingPassword(true);

    if (!passwordForm.currentPassword.trim()) {
      setPasswordError('Current password is required');
      setIsUpdatingPassword(false);
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      setPasswordError('New password is required');
      setIsUpdatingPassword(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      setIsUpdatingPassword(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsUpdatingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordSuccess(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        const data = await response.json();
        setPasswordError(data.error?.message || data.error || 'Failed to update password. Please check your current password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getActionButton = (status: ProjectStatus, project: Project) => {
    const projectUrl = getProjectUrl(project);
    // For approved projects, show "View" and "Edit Project"
    if (status === 'verified') {
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(projectUrl)}
            style={{
              padding: '0.5rem 1rem',
              background: '#FFFFFF',
              color: '#1F2937',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            View
          </button>
          <button
            onClick={() => navigate(`/edit-project/${project.id}`)}
            style={{
              padding: '0.5rem 1rem',
              background: '#FD5A47',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E04835';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FD5A47';
            }}
          >
            Edit
          </button>
        </div>
      );
    }

    // For under review, show "View Submission"
    if (status === 'under_review') {
      return (
        <button
          onClick={() => navigate(projectUrl)}
          style={{
            padding: '0.5rem 1rem',
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#9CA3AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
        >
          View Submission
        </button>
      );
    }

    // For unpublished projects, show view-only access
    if (status === 'unpublished') {
      return (
        <button
          onClick={() => navigate(projectUrl)}
          style={{
            padding: '0.5rem 1rem',
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#9CA3AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
        >
          View
        </button>
      );
    }

    // For needs update, show "Revise & Resubmit"
    return (
      <button
        onClick={() => navigate(`/edit-project/${project.id}`)}
        style={{
          padding: '0.5rem 1rem',
          background: '#FFFFFF',
          color: '#1F2937',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F9FAFB';
          e.currentTarget.style.borderColor = '#9CA3AF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.borderColor = '#D1D5DB';
        }}
      >
        Revise & Resubmit
      </button>
    );
  };

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .account-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .projects-table {
            display: none !important;
          }
          .projects-cards {
            display: block !important;
          }
        }
      `}</style>

      <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            className="dashboard-header"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#1F2937',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Welcome Back, {displayName}
              </h1>
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  color: '#4B5563',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '600px',
                }}
              >
                Manage your listing, track its performance, and keep your details current for the
                Bitcoin in Africa directory.
              </p>
            </div>
            {activeTab === 'projects' && (
              <Link
                to="/create-project"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
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
                Submit New Project
              </Link>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              borderBottom: '1px solid #E5E7EB',
              overflowX: 'auto',
            }}
          >
            <button
              onClick={() => setActiveTab('projects')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'projects' ? '2px solid #FD5A47' : '2px solid transparent',
                color: activeTab === 'projects' ? '#FD5A47' : '#6B7280',
                fontSize: 'clamp(0.85rem, 2vw, 0.9375rem)',
                fontWeight: activeTab === 'projects' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('account')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'account' ? '2px solid #FD5A47' : '2px solid transparent',
                color: activeTab === 'account' ? '#FD5A47' : '#6B7280',
                fontSize: 'clamp(0.85rem, 2vw, 0.9375rem)',
                fontWeight: activeTab === 'account' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Account Settings
            </button>
          </div>

          {activeTab === 'projects' && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: 'clamp(1rem, 3vw, 2rem)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: '#4B5563' }}>Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
                    You haven't submitted any projects yet.
                  </p>
                  <Link
                    to="/create-project"
                    style={{
                      display: 'inline-block',
                      padding: '0.75rem 1.5rem',
                      background: '#FD5A47',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Submit Your First Project
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="projects-table" style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: '600px',
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #E5E7EB',
                            }}
                          >
                            Project Name
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #E5E7EB',
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #E5E7EB',
                            }}
                          >
                            Latest Update
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '0.75rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#6B7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #E5E7EB',
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => {
                          const status = getProjectStatus(project);
                          return (
                            <tr
                              key={project.id}
                              style={{
                                borderBottom: '1px solid #F3F4F6',
                              }}
                            >
                              <td
                                style={{
                                  padding: '1rem',
                                  fontSize: '0.9375rem',
                                  color: '#1F2937',
                                  fontWeight: 500,
                                }}
                              >
                                {project.name}
                              </td>
                              <td
                                style={{
                                  padding: '1rem',
                                }}
                              >
                                <ProjectStatusBadge status={status} />
                              </td>
                              <td
                                style={{
                                  padding: '1rem',
                                  fontSize: '0.9375rem',
                                  color: '#4B5563',
                                }}
                              >
                                {formatDate(project.updated_at || project.updatedAt)}
                              </td>
                              <td
                                style={{
                                  padding: '1rem',
                                }}
                              >
                                {getActionButton(status, project)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="projects-cards" style={{ display: 'none' }}>
                    {projects.map((project) => {
                      const status = getProjectStatus(project);
                      return (
                        <div
                          key={project.id}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                            {project.name}
                          </h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <ProjectStatusBadge status={status} />
                          </div>
                          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 1rem 0' }}>
                            Updated: {formatDate(project.updated_at || project.updatedAt)}
                          </p>
                          {getActionButton(status, project)}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'account' && (
            <div
              className="account-settings-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                    fontWeight: 700,
                    color: '#1F2937',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Change Email
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    margin: '0 0 1.5rem 0',
                  }}
                >
                  Update your email address. You'll need to confirm your password.
                </p>
                <form onSubmit={handleEmailChange}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      htmlFor="currentEmail"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Current Email
                    </label>
                    <input
                      type="email"
                      id="currentEmail"
                      value={authUser?.email || ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        border: '1px solid #D1D5DB',
                        borderRadius: '8px',
                        background: '#F9FAFB',
                        color: '#6B7280',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      htmlFor="newEmail"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      New Email
                    </label>
                    <input
                      type="email"
                      id="newEmail"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                      placeholder="Enter new email address"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        border: emailError ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#1F2937',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FD5A47';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = emailError ? '#EF4444' : '#D1D5DB';
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label
                      htmlFor="emailPassword"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="emailPassword"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        border: emailError ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#1F2937',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FD5A47';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = emailError ? '#EF4444' : '#D1D5DB';
                      }}
                    />
                  </div>
                  {emailError && (
                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#FEF3F2',
                        color: '#B42318',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {emailError}
                    </div>
                  )}
                  {emailSuccess && (
                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#ECFDF3',
                        color: '#027A48',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                      }}
                    >
                      Email updated successfully!
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: isUpdatingEmail ? '#D1D5DB' : '#FD5A47',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: isUpdatingEmail ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdatingEmail) {
                        e.currentTarget.style.background = '#E04835';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdatingEmail) {
                        e.currentTarget.style.background = '#FD5A47';
                      }
                    }}
                  >
                    {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                    fontWeight: 700,
                    color: '#1F2937',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Change Password
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    margin: '0 0 1.5rem 0',
                  }}
                >
                  Update your password to keep your account secure.
                </p>
                <form onSubmit={handlePasswordChange}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      htmlFor="currentPassword"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        border: passwordError ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#1F2937',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FD5A47';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = passwordError ? '#EF4444' : '#D1D5DB';
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      htmlFor="newPassword"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Enter new password (min. 8 characters)"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        border: passwordError ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#1F2937',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FD5A47';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = passwordError ? '#EF4444' : '#D1D5DB';
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label
                      htmlFor="confirmPassword"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9375rem',
                        border: passwordError ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#FFFFFF',
                        color: '#1F2937',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FD5A47';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = passwordError ? '#EF4444' : '#D1D5DB';
                      }}
                    />
                  </div>
                  {passwordError && (
                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#FEF3F2',
                        color: '#B42318',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#ECFDF3',
                        color: '#027A48',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                      }}
                    >
                      Password updated successfully!
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: isUpdatingPassword ? '#D1D5DB' : '#FD5A47',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdatingPassword) {
                        e.currentTarget.style.background = '#E04835';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdatingPassword) {
                        e.currentTarget.style.background = '#FD5A47';
                      }
                    }}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}