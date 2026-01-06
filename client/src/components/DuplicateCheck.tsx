import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface SimilarProject {
  id: string;
  name: string;
  slug: string;
  website?: string;
  twitter?: string;
  image?: string;
  description?: string;
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
  onCancel
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
      // Fetch all projects
      let allProjects: any[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`${API_URL}/api/projects?page=${page}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            allProjects = [...allProjects, ...data.data];
            const total = data.meta?.total || 0;
            hasMore = allProjects.length < total;
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      // Find similar projects
      const similar: SimilarProject[] = [];

      allProjects.forEach((project) => {
        const reasons: string[] = [];

        // 1. Check exact website match
        if (website && project.website) {
          const normalizedWebsite = website.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
          const normalizedProjectWebsite = project.website.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

          if (normalizedWebsite === normalizedProjectWebsite) {
            reasons.push('Same website');
          }
        }

        // 2. Check exact Twitter match
        if (twitter && project.social?.twitter) {
          const normalizedTwitter = twitter.toLowerCase().replace('@', '').split('/').pop()?.split('?')[0];
          const normalizedProjectTwitter = project.social.twitter.toLowerCase().replace('@', '').split('/').pop()?.split('?')[0];

          if (normalizedTwitter === normalizedProjectTwitter) {
            reasons.push('Same Twitter handle');
          }
        }

        // 3. Check similar name (fuzzy matching)
        if (projectName && project.name) {
          const similarity = calculateSimilarity(projectName.toLowerCase(), project.name.toLowerCase());
          if (similarity > 0.7) { // 70% similar
            reasons.push(`Similar name (${Math.round(similarity * 100)}% match)`);
          }
        }

        if (reasons.length > 0) {
          similar.push({
            id: project.id,
            name: project.name,
            slug: project.slug,
            website: project.website,
            twitter: project.social?.twitter,
            image: project.image,
            description: project.description,
            match_reason: reasons.join(', '),
          });
        }
      });

      setSimilarProjects(similar);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate string similarity (Levenshtein distance based)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

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
    // No duplicates found, continue automatically
    onContinue();
    return null;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        {/* Warning Header */}
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

        {/* Warning Message */}
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9375rem', color: '#991B1B', margin: 0 }}>
            <strong>🚫 Submission Blocked:</strong> This project appears to already exist in our directory. We cannot accept duplicate submissions with identical websites, Twitter handles, or similar names. Please review the existing listings below.
          </p>
        </div>

        {/* Similar Projects List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {similarProjects.map((project) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                {project.image && (
                  <img src={project.image} alt={project.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', margin: '0 0 0.25rem 0' }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 0.5rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {project.match_reason}
                    </span>
                    {project.website && (
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        🌐 {project.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                      </span>
                    )}
                    {project.twitter && (
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        🐦 @{project.twitter.split('/').pop()?.replace('@', '')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions */}
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