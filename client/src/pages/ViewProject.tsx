import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectsData from '../data/projects.json';
import type { Project } from '../data/projects.types';
import { useAuth } from '../contexts/AuthContext';
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
import facebookIcon from '../assets/facebook-icon.png';
import instagramIcon from '../assets/instagram-icon.png';
import ClaimProjectModal from '../components/ClaimProjectModal';

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const VerifiedBadge = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="#10B981" />
      <path d="M11.3 5.3L6.5 10.1L4.7 8.3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

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
          // If 404, fall through to local data
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

        // If we get here, project was not found
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

  // Check if user can claim this project
  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!isLoggedIn || !user || !project || !id) return;

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/projects/${id}/claim/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClaimStatus(data.data);
        }
      } catch (error) {
        console.error('Error checking claim status:', error);
      }
    };

    checkClaimStatus();
  }, [isLoggedIn, user, project, id, API_URL]);

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
  if (project.bitcoin_acceptance.onchain) bitcoinMethods.push('Bitcoin Onchain');
  if (project.bitcoin_acceptance.lightning) bitcoinMethods.push('Lightning Network');
  if (project.bitcoin_acceptance.gift_cards) bitcoinMethods.push('Gift Cards');

  // Count available social links
  const socialLinks = [
    project.website,
    project.social.twitter,
    project.social.linkedin,
    project.social.facebook,
    project.social.instagram,
    project.social.youtube,
    project.social.telegram,
    project.social.nostr,
  ].filter(Boolean);

  // Check if project has an owner
  const hasOwner = 'user' in project && (project as any).user;

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
                {project.categories && project.categories.length > 0 && (
                  <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {project.categories.map((cat, idx) => (
                      <span key={idx} style={{ display: 'inline-block', padding: '0.375rem 0.875rem', background: '#FEF3C7', color: '#92400E', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500 }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title Row with Logo and Verified */}
                <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                  {project.image && (
                    <img src={project.image} alt={project.name} style={{ width: 'clamp(50px, 10vw, 60px)', height: 'clamp(50px, 10vw, 60px)', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1F2937', margin: 0, wordBreak: 'break-word' }}>
                      {project.name}
                    </h1>
                  </div>
                  {project.verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      Verified <VerifiedBadge />
                    </span>
                  )}
                  {project.featured && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem', background: '#FD5A47', color: '#FFFFFF', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Location & Bitcoin Methods */}
                <div className="meta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  {project.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={markerPinIcon} alt="Location" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>{project.location}</span>
                      {project.country_code && (
                        <span className={`fi fi-${project.country_code.toLowerCase()}`} style={{ fontSize: '1.2rem' }}></span>
                      )}
                    </div>
                  )}
                  {project.bitcoin_acceptance.onchain && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={bitcoinIcon} alt="Bitcoin" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Bitcoin Onchain</span>
                      {project.verified && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                          <circle cx="8" cy="8" r="8" fill="#10B981" />
                          <path d="M11.3 5.3L6.5 10.1L4.7 8.3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  )}
                  {project.bitcoin_acceptance.lightning && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={lightningIcon} alt="Lightning" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <span style={{ color: '#1F2937', fontSize: '0.9375rem' }}>Lightning</span>
                      {project.verified && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                          <circle cx="8" cy="8" r="8" fill="#10B981" />
                          <path d="M11.3 5.3L6.5 10.1L4.7 8.3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  )}
                  {project.founded_year && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Founded: {project.founded_year}</span>
                    </div>
                  )}
                </div>

                <div style={{ width: '100%', height: '1px', background: '#E5E7EB', marginBottom: '2rem' }} />

                {/* Description */}
                {project.description && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 600, color: '#1F2937', marginBottom: '0.75rem' }}>
                      About
                    </h2>
                    <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', lineHeight: 1.7, margin: 0 }}>
                      {project.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="action-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                  {project.email && (
                    <a
                      href={`mailto:${project.email}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FFFFFF', color: '#1F2937', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      <img src={emailIcon} alt="Email" style={{ width: '18px', height: '18px' }} />
                      Contact Team
                    </a>
                  )}

                  {/* Claim Project Button - Show if user is logged in and project has no owner */}
                  {isLoggedIn && user && !hasOwner && !claimStatus && (
                    <button
                      onClick={() => setShowClaimModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s', whiteSpace: 'nowrap', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; }}
                    >
                      ✋ Claim This Project
                    </button>
                  )}

                  {/* Show claim status if user has already claimed */}
                  {claimStatus && claimStatus.status === 'pending' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600 }}>
                      ⏳ Claim Pending Review
                    </div>
                  )}

                  {claimStatus && claimStatus.status === 'approved' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#D1FAE5', color: '#065F46', border: '1px solid #10B981', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600 }}>
                      ✅ Claim Approved
                    </div>
                  )}

                  {claimStatus && claimStatus.status === 'rejected' && (
                    <button
                      onClick={() => setShowClaimModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #EF4444', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ❌ Claim Rejected - Reapply
                    </button>
                  )}
                </div>
              </div>

              {/* Key Focus Areas */}
              {(project.categories.length > 0 || bitcoinMethods.length > 0) && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 1.25rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <img src={targetIcon} alt="Target" style={{ width: '32px', height: '32px' }} />
                    Key Focus Areas
                  </h2>
                  <div className="focus-grid" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {project.categories.length > 0 && (
                      <div style={{ display: 'flex', paddingBottom: '1.5rem', borderBottom: bitcoinMethods.length > 0 ? '1px solid #E5E7EB' : 'none' }}>
                        <p className="focus-label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0, minWidth: '140px', lineHeight: 1.6 }}>Industry</p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', margin: 0, flex: 1, lineHeight: 1.6 }}>{project.categories.join(', ')}</p>
                      </div>
                    )}
                    {bitcoinMethods.length > 0 && (
                      <div style={{ display: 'flex', paddingTop: project.categories.length > 0 ? '1.5rem' : 0 }}>
                        <p className="focus-label" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937', margin: 0, minWidth: '140px', lineHeight: 1.6 }}>Bitcoin Accepted</p>
                        <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', margin: 0, flex: 1, lineHeight: 1.6 }}>{bitcoinMethods.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Core Initiatives, Impact & Challenges */}
              {(project.initiatives || project.impact || project.challenges) && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 1.25rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <img src={starIcon} alt="Star" style={{ width: '32px', height: '32px' }} />
                    Core Initiatives and Impacts
                  </h2>

                  {project.initiatives && (
                    <div style={{ marginBottom: project.impact || project.challenges ? '1.5rem' : 0 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F59E0B', marginBottom: '0.75rem' }}>Core Initiatives</h3>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                        {project.initiatives.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                            {line.trim().replace(/^[•\-]\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.impact && (
                    <div style={{ marginBottom: project.challenges ? '1.5rem' : 0 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F59E0B', marginBottom: '0.75rem' }}>Impact & Achievements</h3>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                        {project.impact.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                            {line.trim().replace(/^[•\-]\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {project.challenges && (
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#F59E0B', marginBottom: '0.75rem' }}>Current Challenges</h3>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                        {project.challenges.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                            {line.trim().replace(/^[•\-]\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Founder Information */}
              {project.founder && (project.founder.name || project.founder.twitter) && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 1.25rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1.5rem' }}>
                    Founder Information
                  </h2>
                  {project.founder.name && (
                    <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', marginBottom: '0.75rem' }}>
                      <strong>Name:</strong> {project.founder.name}
                    </p>
                  )}
                  {project.founder.twitter && (
                    <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.9375rem)', color: '#1F2937', marginBottom: '0.75rem' }}>
                      <strong>Twitter:</strong>{' '}
                      <a href={project.founder.twitter} target="_blank" rel="noopener" style={{ color: '#FD5A47', textDecoration: 'none' }}>
                        @{project.founder.twitter.split('/').pop()?.replace('@', '').split('?')[0]}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="project-sidebar">
              {/* Contact Info Card */}
              {socialLinks.length > 0 && (
                <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <h2 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', fontWeight: 600, color: '#1F2937', marginBottom: '1.5rem' }}>
                    Connect
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {project.website && (
                      <a
                        href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#1F2937" strokeWidth="2" />
                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#1F2937" strokeWidth="2" />
                        </svg>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {project.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
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
                        <img src={twitterIcon} alt="Twitter" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                        <span>@{project.social.twitter.split('/').pop()?.replace('@', '').split('?')[0] || 'Twitter'}</span>
                      </a>
                    )}
                    {project.social.linkedin && (
                      <a
                        href={project.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                      >
                        <img src={linkedInIcon} alt="LinkedIn" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                        <span>{project.social.linkedin.includes('/company/')
                          ? project.social.linkedin.split('/company/')[1]?.replace('/', '')
                          : project.social.linkedin.split('/in/')[1]?.replace('/', '') || 'LinkedIn'}</span>
                      </a>
                    )}
                    {project.email && (
                      <a
                        href={`mailto:${project.email}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                      >
                        <img src={gmailIcon} alt="Email" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
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
                        <img src={nostrIcon} alt="Nostr" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                        <span>{project.social.nostr.startsWith('npub')
                          ? `${project.social.nostr.substring(0, 20)}...`
                          : project.social.nostr.includes('nostr.com/') || project.social.nostr.includes('primal.net/')
                            ? project.social.nostr.split('/').pop()?.replace('@', '') || 'Nostr'
                            : 'Nostr'}</span>
                      </a>
                    )}
                    {project.social.youtube && (
                      <a
                        href={project.social.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                      >
                        <span style={{ fontSize: '20px' }}>▶️</span>
                        <span>{project.social.youtube.includes('/@')
                          ? project.social.youtube.split('/@')[1]?.split('/')[0]
                          : project.social.youtube.includes('/channel/') || project.social.youtube.includes('/c/')
                            ? 'YouTube'
                            : 'YouTube'}</span>
                      </a>
                    )}
                    {project.social.telegram && (
                      <a
                        href={project.social.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1F2937', textDecoration: 'none', fontSize: '0.9375rem' }}
                      >
                        <span style={{ fontSize: '20px' }}>✈️</span>
                        <span>@{project.social.telegram.split('/').pop()?.replace('@', '') || 'Telegram'}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

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
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div >
      </main >

      {/* Claim Modal */}
      {
        showClaimModal && (
          <ClaimProjectModal
            projectId={id!}
            projectName={project.name}
            onClose={() => setShowClaimModal(false)}
            onSuccess={() => {
              setShowClaimModal(false);
              // Refresh claim status
              window.location.reload();
            }}
          />
        )
      }
    </>
  );
}