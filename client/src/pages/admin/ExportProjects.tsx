import { useState } from 'react';

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
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      if (status) {
        params.set('status', status);
      }

      const response = await fetch(`${API_URL}/api/admin/projects/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Failed to export projects.';
        try {
          const data = await response.json();
          message =
            typeof data.error === 'string'
              ? data.error
              : data.error?.message || message;
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0' }}>
          Export Submissions
        </h1>
        <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
          Download submitted projects as a CSV file for the date range you choose.
        </p>
      </div>

      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '720px',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem' }}>
          Export Settings
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <label
              htmlFor="startDate"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '0.5rem',
              }}
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '0.5rem',
              }}
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate}
              max={formatDateInput(new Date())}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="status"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '0.5rem',
              }}
            >
              Status Filter
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9375rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          The CSV includes project details such as name, country, category, tags, descriptions,
          contact info, social links, founder info, Bitcoin acceptance, submission status, and
          submitter details.
        </p>

        {error && (
          <div
            style={{
              padding: '0.875rem 1rem',
              background: '#FEE2E2',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        {lastExportCount !== null && !error && (
          <div
            style={{
              padding: '0.875rem 1rem',
              background: '#D1FAE5',
              border: '1px solid #10B981',
              borderRadius: '8px',
              color: '#065F46',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            Export complete — {lastExportCount} project{lastExportCount === 1 ? '' : 's'} downloaded.
          </div>
        )}

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          style={{
            padding: '0.875rem 2rem',
            background: isExporting ? '#D1D5DB' : '#FD5A47',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: isExporting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>{isExporting ? '⏳' : '📥'}</span>
          {isExporting ? 'Generating CSV...' : 'Download CSV'}
        </button>
      </div>

      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '720px',
          marginTop: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
          CSV Columns
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, lineHeight: 1.7 }}>
          Submitted At, Project ID, Name, Slug, Status, Published, Verified, Featured, Active,
          Country, Country Code, City, Location, Address, Category, Categories, Tags, Short
          Description, Initiatives, Impact, Challenges, Website, Email, Founded Year, Logo URL,
          Bitcoin acceptance flags, social links, founder info, submitter name/email, and timestamps.
        </p>
      </div>
    </div>
  );
}
