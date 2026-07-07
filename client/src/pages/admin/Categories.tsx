import { useEffect, useState } from 'react';
import {
  AdminButton,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
} from '../../components/admin/AdminUI';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
}

export default function Categories() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const url = editingCategory
        ? `${API_URL}/api/admin/categories/${editingCategory.id}`
        : `${API_URL}/api/admin/categories`;

      const response = await fetch(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        handleCloseModal();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('An error occurred');
    }
  };

  if (loading) {
    return <AdminLoading message="Loading categories..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle={`${categories.length} categories in the directory`}
        action={
          <AdminButton variant="primary" size="lg" onClick={() => handleOpenModal()}>
            Add Category
          </AdminButton>
        }
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="cell-primary">{category.name}</td>
                <td>{category.slug}</td>
                <td>{category.description || '—'}</td>
                <td>
                  <div className="admin-actions-row">
                    <AdminButton variant="ghost" size="sm" onClick={() => handleOpenModal(category)}>
                      Edit
                    </AdminButton>
                    <AdminButton variant="danger" size="sm" onClick={() => handleDelete(category.id, category.name)}>
                      Delete
                    </AdminButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AdminModal
          title={editingCategory ? 'Edit Category' : 'Add Category'}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="admin-textarea"
              />
            </div>

            {error && <div className="admin-alert admin-alert-error">{error}</div>}

            <div className="admin-form-actions">
              <AdminButton type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}