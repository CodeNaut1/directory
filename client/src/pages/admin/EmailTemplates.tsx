import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Search, Pencil, Eye } from 'lucide-react';
import {
  AdminBadge,
  AdminEmptyState,
  AdminLoading,
  AdminPageHeader,
  ICON_STROKE,
} from '../../components/admin/AdminUI';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  category: string;
  isActive: boolean;
  isDefaultContent: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  submission: 'Submission',
  approval: 'Approval',
  rejection: 'Rejection',
  changes: 'Changes',
  ownership: 'Ownership',
  other: 'Other',
};

const CATEGORY_ORDER = ['submission', 'approval', 'rejection', 'changes', 'ownership', 'other'];

export default function EmailTemplates() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_URL}/api/admin/emails${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, EmailTemplate[]> = {};
    for (const template of templates) {
      if (!groups[template.category]) {
        groups[template.category] = [];
      }
      groups[template.category].push(template);
    }
    return groups;
  }, [templates]);

  if (loading && templates.length === 0) {
    return <AdminLoading message="Loading email templates..." />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Email Templates"
        subtitle="Edit notification content sent to users and team members. Recipients are configured via environment variables."
      />

      <div className="admin-toolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-search-wrap">
          <Search size={16} strokeWidth={ICON_STROKE} className="admin-search-icon" />
          <input
            type="search"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {templates.length === 0 ? (
        <AdminEmptyState
          icon={Mail}
          title="No templates found"
          description="Run database seed to populate default email templates."
        />
      ) : (
        CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((category) => (
          <section key={category} style={{ marginBottom: '2rem' }}>
            <h2 className="admin-section-title">{CATEGORY_LABELS[category] || category}</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[category].map((template) => (
                    <tr key={template.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                          {template.name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5 }}>
                          {template.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                          {template.key}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: '#374151', maxWidth: 280 }}>
                        {template.subject}
                      </td>
                      <td>
                        <AdminBadge variant={template.isActive ? 'success' : 'neutral'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </AdminBadge>
                        {template.isDefaultContent && (
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.375rem' }}>
                            Default content
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/admin/emails/${template.id}`}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            <Pencil size={15} strokeWidth={ICON_STROKE} />
                            Edit
                          </Link>
                          <Link
                            to={`/admin/emails/${template.id}?preview=1`}
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                          >
                            <Eye size={15} strokeWidth={ICON_STROKE} />
                            Preview
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
