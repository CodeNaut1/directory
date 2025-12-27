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
  category?: string;
  location?: string;
  websiteUrl?: string;
  email?: string;
  twitterHandle?: string;
  linkedinUsername?: string;
  facebookUsername?: string;
  nostrAddress?: string;
  instagramUsername?: string;
  verified?: boolean;
  bitcoinOnchain?: boolean;
  lightning?: boolean;
  giftCards?: boolean;
  industry?: string;
  bitcoinAccepted?: string;
  coreInitiatives?: {
    education?: string[];
    adoption?: string[];
    recognition?: string[];
  };
  tags?: string[];
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProject(data.data);
          } else {
            setError('Project not found');
          }
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
  }, [id]);

  if (loading) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p>Loading project...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: '4rem 1rem' }}>
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

  const bitcoinAcceptedMethods: string[] = [];
  if (project.bitcoinOnchain) bitcoinAcceptedMethods.push('Bitcoin');
  if (project.lightning) bitcoinAcceptedMethods.push('Lightning');
  if (project.giftCards) bitcoinAcceptedMethods.push('Gift Cards');
  const bitcoinAccepted = bitcoinAcceptedMethods.join(', ') || project.bitcoinAccepted || '';

  return (
    <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '3rem',
          }}
        >
          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '3rem',
              }}
            >
              {project.category && (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.875rem',
                    background: '#FEF3C7',
                    color: '#92400E',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    marginBottom: '1rem',
                  }}
                >
                  {project.category}
                </span>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <h1
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    margin: 0,
                  }}
                >
                  {project.name}
                </h1>
                {project.verified && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.875rem',
                      background: '#10B981',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(42, 157, 90, 0.08)',
                    }}
                  >
                    <img
                      src={verifiedIcon}
                      alt="Verified"
                      style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                    />
                    Verified
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                {project.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={markerPinIcon}
                      alt="Location"
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                    <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>{project.location}</span>
                  </div>
                )}
                {project.bitcoinOnchain && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={bitcoinIcon}
                      alt="Bitcoin"
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                    <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Bitcoin Onchain</span>
                    <img
                      src={verifiedIcon}
                      alt="Verified"
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                {project.lightning && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img
                      src={lightningIcon}
                      alt="Lightning"
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                    <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Lightning</span>
                    <img
                      src={verifiedIcon}
                      alt="Verified"
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: '#E5E7EB',
                  marginBottom: '2rem',
                }}
              />

              {project.description && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Description
                  </h2>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: '#1F2937',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {project.description}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl.startsWith('http') ? project.websiteUrl : `https://${project.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
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
                    <img
                      src={websiteIcon}
                      alt="Website"
                      style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    />
                    Visit Website
                  </a>
                )}
                {project.email && (
                  <a
                    href={`mailto:${project.email}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: '#FFFFFF',
                      color: '#1F2937',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }}
                  >
                    <img
                      src={emailIcon}
                      alt="Email"
                      style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    />
                    Contact the Team
                  </a>
                )}
              </div>
            </div>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '3rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1F2937',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <img
                  src={targetIcon}
                  alt="Target"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                Key Focus Areas & Integration
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {project.industry && (
                  <div
                    style={{
                      display: 'flex',
                      paddingBottom: '1.5rem',
                      borderBottom: bitcoinAccepted ? '1px solid #E5E7EB' : 'none',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        margin: 0,
                        minWidth: '140px',
                        lineHeight: 1.6,
                      }}
                    >
                      Industry
                    </p>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: '#1F2937',
                        margin: 0,
                        flex: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      {project.industry}
                    </p>
                  </div>
                )}
                {bitcoinAccepted && (
                  <div
                    style={{
                      display: 'flex',
                      paddingTop: '1.5rem',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#1F2937',
                        margin: 0,
                        minWidth: '140px',
                        lineHeight: 1.6,
                      }}
                    >
                      Bitcoin Accepted
                    </p>
                    <p
                      style={{
                        fontSize: '0.9375rem',
                        color: '#1F2937',
                        margin: 0,
                        flex: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      {bitcoinAccepted}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {project.coreInitiatives && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#1F2937',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <img
                    src={starIcon}
                    alt="Star"
                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                  />
                  Core Initiatives & Impact
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {project.coreInitiatives.education && project.coreInitiatives.education.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1F2937',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <strong>Education:</strong>
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {project.coreInitiatives.education.map((item, index) => (
                          <li
                            key={index}
                            style={{
                              fontSize: '0.9375rem',
                              color: '#1F2937',
                              lineHeight: 1.7,
                              marginBottom: '0.5rem',
                              paddingLeft: '1.5rem',
                              position: 'relative',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '0.5rem',
                                width: '6px',
                                height: '6px',
                                background: '#1F2937',
                                borderRadius: '50%',
                              }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.coreInitiatives.adoption && project.coreInitiatives.adoption.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1F2937',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <strong>Adoption & Infrastructure:</strong>
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {project.coreInitiatives.adoption.map((item, index) => (
                          <li
                            key={index}
                            style={{
                              fontSize: '0.9375rem',
                              color: '#1F2937',
                              lineHeight: 1.7,
                              marginBottom: '0.5rem',
                              paddingLeft: '1.5rem',
                              position: 'relative',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '0.5rem',
                                width: '6px',
                                height: '6px',
                                background: '#1F2937',
                                borderRadius: '50%',
                              }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.coreInitiatives.recognition && project.coreInitiatives.recognition.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#1F2937',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <strong>Recognition:</strong>
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {project.coreInitiatives.recognition.map((item, index) => (
                          <li
                            key={index}
                            style={{
                              fontSize: '0.9375rem',
                              color: '#1F2937',
                              lineHeight: 1.7,
                              marginBottom: '0.5rem',
                              paddingLeft: '1.5rem',
                              position: 'relative',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '0.5rem',
                                width: '6px',
                                height: '6px',
                                background: '#1F2937',
                                borderRadius: '50%',
                              }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '1.5rem',
                }}
              >
                Contact Info
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl.startsWith('http') ? project.websiteUrl : `https://${project.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#1F2937',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        background: '#D9D9D9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={websiteIcon}
                        alt="Website"
                        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                      />
                    </div>
                    <span>{project.websiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 'auto' }}>
                      <path
                        d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M15 3H21V9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M10 14L21 3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </a>
                )}
                {project.twitterHandle && (
                  <a
                    href={`https://twitter.com/${project.twitterHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#1F2937',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                    }}
                  >
                    <img
                      src={twitterIcon}
                      alt="Twitter"
                      style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span>{project.twitterHandle.startsWith('@') ? project.twitterHandle : `@${project.twitterHandle}`}</span>
                  </a>
                )}
                {project.linkedinUsername && (
                  <a
                    href={`https://linkedin.com/in/${project.linkedinUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#1F2937',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                    }}
                  >
                    <img
                      src={linkedInIcon}
                      alt="LinkedIn"
                      style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span>{project.linkedinUsername}</span>
                  </a>
                )}
                {project.email && (
                  <a
                    href={`mailto:${project.email}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#1F2937',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                    }}
                  >
                    <img
                      src={gmailIcon}
                      alt="Email"
                      style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span>{project.email}</span>
                  </a>
                )}
                {project.nostrAddress && (
                  <a
                    href={project.nostrAddress}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#1F2937',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                    }}
                  >
                    <img
                      src={nostrIcon}
                      alt="Nostr"
                      style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }}
                    />
                    <span>{project.nostrAddress.startsWith('@') ? project.nostrAddress : `@${project.nostrAddress}`}</span>
                  </a>
                )}
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginBottom: '1.5rem',
                  }}
                >
                  Tags
                </h2>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.375rem 0.875rem',
                        background: '#F5F5F5',
                        color: '#1F2937',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
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
  );
}
