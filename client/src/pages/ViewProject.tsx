import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Project } from '../data/projects.types';
import { useAuth } from '../contexts/AuthContext';
import ClaimProjectModal from '../components/ClaimProjectModal';
import VerifiedBadge from '../components/VerifiedBadge';
import {
  Star,
  MapPin,
  Zap,
  Gift,
  ExternalLink,
  Mail,
  Pencil,
  Globe,
  AtSign,
  Link2,
  Play,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

function BitcoinSymbol({ size = 14 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: size * 0.72,
        fontWeight: 600,
        lineHeight: 1,
        color: '#D97706',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      ₿
    </span>
  );
}

interface ProjectWithUser extends Project {
  userId?: string | null;
  user?: {
    id: string;
    name: string;
  } | null;
}

const COLORS = {
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  bg: '#FAFAFA',
  primary: '#171717',
  verified: '#064E3B',
  verifiedBg: '#ECFDF5',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: COLORS.muted,
        margin: '0 0 1rem',
      }}
    >
      {children}
    </h2>
  );
}

function EditorialBlock({ title, content }: { title: string; content: string }) {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 500,
          color: COLORS.text,
          margin: '0 0 0.75rem',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {lines.map((line, idx) => (
          <p
            key={idx}
            style={{
              fontSize: '0.9375rem',
              color: '#374151',
              lineHeight: 1.75,
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            {line.trim().replace(/^[•\-]\s*/, '')}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [project, setProject] = useState<ProjectWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();
  const [claimStatus, setClaimStatus] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    document.title = 'Project - African Bitcoin Directory';
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        const headers: HeadersInit = {};
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/projects/${id}`, { headers });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProject(data.data);
            if (data.data.name) {
              document.title = `${data.data.name} - African Bitcoin Directory`;
            }
            setLoading(false);
            return;
          }
        }

        if (response.status === 403 || response.status === 401) {
          const errorData = await response.json();
          setError(errorData.error?.message || 'This project is currently under review.');
          setLoading(false);
          return;
        }

        if (response.status === 404) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        setError('Failed to load project');
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project');
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, API_URL]);

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!isLoggedIn || !user || !project || !id) return;

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/projects/${id}/claim/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setClaimStatus(data.data);
        }
      } catch (err) {
        console.error('Error checking claim status:', err);
      }
    };

    checkClaimStatus();
  }, [isLoggedIn, user, project, id, API_URL]);

  if (loading) {
    return (
      <main style={{ background: COLORS.bg, minHeight: '100vh', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <p style={{ color: COLORS.muted, fontSize: '0.9375rem', fontWeight: 400 }}>Loading project...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main style={{ background: COLORS.bg, minHeight: '100vh', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: COLORS.muted, fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none' }}
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Back to Home
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 500, color: COLORS.text, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            Project not found
          </h1>
          <p style={{ color: COLORS.muted, fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
            {error || 'The project you are looking for does not exist.'}
          </p>
        </div>
      </main>
    );
  }

  const bitcoinMethods: string[] = [];
  if (project.bitcoin_acceptance.onchain) bitcoinMethods.push('Onchain');
  if (project.bitcoin_acceptance.lightning) bitcoinMethods.push('Lightning');
  if (project.bitcoin_acceptance.gift_cards) bitcoinMethods.push('Gift Cards');

  const hasOwner = project.userId !== null && project.userId !== undefined;
  const isOwner = user && project.userId === user.id;

  const websiteUrl = project.website
    ? (project.website.startsWith('http') ? project.website : `https://${project.website}`)
    : null;

  const socialItems = [
    project.website && {
      label: project.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''),
      href: websiteUrl!,
      icon: Globe,
    },
    project.social.twitter && {
      label: `@${project.social.twitter.split('/').pop()?.replace('@', '').split('?')[0] || 'Twitter'}`,
      href: project.social.twitter,
      icon: AtSign,
    },
    project.social.linkedin && {
      label: project.social.linkedin.includes('/company/')
        ? project.social.linkedin.split('/company/')[1]?.replace('/', '') || 'LinkedIn'
        : project.social.linkedin.split('/in/')[1]?.replace('/', '') || 'LinkedIn',
      href: project.social.linkedin,
      icon: Link2,
    },
    project.email && {
      label: project.email,
      href: `mailto:${project.email}`,
      icon: Mail,
    },
    project.social.youtube && {
      label: 'YouTube',
      href: project.social.youtube,
      icon: Play,
    },
    project.social.telegram && {
      label: `@${project.social.telegram.split('/').pop()?.replace('@', '') || 'Telegram'}`,
      href: project.social.telegram,
      icon: Send,
    },
  ].filter(Boolean) as Array<{ label: string; href: string; icon: typeof Globe }>;

  return (
    <>
      <style>{`
        .project-page {
          background: ${COLORS.bg};
          min-height: 100vh;
          padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(4rem, 8vw, 6rem);
        }

        .project-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 4rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .project-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .project-sidebar {
            order: -1;
          }
        }

        @media (max-width: 640px) {
          .project-hero-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .project-hero-actions a,
          .project-hero-actions button {
            width: 100%;
            justify-content: center !important;
          }
        }
      `}</style>

      <main className="project-page">
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: COLORS.muted,
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted; }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
            Directory
          </Link>

          {/* Hero */}
          <header style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: `1px solid ${COLORS.border}` }}>
            {project.categories && project.categories.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {project.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#92400E',
                      padding: '0.375rem 0.875rem',
                      border: '1px solid #FDE68A',
                      borderRadius: '999px',
                      background: '#FFFBEB',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              {project.image && (
                <img
                  src={project.image}
                  alt={project.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    objectFit: 'cover',
                    border: `1px solid ${COLORS.border}`,
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <h1
                    style={{
                      fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
                      fontWeight: 500,
                      color: COLORS.text,
                      margin: 0,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                    }}
                  >
                    {project.name}
                  </h1>
                  {project.featured && (
                    <Star size={18} fill="#D97706" color="#D97706" strokeWidth={1.5} aria-label="Featured" />
                  )}
                  {project.verified && <VerifiedBadge />}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', alignItems: 'center' }}>
                  {project.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: COLORS.muted }}>
                      <MapPin size={15} strokeWidth={1.75} />
                      {project.location}
                      {project.country_code && project.country_code !== 'xx' && (
                        <span className={`fi fi-${project.country_code.toLowerCase()}`} style={{ fontSize: '1rem', marginLeft: '0.125rem' }} />
                      )}
                    </span>
                  )}
                  {project.founded_year && (
                    <span style={{ fontSize: '0.875rem', color: COLORS.muted }}>Est. {project.founded_year}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bitcoin acceptance pills */}
            {(project.bitcoin_acceptance.onchain || project.bitcoin_acceptance.lightning || project.bitcoin_acceptance.gift_cards) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {project.bitcoin_acceptance.onchain && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#374151', padding: '0.375rem 0.75rem', border: `1px solid ${COLORS.border}`, borderRadius: 999, background: COLORS.surface }}>
                    <BitcoinSymbol size={14} />
                    Onchain
                  </span>
                )}
                {project.bitcoin_acceptance.lightning && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#374151', padding: '0.375rem 0.75rem', border: `1px solid ${COLORS.border}`, borderRadius: 999, background: COLORS.surface }}>
                    <Zap size={14} strokeWidth={1.75} />
                    Lightning
                  </span>
                )}
                {project.bitcoin_acceptance.gift_cards && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#374151', padding: '0.375rem 0.75rem', border: `1px solid ${COLORS.border}`, borderRadius: 999, background: COLORS.surface }}>
                    <Gift size={14} strokeWidth={1.75} />
                    Gift Cards
                  </span>
                )}
              </div>
            )}

            {project.description && (
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: '#374151',
                  lineHeight: 1.75,
                  margin: '0 0 2rem',
                  maxWidth: '48rem',
                  letterSpacing: '0.01em',
                }}
              >
                {project.description}
              </p>
            )}

            <div className="project-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.primary,
                    color: '#FFFFFF',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                    transition: 'background 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.primary; }}
                >
                  Visit Website
                  <ExternalLink size={15} strokeWidth={1.75} />
                </a>
              )}

              {project.email && (
                <a
                  href={`mailto:${project.email}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.surface,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.surface; e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  <Mail size={15} strokeWidth={1.75} />
                  Contact Team
                </a>
              )}

              {isOwner && (
                <Link
                  to={`/edit-project/${id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.surface,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.surface; }}
                >
                  <Pencil size={15} strokeWidth={1.75} />
                  Edit Project
                </Link>
              )}

              {hasOwner && !isOwner && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.verifiedBg,
                    color: COLORS.verified,
                    border: '1px solid #A7F3D0',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    cursor: 'default',
                  }}
                >
                  <ShieldCheck size={15} strokeWidth={1.75} />
                  Project Claimed
                </span>
              )}

              {isLoggedIn && user && !hasOwner && !isOwner && !claimStatus && (
                <button
                  type="button"
                  onClick={() => setShowClaimModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.surface,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    letterSpacing: '0.01em',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.surface; e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  <ShieldCheck size={15} strokeWidth={1.75} />
                  Claim this project
                </button>
              )}

              {claimStatus?.status === 'pending' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: '#FFFBEB',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <Clock size={15} strokeWidth={1.75} />
                  Claim pending review
                </span>
              )}

              {claimStatus?.status === 'approved' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.verifiedBg,
                    color: COLORS.verified,
                    border: '1px solid #A7F3D0',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle2 size={15} strokeWidth={1.75} />
                  Claim approved
                </span>
              )}

              {claimStatus?.status === 'rejected' && (
                <button
                  type="button"
                  onClick={() => setShowClaimModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6875rem 1.25rem',
                    background: COLORS.surface,
                    color: '#991B1B',
                    border: '1px solid #FECACA',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.surface; }}
                >
                  <XCircle size={15} strokeWidth={1.75} />
                  Claim rejected — reapply
                </button>
              )}
            </div>
          </header>

          <div className="project-layout">
            {/* Main column */}
            <div>
              {(project.categories.length > 0 || bitcoinMethods.length > 0) && (
                <section style={{ marginBottom: '3rem', paddingBottom: '3rem', borderBottom: `1px solid ${COLORS.border}` }}>
                  <SectionTitle>Key Focus Areas</SectionTitle>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {project.categories.map((cat, idx) => (
                      <span
                        key={`cat-${idx}`}
                        style={{
                          fontSize: '0.9375rem',
                          lineHeight: 1.4,
                          color: COLORS.text,
                          padding: '0.5rem 0.9375rem',
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 999,
                          background: COLORS.surface,
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    {bitcoinMethods.map((method, idx) => (
                      <span
                        key={`btc-${idx}`}
                        style={{
                          fontSize: '0.9375rem',
                          lineHeight: 1.4,
                          color: COLORS.muted,
                          padding: '0.5rem 0.9375rem',
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 999,
                          background: '#F9FAFB',
                        }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {(project.initiatives || project.impact || project.challenges) && (
                <section style={{ marginBottom: '3rem', paddingBottom: '3rem', borderBottom: `1px solid ${COLORS.border}` }}>
                  <SectionTitle>Initiatives & Impact</SectionTitle>
                  {project.initiatives && <EditorialBlock title="Core Initiatives" content={project.initiatives} />}
                  {project.impact && <EditorialBlock title="Impact & Achievements" content={project.impact} />}
                  {project.challenges && <EditorialBlock title="Current Challenges" content={project.challenges} />}
                </section>
              )}

              {project.founder && (project.founder.name || project.founder.twitter || project.founder.email) && (
                <section>
                  <SectionTitle>Founder</SectionTitle>
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      background: COLORS.surface,
                    }}
                  >
                    {project.founder.name && (
                      <p style={{ fontSize: '1.0625rem', fontWeight: 500, color: COLORS.text, margin: '0 0 0.5rem', lineHeight: 1.4 }}>
                        {project.founder.name}
                      </p>
                    )}
                    {project.founder.twitter && (
                      <a
                        href={project.founder.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.9375rem',
                          lineHeight: 1.4,
                          color: COLORS.muted,
                          textDecoration: 'none',
                        }}
                      >
                        <AtSign size={15} strokeWidth={1.75} />
                        @{project.founder.twitter.split('/').pop()?.replace('@', '').split('?')[0]}
                      </a>
                    )}
                    {project.founder.email && (
                      <a
                        href={`mailto:${project.founder.email}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.9375rem',
                          lineHeight: 1.4,
                          color: COLORS.muted,
                          textDecoration: 'none',
                          marginTop: project.founder.twitter ? '0.375rem' : 0,
                        }}
                      >
                        <Mail size={14} strokeWidth={1.75} />
                        {project.founder.email}
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="project-sidebar">
              {socialItems.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                  <SectionTitle>Connect</SectionTitle>
                  <div
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 10,
                      background: COLORS.surface,
                      overflow: 'hidden',
                    }}
                  >
                    {socialItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={idx}
                          href={item.href}
                          target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel={item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.875rem 1rem',
                            color: COLORS.text,
                            textDecoration: 'none',
                            fontSize: '0.9375rem',
                            lineHeight: 1.4,
                            borderBottom: idx < socialItems.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Icon size={16} strokeWidth={1.75} color={COLORS.muted} />
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                          {!item.href.startsWith('mailto:') && <ExternalLink size={13} strokeWidth={1.75} color="#D1D5DB" />}
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {project.tags && project.tags.length > 0 && (
                <section>
                  <SectionTitle>Tags</SectionTitle>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          fontWeight: 500,
                          color: COLORS.muted,
                          padding: '0.4375rem 0.75rem',
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 999,
                          background: COLORS.surface,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>

      {showClaimModal && (
        <ClaimProjectModal
          projectId={id!}
          projectName={project.name}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => {
            setShowClaimModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
