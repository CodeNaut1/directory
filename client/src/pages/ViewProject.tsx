import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectsData from '../data/projects.json';
import type { Project } from '../data/projects.types';

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Project - African Bitcoin Directory";
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        // Try API first
        if (API_URL) {
          const response = await fetch(`${API_URL}/api/projects/${id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setProject(data.data);
              setLoading(false);
              return;
            }
          } else if (response.status !== 404) {
            if (response.status === 403) {
              setError('This project is currently under review and will be visible once approved.');
            } else {
              setError('Failed to load project');
            }
            setLoading(false);
            return;
          }
        }

        // Fallback to local data from projects.json
        const found = projectsData.projects.find(
          (p) => p.id === id || p.slug === id
        );

        if (found) {
          setProject(found as Project);
          if (found.name) {
            document.title = `${found.name} - African Bitcoin Directory`;
          }
          setLoading(false);
          return;
        }

        setError('Project not found');
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, API_URL]);

  if (loading) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p>Loading project...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1>Project Not Found</h1>
          <p>{error || 'The project you are looking for does not exist.'}</p>
          <Link to="/" style={{ color: '#FD5A47', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const bitcoinMethods: string[] = [];
  if (project.bitcoin_acceptance.onchain) bitcoinMethods.push('Bitcoin, Onchain');
  if (project.bitcoin_acceptance.lightning) bitcoinMethods.push('Lightning');
  if (project.bitcoin_acceptance.gift_cards) bitcoinMethods.push('Gift Cards');

  return (
    <>
      <style>{`
        .project-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        @media (max-width: 1024px) {
          .project-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .project-sidebar {
            order: -1 !important;
          }
        }

        @media (max-width: 640px) {
          .meta-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .action-buttons {
            flex-direction: column !important;
            width: 100% !important;
          }
          .action-buttons a,
          .action-buttons button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="project-grid">
            {/* Left Column */}
            <div>
              {/* Main Info Card */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                {/* Category Badge */}
                {project.categories && project.categories.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                      {project.categories[0]}
                    </span>
                  </div>
                )}

                {/* Title with Logo and Verified Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                  {project.image && (
                    <img src={project.image} alt={project.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                        {project.name}
                      </h1>
                      {project.verified && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: '#10B981', color: '#FFFFFF', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Verified ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Bitcoin Methods */}
                <div className="meta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                  {project.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>📍</span>
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>{project.location}</span>
                    </div>
                  )}
                  {project.bitcoin_acceptance.onchain && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>₿</span>
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Bitcoin Onchain</span>
                      {project.verified && <span style={{ color: '#10B981', fontSize: '1rem' }}>✓</span>}
                    </div>
                  )}
                  {project.bitcoin_acceptance.lightning && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>⚡</span>
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Lightning</span>
                      {project.verified && <span style={{ color: '#10B981', fontSize: '1rem' }}>✓</span>}
                    </div>
                  )}
                </div>

                {/* Description Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1F2937', marginBottom: '0.75rem' }}>
                    Description
                  </h2>
                  <p style={{ fontSize: '0.9375rem', color: '#1F2937', lineHeight: 1.7, margin: 0 }}>
                    {project.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {project.website && (
                    <a
                      href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FD5A47', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#E04835'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FD5A47'; }}
                    >
                      🌐 Visit Website
                    </a>
                  )}
                  {project.email && (
                    <a
                      href={`mailto:${project.email}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FFFFFF', color: '#1F2937', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      ✉ Contact the Team
                    </a>
                  )}
                </div>
              </div>

              {/* Key Focus Areas & Integration */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎯 Key Foucus Areas & Integration
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {project.categories.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0, minWidth: '140px' }}>Industry</p>
                      <p style={{ fontSize: '0.9375rem', color: '#1F2937', margin: 0, flex: 1 }}>{project.categories.join(', ')}</p>
                    </div>
                  )}
                  {bitcoinMethods.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0, minWidth: '140px' }}>Bitcoin Accepted</p>
                      <p style={{ fontSize: '0.9375rem', color: '#1F2937', margin: 0, flex: 1 }}>{bitcoinMethods.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Initiatives & Impact */}
              {(project.initiatives || project.impact) && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🌟 Core Initiatives & Impact
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(project.initiatives || project.impact || project.challenges) && (
                      <>
                        {project.initiatives && <p style={{ fontSize: '0.9375rem', color: '#1F2937', lineHeight: 1.7, margin: 0 }}>• {project.initiatives}</p>}
                        {project.impact && <p style={{ fontSize: '0.9375rem', color: '#1F2937', lineHeight: 1.7, margin: 0 }}>• {project.impact}</p>}
                        {project.challenges && <p style={{ fontSize: '0.9375rem', color: '#1F2937', lineHeight: 1.7, margin: 0 }}>• {project.challenges}</p>}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="project-sidebar">
              {/* Contact Info - AT TOP */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>
                  Contact Info
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {project.website && (
                    <a
                      href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <span style={{ fontSize: '1.25rem', width: '20px', textAlign: 'center' }}>🌐</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                      </span>
                    </a>
                  )}
                  {project.social.twitter && (
                    <a
                      href={project.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <span style={{ fontSize: '1.25rem', width: '20px', textAlign: 'center' }}>𝕏</span>
                      <span>@{project.social.twitter.split('/').pop()?.replace('@', '') || 'Twitter'}</span>
                    </a>
                  )}
                  {project.social.linkedin && (
                    <a
                      href={project.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <span style={{ fontSize: '1.25rem', width: '20px', textAlign: 'center' }}>💼</span>
                      <span>{project.name}</span>
                    </a>
                  )}
                  {project.email && (
                    <a
                      href={`mailto:${project.email}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <span style={{ fontSize: '1.25rem', width: '20px', textAlign: 'center' }}>✉️</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.email}</span>
                    </a>
                  )}
                  {project.social.nostr && (
                    <a
                      href={project.social.nostr}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <span style={{ fontSize: '1.25rem', width: '20px', textAlign: 'center' }}>🟣</span>
                      <span>Nostr</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>
                    Tags
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{ padding: '0.5rem 1rem', background: '#FFFFFF', color: '#1F2937', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #E5E7EB' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}