import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Send, Save, AlertTriangle } from 'lucide-react';
import {
  AdminBadge,
  AdminButton,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
} from '../../components/admin/AdminUI';
import { useFeedback } from '../../contexts/FeedbackContext';

interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
}

interface EmailTemplateDetail {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  htmlBody: string;
  variables: TemplateVariable[];
  category: string;
  isActive: boolean;
  isDefaultContent: boolean;
}

export default function EditEmailTemplate() {
  const { id } = useParams<{ id: string }>();
  const { confirm } = useFeedback();
  const [searchParams] = useSearchParams();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [template, setTemplate] = useState<EmailTemplateDetail | null>(null);
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(searchParams.get('preview') === '1');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');

  useEffect(() => {
    if (id) fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/emails/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTemplate(data.data);
          setSubject(data.data.subject);
          setHtmlBody(data.data.htmlBody);
          setIsActive(data.data.isActive);

          if (searchParams.get('preview') === '1') {
            await openPreview(data.data.subject, data.data.htmlBody);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/emails/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, htmlBody, isActive }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTemplate(data.data);
        setSuccess('Template saved successfully.');
      } else {
        setError(data.error || 'Failed to save template');
      }
    } catch {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const openPreview = async (previewSubjectValue: string, previewHtmlBody: string) => {
    setPreviewing(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/emails/${id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject: previewSubjectValue, htmlBody: previewHtmlBody }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPreviewSubject(data.data.subject);
        setPreviewHtml(data.data.html);
        setShowPreview(true);
      } else {
        setError(data.error || 'Failed to generate preview');
      }
    } catch {
      setError('An error occurred while previewing');
    } finally {
      setPreviewing(false);
    }
  };

  const handlePreview = async () => {
    await openPreview(subject, htmlBody);
  };

  const handleSendTest = async () => {
    const ok = await confirm({
      title: 'Send test email?',
      message: 'Send a test email to your account with the current saved template?',
      confirmLabel: 'Send test',
      variant: 'primary',
    });
    if (!ok) return;

    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/admin/emails/${id}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(data.data.message);
      } else {
        setError(data.error || 'Failed to send test email');
      }
    } catch {
      setError('An error occurred while sending test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <AdminLoading message="Loading template..." />;
  }

  if (!template) {
    return (
      <div>
        <p>Template not found.</p>
        <Link to="/admin/emails">Back to templates</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/emails" className="admin-back-link">
        <ArrowLeft size={16} />
        Back to Email Templates
      </Link>

      <AdminPageHeader
        title={template.name}
        subtitle={template.description}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AdminBadge variant={isActive ? 'success' : 'neutral'}>
              {isActive ? 'Active' : 'Inactive'}
            </AdminBadge>
          </div>
        }
      />

      {template.isDefaultContent && (
        <div className="admin-alert admin-alert-info" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>This template still uses the default content. Customize it below to match your voice.</span>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success" style={{ marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <div className="admin-edit-grid">
        <div className="admin-edit-main">
          <div className="admin-form-group">
            <label htmlFor="subject" className="admin-form-label">Subject line</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="htmlBody" className="admin-form-label">HTML body</label>
            <textarea
              id="htmlBody"
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className="admin-textarea admin-textarea-code"
              rows={24}
              spellCheck={false}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label admin-checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Template is active (inactive templates will not send)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <AdminButton variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </AdminButton>
            <AdminButton variant="ghost" icon={Eye} onClick={handlePreview} disabled={previewing}>
              {previewing ? 'Rendering...' : 'Preview'}
            </AdminButton>
            <AdminButton variant="ghost" icon={Send} onClick={handleSendTest} disabled={testing}>
              {testing ? 'Sending...' : 'Send test to me'}
            </AdminButton>
          </div>
        </div>

        <aside className="admin-edit-sidebar">
          <h3 className="admin-sidebar-panel-title">Available variables</h3>
          <p className="admin-sidebar-panel-text">
            Use these placeholders in the subject or HTML body. They are replaced with real values when the email sends.
          </p>
          <ul className="admin-variable-list">
            {(template.variables as TemplateVariable[]).map((variable) => (
              <li key={variable.name} className="admin-variable-item">
                <code>{`{{${variable.name}}}`}</code>
                <span>{variable.description}</span>
                {variable.required && (
                  <AdminBadge variant="warning">Required</AdminBadge>
                )}
              </li>
            ))}
          </ul>
          <p className="admin-sidebar-panel-text" style={{ marginTop: '1rem', fontSize: '0.8125rem' }}>
            Template key: <code>{template.key}</code>
          </p>
        </aside>
      </div>

      {showPreview && (
        <AdminModal title="Email preview" description={previewSubject} onClose={() => setShowPreview(false)}>
          <div
            className="admin-email-preview"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </AdminModal>
      )}
    </div>
  );
}
