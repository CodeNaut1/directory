import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import {
  AdminButton,
  AdminPageHeader,
} from '../../components/admin/AdminUI';

type StatusFilter = '' | 'pending' | 'approved' | 'rejected' | 'draft';

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return formatDateInput(date);
}

export default function ExportProjects() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(formatDateInput(new Date()));
  const [status, setStatus] = useState<StatusFilter>('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExportCount, setLastExportCount] = useState<number | null>(null);

  const handleExport = async () => {
    setError(null);
    setLastExportCount(null);

    if (startDate > endDate) {
      setError('Start date must be on or before end date.');
      return;
    }

    setIsExporting(true);

    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({ startDate, endDate });
      if (status) {
        params.set('status', status);
      }

      const response = await fetch(`${API_URL}/api/admin/projects/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let message = 'Failed to export projects.';
        try {
          const data = await response.json();
          message = typeof data.error === 'string' ? data.error : data.error?.message || message;
        } catch {
          // CSV error responses may not be JSON
        }
        throw new Error(message);
      }

      const countHeader = response.headers.get('X-Export-Count');
      const count = countHeader ? parseInt(countHeader, 10) : null;
      setLastExportCount(count);

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || `submitted-projects_${startDate}_to_${endDate}.csv`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Export Submissions"
        subtitle="Download submitted projects as a CSV file for the date range you choose."
      />

      <div className="admin-card admin-card-lg" style={{ maxWidth: '720px' }}>
        <h2 className="admin-card-section-title">Export Settings</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="startDate" className="admin-form-label">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="endDate" className="admin-form-label">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate}
              max={formatDateInput(new Date())}
              onChange={(e) => setEndDate(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="status" className="admin-form-label">Status Filter</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="admin-select"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          The CSV includes project details such as name, country, category, tags, descriptions,
          contact info, social links, founder info, Bitcoin acceptance, submission status, and
          submitter details.
        </p>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {lastExportCount !== null && !error && (
          <div className="admin-alert admin-alert-success">
            Export complete — {lastExportCount} project{lastExportCount === 1 ? '' : 's'} downloaded.
          </div>
        )}

        <AdminButton variant="primary" size="lg" onClick={handleExport} disabled={isExporting} icon={isExporting ? Loader2 : Download}>
          {isExporting ? 'Generating CSV...' : 'Download CSV'}
        </AdminButton>
      </div>

      <div className="admin-card admin-card-lg" style={{ maxWidth: '720px', marginTop: '1rem' }}>
        <h2 className="admin-card-section-title">CSV Columns</h2>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0, lineHeight: 1.7 }}>
          Submitted At, Project ID, Name, Slug, Status, Published, Verified, Featured, Active,
          Country, Country Code, City, Location, Address, Category, Categories, Tags, Short
          Description, Initiatives, Impact, Challenges, Website, Email, Founded Year, Logo URL,
          Bitcoin acceptance flags, social links, founder info, submitter name/email, and timestamps.
        </p>
      </div>
    </div>
  );
}
