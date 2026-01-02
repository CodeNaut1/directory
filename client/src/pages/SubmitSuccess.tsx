import { Link } from 'react-router-dom';

export default function SubmitSuccess() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '2rem 1.5rem', // reduced horizontal padding on small screens
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          boxSizing: 'border-box',
        }}
      >
        {/* Checkmark Icon - scales down on mobile */}
        <div
          style={{
            width: 'clamp(64px, 18vw, 80px)',
            height: 'clamp(64px, 18vw, 80px)',
            borderRadius: '50%',
            background: '#10B981',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
          }}
        >
          <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title - responsive font size */}
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 6vw, 2rem)',
            fontWeight: 700,
            color: '#1F2937',
            margin: '0 0 1rem 0',
          }}
        >
          Project Submitted Successfully
        </h1>

        {/* Description - responsive font & side padding */}
        <p
          style={{
            fontSize: 'clamp(0.9375rem, 2.5vw, 1rem)',
            color: '#4B5563',
            lineHeight: 1.6,
            margin: '0 auto 2.5rem',
            maxWidth: '440px',
            padding: '0 0.5rem',
          }}
        >
          Your project has been received. Our team will review it to ensure everything meets our
          guidelines. You'll receive an update once it's approved or if we need any changes —
          usually within 2 days.
        </p>

        {/* Buttons - stack vertically on mobile, side-by-side on tablet+ */}
        <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
            gap: window.innerWidth <= 640 ? '1rem' : '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: 'block',
              width: window.innerWidth <= 640 ? '100%' : 'auto',
              padding: '0.875rem 1.5rem',
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
            Go to Dashboard
          </Link>

          <Link
            to="/"
            style={{
              display: 'block',
              width: window.innerWidth <= 640 ? '100%' : 'auto',
              padding: '0.875rem 1.5rem',
              background: '#FFFFFF',
              color: '#1F2937',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
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
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}