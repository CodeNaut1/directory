import { useEffect, useState } from 'react';
import {
  AdminBadge,
  AdminButton,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminTabs,
  roleToBadgeVariant,
} from '../../components/admin/AdminUI';

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      case 'builder':
        return 'Builder';
      default:
        return 'User';
    }
  };

  if (loading) {
    return <AdminLoading message="Loading users..." />;
  }

  return (
    <div>
      <AdminPageHeader title="Users" subtitle={`${users.length} users in the system`} />

      <AdminTabs
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'admin', label: 'Admin' },
          { id: 'moderator', label: 'Moderator' },
          { id: 'builder', label: 'Builder' },
          { id: 'user', label: 'User' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="cell-primary">{user.name || '—'}</td>
                <td>{user.email}</td>
                <td>
                  <AdminBadge variant={roleToBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </AdminBadge>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.lastLoginAt)}</td>
                <td>
                  <AdminButton variant="ghost" size="sm" onClick={() => handleOpenRoleModal(user)}>
                    Change Role
                  </AdminButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRoleModal && selectedUser && (
        <AdminModal
          title="Change User Role"
          description={`Update role for ${selectedUser.name || selectedUser.email}`}
          onClose={handleCloseRoleModal}
        >
          <div className="admin-form-group">
            <label className="admin-form-label">Select Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as User['role'])}
              className="admin-select"
            >
              <option value="user">User</option>
              <option value="builder">Builder</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="admin-form-actions">
            <AdminButton variant="ghost" onClick={handleCloseRoleModal}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleUpdateRole}
              disabled={isSubmitting || newRole === selectedUser.role}
            >
              {isSubmitting ? 'Updating...' : 'Update Role'}
            </AdminButton>
          </div>
        </AdminModal>
      )}
    </div>
  );
}