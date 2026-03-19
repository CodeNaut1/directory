import { useState } from 'react';

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
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          Settings
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          Manage site-wide configuration and preferences
        </p>
      </div>

      {/* Settings Form */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem' }}>
          General Settings
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
            Site Description
          </label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
            Contact Email
          </label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #F59E0B' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <div>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#92400E' }}>
                Maintenance Mode
              </span>
              <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: '0.25rem 0 0 0' }}>
                Enable this to show a maintenance page to all visitors
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '0.75rem 2rem',
            background: isSaving ? '#D1D5DB' : '#FD5A47',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', maxWidth: '800px', marginTop: '2rem', border: '2px solid #EF4444' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991B1B', marginBottom: '1rem' }}>
          Danger Zone
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem' }}>
          These actions are irreversible. Please proceed with caution.
        </p>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear all cache? This cannot be undone.')) {
              alert('Cache cleared successfully!');
            }
          }}
          style={{
            padding: '0.75rem 2rem',
            background: '#FFFFFF',
            color: '#991B1B',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginRight: '1rem',
          }}
        >
          Clear Cache
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all analytics? This cannot be undone.')) {
              alert('Analytics reset!');
            }
          }}
          style={{
            padding: '0.75rem 2rem',
            background: '#FFFFFF',
            color: '#991B1B',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset Analytics
        </button>
      </div>
    </div>
  );
}