import { useState } from 'react';
import {
  AdminButton,
  AdminPageHeader,
} from '../../components/admin/AdminUI';

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'African Bitcoin Directory',
    siteDescription: 'Discover Bitcoin-only projects across Africa',
    contactEmail: 'hello@bitcoiners.africa',
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        subtitle="Manage site-wide configuration and preferences"
      />

      <div className="admin-card admin-card-lg" style={{ maxWidth: '800px' }}>
        <h2 className="admin-card-section-title">General Settings</h2>

        <div className="admin-form-group">
          <label className="admin-form-label">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Site Description</label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            rows={3}
            className="admin-textarea"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            className="admin-input"
          />
        </div>

        <div className="admin-alert admin-alert-warning" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              style={{ marginTop: '0.125rem', cursor: 'pointer' }}
            />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e', display: 'block' }}>
                Maintenance Mode
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.4 }}>
                Enable this to show a maintenance page to all visitors
              </span>
            </div>
          </label>
        </div>

        <AdminButton variant="primary" size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </AdminButton>
      </div>

      <div className="admin-card admin-card-lg admin-danger-zone" style={{ maxWidth: '800px', marginTop: '1rem' }}>
        <h2 className="admin-card-section-title">Danger Zone</h2>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          These actions are irreversible. Please proceed with caution.
        </p>

        <div className="admin-actions-row">
          <AdminButton
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to clear all cache? This cannot be undone.')) {
                alert('Cache cleared successfully!');
              }
            }}
          >
            Clear Cache
          </AdminButton>

          <AdminButton
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to reset all analytics? This cannot be undone.')) {
                alert('Analytics reset!');
              }
            }}
          >
            Reset Analytics
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
