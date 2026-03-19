import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'user' | 'builder' | 'moderator' | 'admin';
  createdAt: string;
  lastLoginAt: string | null;
}

export default function Users() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'moderator' | 'builder' | 'user'>('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<User['role']>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          let filtered = data.data;
          if (filter !== 'all') {
            filtered = filtered.filter((u: User) => u.role === filter);
          }
          setUsers(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setNewRole('user');
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await fetchUsers();
        handleCloseRoleModal();
      } else {
        alert('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: '#FEE2E2', color: '#991B1B', text: 'Admin' };
      case 'moderator':
        return { bg: '#FEF3C7', color: '#92400E', text: 'Moderator' };
      case 'builder':
        return { bg: '#DBEAFE', color: '#1E40AF', text: 'Builder' };
      default:
        return { bg: '#F3F4F6', color: '#1F2937', text: 'User' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6B7280' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          Users
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          {users.length} users in the system
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
        {(['all', 'admin', 'moderator', 'builder', 'user'] as const).map((tab) => (
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

      {/* Users Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Joined</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Last Login</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9375rem', color: '#1F2937', fontWeight: 500 }}>
                    {user.name || '-'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: roleBadge.bg,
                      color: roleBadge.color,
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {roleBadge.text}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#4B5563' }}>
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleOpenRoleModal(user)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#F3F4F6',
                        color: '#1F2937',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
              Change User Role
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Update role for <strong>{selectedUser.name || selectedUser.email}</strong>
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as User['role'])}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <option value="user">User</option>
                <option value="builder">Builder</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseRoleModal}
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
                onClick={handleUpdateRole}
                disabled={isSubmitting || newRole === selectedUser.role}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: (isSubmitting || newRole === selectedUser.role) ? '#D1D5DB' : '#FD5A47',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: (isSubmitting || newRole === selectedUser.role) ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}