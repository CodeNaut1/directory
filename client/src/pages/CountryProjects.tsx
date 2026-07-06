import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectsData from '../data/projects.json';
import type { Project } from '../data/projects.types';
import { getProjectUrl } from '../utils/projectUrl';
import markerPinIcon from '../assets/marker-pin.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';
import VerifiedBadge from '../components/VerifiedBadge';

export default function CountryProjects() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [countryName, setCountryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!countryCode) {
      setLoading(false);
      return;
    }

    // Filter approved projects by country code
    const countryProjects = projectsData.projects.filter(
      (p) =>
        p.status === 'approved' &&
        p.country_code.toLowerCase() === countryCode.toLowerCase()
    );

    setProjects(countryProjects);

    // Get country name from first project
    if (countryProjects.length > 0) {
      setCountryName(countryProjects[0].country_name);
      document.title = `${countryProjects[0].country_name} Projects - African Bitcoin Directory`;
    } else {
      setCountryName(countryCode.toUpperCase());
      document.title = `${countryCode.toUpperCase()} Projects - African Bitcoin Directory`;
    }

    setLoading(false);
  }, [countryCode]);

  if (loading) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p>Loading projects...</p>
        </div>
      </main>
    );
  }

  if (projects.length === 0) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Link to="/" style={{ color: '#FD5A47', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
            No Projects Found
          </h1>
          <p style={{ fontSize: '1rem', color: '#6B7280' }}>
            There are currently no Bitcoin projects listed for {countryName || countryCode?.toUpperCase()}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        .project-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .project-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .project-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <Link to="/" style={{ color: '#FD5A47', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              ← Back to Home
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {countryCode && (
                <span
                  className={`fi fi-${countryCode.toLowerCase()}`}
                  style={{ fontSize: '3rem' }}
                ></span>
              )}
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                Bitcoin Projects in {countryName}
              </h1>
            </div>

            <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
            </p>
          </div>

          {/* Projects Grid */}
          <div className="project-grid">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={getProjectUrl(project)}
                className="project-card"
              >
                {/* Header with Logo and Title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: '0 0 0.5rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {project.name}
                    </h3>
                    {project.verified && <VerifiedBadge />}
                  </div>
                </div>

                {/* Categories */}
                {project.categories && project.categories.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {project.categories.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: '#FEF3C7',
                          color: '#92400E',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  lineHeight: 1.6,
                  margin: '0 0 1rem 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {project.description}
                </p>

                {/* Footer Meta */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #E5E7EB',
                  fontSize: '0.75rem',
                  color: '#9CA3AF'
                }}>
                  {project.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <img src={markerPinIcon} alt="Location" style={{ width: '14px', height: '14px' }} />
                      {project.location.split(',')[0]}
                    </span>
                  )}
                  {project.bitcoin_acceptance.lightning && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <img src={lightningIcon} alt="Lightning" style={{ width: '14px', height: '14px' }} />
                      Lightning
                    </span>
                  )}
                  {project.bitcoin_acceptance.onchain && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <img src={bitcoinIcon} alt="Bitcoin" style={{ width: '14px', height: '14px' }} />
                      On-chain
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Section */}
          <div style={{
            marginTop: '4rem',
            padding: '2rem',
            background: '#FFFFFF',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
              Know a Bitcoin Project in {countryName}?
            </h2>
            <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '1.5rem' }}>
              Help us expand the African Bitcoin ecosystem by submitting projects.
            </p>
            <Link
              to="/submit"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: '#FD5A47',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E04835'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FD5A47'; }}
            >
              Submit a Project
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}