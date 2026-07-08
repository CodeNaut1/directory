import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjectUrl } from '../utils/projectUrl';

interface SimilarProject {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  status: string;
  countryName?: string | null;
  match_reason: string;
}

interface DuplicateCheckProps {
  projectName: string;
  website?: string;
  twitter?: string;
  onContinue: () => void;
  onCancel: () => void;
}

export default function DuplicateCheck({
  projectName,
  website,
  twitter,
  onContinue,
  onCancel,
}: DuplicateCheckProps) {
  const [similarProjects, setSimilarProjects] = useState<SimilarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    checkForDuplicates();
  }, [projectName, website, twitter]);

  const checkForDuplicates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, website, twitter }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSimilarProjects(
            data.data.map((project: {
              id: string;
              name: string;
              slug: string;
              website?: string | null;
              status: string;
              countryName?: string | null;
              matchReasons: string[];
            }) => ({
              id: project.id,
              name: project.name,
              slug: project.slug,
              website: project.website,
              status: project.status,
              countryName: project.countryName,
              match_reason: project.matchReasons.join(', '),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && similarProjects.length === 0) {
      onContinue();
    }
  }, [loading, similarProjects.length, onContinue]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '500px' }}>
          <p style={{ fontSize: '1.125rem', color: '#1F2937', textAlign: 'center' }}>
            Checking for similar projects...
          </p>
        </div>
      </div>
    );
  }

  if (similarProjects.length === 0) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Duplicate Project Detected
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#6B7280', margin: '0.25rem 0 0 0' }}>
              Found {similarProjects.length} existing project{similarProjects.length !== 1 ? 's' : ''} matching your submission
            </p>
          </div>
        </div>

        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9375rem', color: '#991B1B', margin: 0 }}>
            <strong>Submission blocked:</strong> This project already exists or is awaiting review. You cannot submit the same project twice — please wait for a decision on your existing submission, or edit it from your dashboard.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {similarProjects.map((project) => (
            <Link
              key={project.id}
              to={getProjectUrl(project)}
              target="_blank"
              style={{
                display: 'block',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FD5A47';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.background = '#F9FAFB';
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', margin: '0 0 0.25rem 0' }}>
                  {project.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {project.match_reason}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'capitalize' }}>
                    Status: {project.status}
                  </span>
                  {project.countryName && (
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {project.countryName}
                    </span>
                  )}
                  {project.website && (
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {project.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
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
            Go Back & Edit
          </button>
        </div>
      </div>
    </div>
  );
}
