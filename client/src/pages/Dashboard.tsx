import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticatedFetch, getCurrentUser } from '../utils/api';

interface Project {
  id: string;
  name: string;
  status: 'verified' | 'under_review' | 'needs_update';
  latestUpdate: string | null;
}

interface User {
  id: string;
  email: string;
  name?: string;
  projectName?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.projectName || userData.email.split('@')[0],
            projectName: userData.projectName,
          });
        } else {
          setError('Failed to load user data');
        }

        const response = await authenticatedFetch('/api/user/projects');
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
        console.error('Error fetching user data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'verified':
        return {
          background: '#ECFDF3',
          color: '#027A48',
          icon: (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
          text: 'Verified',
        };
      case 'under_review':
        return {
          background: '#FFF4E6',
          color: '#B54708',
          icon: (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          text: 'Under Review',
        };
      case 'needs_update':
        return {
          background: '#FEF3F2',
          color: '#B42318',
          icon: (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          text: 'Needs Update',
        };
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
      const response = await authenticatedFetch('/api/auth/update-email', {
        method: 'POST',
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailSuccess(true);
        setEmailForm({ newEmail: '', password: '' });
        if (user) {
          setUser({ ...user, email: emailForm.newEmail });
        }
        setTimeout(() => setEmailSuccess(false), 3000);
      } else {
        const data = await response.json();
        setEmailError(data.error || 'Failed to update email. Please try again.');
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
      const response = await authenticatedFetch('/api/auth/update-password', {
        method: 'POST',
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
        setPasswordError(data.error || 'Failed to update password. Please check your current password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getActionButton = (status: Project['status'], projectId: string) => {
    switch (status) {
      case 'verified':
        return (
          <button
            onClick={() => navigate(`/edit-project/${projectId}`)}
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
            Edit Details
          </button>
        );
      case 'under_review':
        return (
          <button
            onClick={() => navigate(`/view-submission/${projectId}`)}
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
      case 'needs_update':
        return (
          <button
            onClick={() => navigate(`/revise-project/${projectId}`)}
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
    }
  };

  return (
    <main className="app-main" style={{ background: '#F5F5F5', minHeight: '100vh', padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
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
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#1F2937',
                margin: '0 0 0.5rem 0',
              }}
            >
              Welcome Back, {user?.name || 'User'}
            </h1>
            <p
              style={{
                fontSize: '1rem',
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
              to="/list-project"
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
              fontSize: '0.9375rem',
              fontWeight: activeTab === 'projects' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
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
              fontSize: '0.9375rem',
              fontWeight: activeTab === 'account' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
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
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#4B5563' }}>Loading projects...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#B42318', marginBottom: '1rem' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#4B5563', marginBottom: '1rem' }}>
                You haven't submitted any projects yet.
              </p>
              <Link
                to="/list-project"
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
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
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
                  const statusBadge = getStatusBadge(project.status);
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
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.75rem',
                            background: statusBadge.background,
                            color: statusBadge.color,
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                          fontSize: '0.9375rem',
                          color: '#4B5563',
                        }}
                      >
                        {project.latestUpdate || '-'}
                      </td>
                      <td
                        style={{
                          padding: '1rem',
                        }}
                      >
                        {getActionButton(project.status, project.id)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          </div>
        )}

        {activeTab === 'account' && (
          <div
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
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
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
                    value={user?.email || ''}
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
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
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
  );
}

