import { useEffect, useState } from 'react';
import {
  AdminButton,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
} from '../../components/admin/AdminUI';
import { useFeedback } from '../../contexts/FeedbackContext';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string | null;
}

export default function Countries() {
  const { alert, confirm } = useFeedback();
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', flag: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_URL}/api/countries`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCountries(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (country?: Country) => {
    if (country) {
      setEditingCountry(country);
      setFormData({ name: country.name, code: country.code, flag: country.flag || '' });
    } else {
      setEditingCountry(null);
      setFormData({ name: '', code: '', flag: '' });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCountry(null);
    setFormData({ name: '', code: '', flag: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const url = editingCountry
        ? `${API_URL}/api/admin/countries/${editingCountry.id}`
        : `${API_URL}/api/admin/countries`;

      const response = await fetch(url, {
        method: editingCountry ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCountries();
        handleCloseModal();
      } else {
        const data = await response.json();
        setError(data.error?.message || 'Failed to save country');
      }
    } catch (error) {
      console.error('Error saving country:', error);
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Country',
      message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/countries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchCountries();
      } else {
        await alert({ message: 'Failed to delete country', variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      await alert({ message: 'An error occurred', variant: 'error' });
    }
  };

  if (loading) {
    return <AdminLoading message="Loading countries..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Countries"
        subtitle={`${countries.length} African countries in the directory`}
        action={
          <AdminButton variant="primary" size="lg" onClick={() => handleOpenModal()}>
            Add Country
          </AdminButton>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {countries.map((country) => (
          <div key={country.id} className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              {country.flag && <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{country.flag}</span>}
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: '0 0 0.125rem' }}>
                  {country.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>
                  {country.code.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="admin-actions-row">
              <AdminButton variant="ghost" size="sm" onClick={() => handleOpenModal(country)} style={{ flex: 1 }}>
                Edit
              </AdminButton>
              <AdminButton variant="danger" size="sm" onClick={() => handleDelete(country.id, country.name)} style={{ flex: 1 }}>
                Delete
              </AdminButton>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AdminModal
          title={editingCountry ? 'Edit Country' : 'Add Country'}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">Country Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Nigeria"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">ISO Code (2 letters) *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                maxLength={2}
                placeholder="e.g. NG"
                className="admin-input"
              />
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.375rem' }}>
                Use ISO 3166-1 alpha-2 code
              </p>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Flag Emoji (optional)</label>
              <input
                type="text"
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                placeholder="🇳🇬"
                className="admin-input"
              />
            </div>

            {error && <div className="admin-alert admin-alert-error">{error}</div>}

            <div className="admin-form-actions">
              <AdminButton type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingCountry ? 'Update' : 'Create'}
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}