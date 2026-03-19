import { useState } from 'react';

interface ClaimProjectModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimProjectModal({ projectId, projectName, onClose, onSuccess }: ClaimProjectModalProps) {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [proofOfOwnership, setProofOfOwnership] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofOfOwnership.trim() || proofOfOwnership.trim().length < 10) {
      setError('Please provide at least 10 characters explaining why you should own this project');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/projects/${projectId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ proofOfOwnership: proofOfOwnership.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error?.message || data.error || 'Failed to submit claim');
      }
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(2rem, 5vw, 3rem)', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.75rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
          Claim Project Ownership
        </h2>

        <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#4B5563', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          You're about to submit a claim for <strong>{projectName}</strong>. Our team will review your request and get back to you within 2 business days.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="proofOfOwnership" style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.5rem' }}>
              Why should you own this project? <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              id="proofOfOwnership"
              value={proofOfOwnership}
              onChange={(e) => {
                setProofOfOwnership(e.target.value);
                setError('');
              }}
              placeholder="e.g., I am the founder of this project. You can verify this by checking our website's About page or contacting me at founder@example.com..."
              rows={6}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.9375rem',
                border: error ? '2px solid #EF4444' : '1px solid #D1D5DB',
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
            <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.5rem' }}>
              Provide details like: your role in the project, how to verify your identity, contact information, etc.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#FFFFFF',
                color: '#1F2937',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                background: isSubmitting ? '#D1D5DB' : '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}