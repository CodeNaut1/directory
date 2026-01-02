import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main
      style={{
        background: '#F5F5F5',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          padding: '0 1rem',
          boxSizing: 'border-box',
        }}
      >
        {/* 404 Number - Responsive font size */}
        <h1
          style={{
            fontSize: 'clamp(6rem, 18vw, 10rem)',
            fontWeight: 700,
            color: '#FD5A47',
            margin: 0,
            lineHeight: 1,
          }}
        >
          404
        </h1>

        {/* Title - Responsive */}
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
            fontWeight: 700,
            color: '#1F2937',
            marginTop: '1rem',
            marginBottom: '1rem',
          }}
        >
          Page Not Found
        </h2>

        {/* Description - Responsive */}
        <p
          style={{
            fontSize: 'clamp(0.9375rem, 2.5vw, 1.125rem)',
            color: '#6B7280',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            padding: '0 0.5rem',
          }}
        >
          Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
        </p>

        {/* Actions - Stack on mobile, side-by-side on tablet+ */}
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
            gap: window.innerWidth <= 640 ? '1rem' : '1.5rem',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'block',
              width: window.innerWidth <= 640 ? '100%' : 'auto',
              padding: '0.875rem 2rem',
              background: '#FD5A47',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
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
              width: window.innerWidth <= 640 ? '100%' : 'auto',
              padding: '0.875rem 2rem',
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