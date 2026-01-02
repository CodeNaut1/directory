import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import markerPinIcon from '../assets/marker-pin.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';
import websiteIcon from '../assets/website-icon.png';
import emailIcon from '../assets/mail-icon.png';
import verifiedIcon from '../assets/verified-icon.png';
import targetIcon from '../assets/target-icon.png';
import starIcon from '../assets/star-icon.png';
import twitterIcon from '../assets/twitter-icon.png';
import linkedInIcon from '../assets/linkedIn-icon.png';
import gmailIcon from '../assets/gmail-icon.png';
import nostrIcon from '../assets/nostr-icon.png';

interface ProjectData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  country?: {
    id: string;
    name: string;
    code: string;
  };
  city?: string;
  verified?: boolean;
  details?: {
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      facebook?: string;
      instagram?: string;
      nostr?: string;
    };
    contactEmail?: string;
    bitcoinOnly?: boolean;
    lightningNetwork?: boolean;
    longDescription?: string;
  };
  tags?: Array<{ id: string; name: string; slug: string }>;
}

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [project, setProject] = useState<ProjectData | null>(null);
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
        const response = await fetch(`${API_URL}/api/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProject(data.data);
          } else {
            setError('Project not found');
          }
        } else if (response.status === 403 || response.status === 404) {
          setError('This project is currently under review and will be visible once approved.');
        } else {
          setError('Failed to load project');
        }
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

  const location = [project.city, project.country?.name].filter(Boolean).join(', ');
  const bitcoinMethods: string[] = [];
  if (project.details?.bitcoinOnly) bitcoinMethods.push('Bitcoin');
  if (project.details?.lightningNetwork) bitcoinMethods.push('Lightning');

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
          .title-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .title-row img {
            margin-bottom: 1rem !important;
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
          .focus-grid {
            flex-direction: column !important;
          }
          .focus-label {
            min-width: auto !important;
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
                {project.category && (
                  <span style={{ display: 'inline-block', padding: '0.375rem 0.875rem', background: '#FEF3C7', color: '#92400E', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
                    {project.category.name}
                  </span>
                )}

                {/* Title Row with Logo and Verified */}
                <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  {project.logo && (
                    <img src={project.logo} alt={project.name} style={{ width: 'clamp(50px, 10vw, 60px)', height: 'clamp(50px, 10vw, 60px)', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1F2937', margin: 0, wordBreak: 'break-word' }}>
                      {project.name}
                    </h1>
                  </div>
                  {project.verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', background: '#10B981', color: '#FFFFFF', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <img src={verifiedIcon} alt="Verified" style={{ width: '14px', height: '14px' }} />
                      Verified
                    </span>
                  )}
                </div>

                {/* Location & Bitcoin Methods */}
                <div className="meta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                  {location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={markerPinIcon} alt="Location" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>{location}</span>
                    </div>
                  )}
                  {project.details?.bitcoinOnly && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={bitcoinIcon} alt="Bitcoin" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Bitcoin Onchain</span>
                      {project.verified && <img src={verifiedIcon} alt="Verified" style={{ width: '16px', height: '16px' }} />}
                    </div>
                  )}
                  {project.details?.lightningNetwork && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={lightningIcon} alt="Lightning" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Lightning</span>
                      {project.verified && <img src={verifiedIcon} alt="Verified" style={{ width: '16px', height: '16px' }} />}
                    </div>
                  )}
                </div>

                <div style={{ width: '100%', height: '1px', background: '#E5E7EB', marginBottom: '2rem' }} />

                {/* Description */}
                {project.description && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 600, color: '#1F2937', marginBottom: '0.75rem' }}>
                      Description
                    </h2>
                    <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', lineHeight: 1.7, margin: 0 }}>
                      {project.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
                  {project.website && (
                    <a
                      href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FD5A47', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#E04835'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FD5A47'; }}
                    >
                      <img src={websiteIcon} alt="Website" style={{ width: '18px', height: '18px' }} />
                      Visit Website
                    </a>
                  )}
                  {project.details?.contactEmail && (
                    <a
                      href={`mailto:${project.details.contactEmail}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FFFFFF', color: '#1F2937', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      <img src={emailIcon} alt="Email" style={{ width: '18px', height: '18px' }} />
                      Contact the Team
                    </a>
                  )}
                </div>
              </div>

              {/* Key Focus Areas */}
              {(project.category?.name || bitcoinMethods.length > 0) && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <img src={targetIcon} alt="Target" style={{ width: '24px', height: '24px' }} />
                    Key Focus Areas & Integration
                  </h2>
                  <div className="focus-grid" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {project.category && (
                      <div style={{ display: 'flex', paddingBottom: '1.5rem', borderBottom: bitcoinMethods.length > 0 ? '1px solid #E5E7EB' : 'none' }}>
                        <p className="focus-label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0, minWidth: '140px', lineHeight: 1.6 }}>Industry</p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', margin: 0, flex: 1, lineHeight: 1.6 }}>{project.category.name}</p>
                      </div>
                    )}
                    {bitcoinMethods.length > 0 && (
                      <div style={{ display: 'flex', paddingTop: project.category ? '1.5rem' : 0 }}>
                        <p className="focus-label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0, minWidth: '140px', lineHeight: 1.6 }}>Bitcoin Accepted</p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', margin: 0, flex: 1, lineHeight: 1.6 }}>{bitcoinMethods.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Core Initiatives */}
              {project.details?.longDescription && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <img src={starIcon} alt="Star" style={{ width: '24px', height: '24px' }} />
                    Core Initiatives & Impact
                  </h2>
                  <div style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {project.details.longDescription}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="project-sidebar">
              {/* Contact Info Card */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>
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
                      <img src={websiteIcon} alt="Website" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.website.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </a>
                  )}
                  {project.details?.socialLinks?.twitter && (
                    <a
                      href={project.details.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <img src={twitterIcon} alt="Twitter" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.details.socialLinks.twitter.split('/').pop()?.replace('@', '') || 'Twitter'}</span>
                    </a>
                  )}
                  {project.details?.socialLinks?.linkedin && (
                    <a
                      href={project.details.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <img src={linkedInIcon} alt="LinkedIn" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.details.socialLinks.linkedin.split('/').pop() || 'LinkedIn'}</span>
                    </a>
                  )}
                  {project.details?.contactEmail && (
                    <a
                      href={`mailto:${project.details.contactEmail}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <img src={gmailIcon} alt="Email" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.details.contactEmail}</span>
                    </a>
                  )}
                  {project.details?.socialLinks?.nostr && (
                    <a
                      href={project.details.socialLinks.nostr}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      <img src={nostrIcon} alt="Nostr" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.details.socialLinks.nostr.split('/').pop() || 'Nostr'}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>
                    Tags
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{ padding: '0.375rem 0.875rem', background: '#FFFFFF', color: '#1F2937', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #E5E7EB' }}
                      >
                        {tag.name}
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