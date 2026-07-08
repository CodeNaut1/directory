import { useEffect, useState } from 'react';
import {
  AdminButton,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
} from '../../components/admin/AdminUI';
import { useFeedback } from '../../contexts/FeedbackContext';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function Tags() {
  const { alert, confirm } = useFeedback();
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTags(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
    } else {
      setEditingTag(null);
      setTagName('');
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setTagName('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const url = editingTag
        ? `${API_URL}/api/admin/tags/${editingTag.id}`
        : `${API_URL}/api/admin/tags`;

      const response = await fetch(url, {
        method: editingTag ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (response.ok) {
        await fetchTags();
        handleCloseModal();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to save tag');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Tag',
      message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/tags/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTags();
      } else {
        await alert({ message: 'Failed to delete tag', variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    }
  };

  if (loading) {
    return <AdminLoading message="Loading tags..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Tags"
        subtitle={`${tags.length} tags in the directory`}
        action={
          <AdminButton variant="primary" size="lg" onClick={() => handleOpenModal()}>
            Add Tag
          </AdminButton>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {tags.map((tag) => (
          <div key={tag.id} className="admin-card">
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: '0 0 0.125rem' }}>
                {tag.name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>{tag.slug}</p>
            </div>
            <div className="admin-actions-row">
              <AdminButton variant="ghost" size="sm" onClick={() => handleOpenModal(tag)} style={{ flex: 1 }}>
                Edit
              </AdminButton>
              <AdminButton variant="danger" size="sm" onClick={() => handleDelete(tag.id, tag.name)} style={{ flex: 1 }}>
                Delete
              </AdminButton>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AdminModal title={editingTag ? 'Edit Tag' : 'Add Tag'} onClose={handleCloseModal}>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">Tag Name *</label>
              <input
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                required
                placeholder="e.g. Education, Remittances"
                className="admin-input"
              />
            </div>

            {error && <div className="admin-alert admin-alert-error">{error}</div>}

            <div className="admin-form-actions">
              <AdminButton type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingTag ? 'Update' : 'Create'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}