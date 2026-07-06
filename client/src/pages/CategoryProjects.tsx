import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import projectsData from '../data/projects.json';
import type { Project } from '../data/projects.types';
import markerPinIcon from '../assets/marker-pin.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';
import businessesIcon from '../assets/businesses_icon.png';
import educationIcon from '../assets/education_icon.png';
import circularIcon from '../assets/circular-icon.png';
import minersIcon from '../assets/miners-icon.png';
import communitiesIcon from '../assets/communities_icon.png';

const categoryIcons: Record<string, string> = {
  business: businessesIcon,
  education: educationIcon,
  circular: circularIcon,
  mining: minersIcon,
  community: communitiesIcon,
};

const categoryNames: Record<string, string> = {
  business: 'Businesses',
  education: 'Education',
  circular: 'Circular Economy',
  mining: 'Miners',
  community: 'Communities',
};

export default function CategoryProjects() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!categorySlug) {
        setError('Category is required');
        setLoading(false);
        return;
      }

      try {
        // Try API first - fetch all projects, filter client-side
        if (API_URL) {
          try {
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

            // Filter by category client-side
            const filtered = allProjects.filter((project: any) => {
              const categories = project.categories || [];
              const categoriesStr = categories.join(' ').toLowerCase();
              return categoriesStr.includes(categorySlug.toLowerCase());
            });

            setProjects(filtered);
            setLoading(false);
            return;
          } catch (apiError) {
            console.warn('API failed, using fallback');
          }
        }

        // Fallback to local JSON
        const filtered = projectsData.projects.filter((project: any) => {
          if (project.status !== 'approved') return false;
          const categories = project.categories || [];
          const categoriesStr = categories.join(' ').toLowerCase();
          return categoriesStr.includes(categorySlug.toLowerCase());
        });

        setProjects(filtered as Project[]);
      } catch (err) {
        console.error('Error fetching category projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [categorySlug, API_URL]);

  useEffect(() => {
    const categoryName = categoryNames[categorySlug || ''] || categorySlug;
    document.title = `${categoryName} - African Bitcoin Directory`;
  }, [categorySlug]);

  if (loading) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p>Loading projects...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1>Error</h1>
          <p>{error}</p>
          <Link to="/" style={{ color: '#FD5A47', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </main>
    );
  }

  const categoryName = categoryNames[categorySlug || ''] || categorySlug;
  const categoryIcon = categoryIcons[categorySlug || ''];

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .category-projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .category-projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#FD5A47', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '1.5rem' }}>
              ← Back to Home
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              {categoryIcon && (
                <img src={categoryIcon} alt={categoryName} style={{ width: '48px', height: '48px' }} />
              )}
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                {categoryName}
              </h1>
            </div>

            <p style={{ fontSize: '1.125rem', color: '#6B7280', margin: 0 }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontSize: '1.125rem', color: '#6B7280' }}>No projects found in this category.</p>
            </div>
          ) : (
            <div className="category-projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  style={{
                    display: 'block',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Logo & Title */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    {project.image && (
                      <img src={project.image} alt={project.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0', wordBreak: 'break-word' }}>
                        {project.name}
                      </h3>
                      {project.verified && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: '#D1FAE5', color: '#065F46', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                          Verified ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  {project.categories && project.categories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {project.categories.map((cat, idx) => (
                        <span key={idx} style={{ padding: '0.25rem 0.75rem', background: '#FEF3C7', color: '#92400E', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  {project.description && (
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
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
          )}

          {/* CTA */}
          <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>
              Have a project in this category?
            </h2>
            <Link to="/create-project" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#FD5A47', color: '#FFFFFF', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
              Submit Your Project
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}