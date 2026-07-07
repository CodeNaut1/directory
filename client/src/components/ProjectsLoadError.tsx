interface ProjectsLoadErrorProps {
  onRetry: () => void;
  message?: string;
}

export default function ProjectsLoadError({
  onRetry,
  message = 'Unable to load projects. Please try again.',
}: ProjectsLoadErrorProps) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <p style={{ color: '#6B7280', marginBottom: '1rem', fontSize: '1rem' }}>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#FD5A47',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </div>
  );
}
