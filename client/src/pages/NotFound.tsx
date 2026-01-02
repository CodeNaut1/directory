import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main style={{ background: '#F5F5F5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        {/* 404 Number */}
        <h1 style={{ fontSize: '8rem', fontWeight: 700, color: '#FD5A47', margin: 0, lineHeight: 1 }}>
          404
        </h1>

        {/* Title */}
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', marginTop: '1rem', marginBottom: '1rem' }}>
          Page Not Found
        </h2>

        {/* Description */}
        <p style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '2rem' }}>
          Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#FD5A47',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E04835';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FD5A47';
            }}
          >
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              padding: '0.75rem 2rem',
              background: '#FFFFFF',
              color: '#1F2937',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}