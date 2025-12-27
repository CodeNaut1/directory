import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SubmitSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectName = (location.state as any)?.projectName || 'your project';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '3rem',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '1rem',
            margin: 0,
          }}
        >
          Project Submitted Successfully
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#4B5563',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Your project has been received. Our team will review it to ensure everything meets our
          guidelines. You&apos;ll receive an update once it&apos;s approved or if we need any changes
          — usually within 2 days.
        </p>
      </div>
    </div>
  );
}

