import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, HandHeart, LayoutGrid } from 'lucide-react';
import type { Project } from '../data/projects.types';
import { fetchAllApprovedProjects } from '../lib/projectsApi';
import ProjectsLoadError from '../components/ProjectsLoadError';
import ClaimProjectModal from '../components/ClaimProjectModal';
import VerifiedBadge from '../components/VerifiedBadge';
import { getProjectUrl } from '../utils/projectUrl';
import { useAuth } from '../contexts/AuthContext';
import markerPinIcon from '../assets/marker-pin.png';
import bitcoinIcon from '../assets/bitcoin-icon.png';
import lightningIcon from '../assets/lightning-icon.png';

type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'country';

function isUnclaimed(project: Project): boolean {
  return project.userId === null || project.userId === undefined;
}

export default function Directory() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [unclaimedOnly, setUnclaimedOnly] = useState(false);

  const [claimTarget, setClaimTarget] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allProjects = await fetchAllApprovedProjects({ force: retryKey > 0 });
      setProjects(allProjects);
    } catch (err) {
      console.error('Error fetching directory projects:', err);
      setError('Unable to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [retryKey]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    document.title = 'Directory - African Bitcoin Directory';
  }, []);

  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) {
      if (project.country_code) {
        map.set(project.country_code, project.country_name || project.country_code.toUpperCase());
      }
    }
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) {
      for (const cat of project.categories || []) {
        if (cat) set.add(cat);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = projects.filter((project) => {
      if (unclaimedOnly && !isUnclaimed(project)) return false;
      if (countryFilter !== 'all' && project.country_code !== countryFilter) return false;
      if (categoryFilter !== 'all' && !(project.categories || []).includes(categoryFilter)) return false;

      if (!query) return true;

      const haystack = [
        project.name,
        project.description,
        project.location,
        project.country_name,
        project.city,
        ...(project.categories || []),
        ...(project.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'country':
          return (a.country_name || '').localeCompare(b.country_name || '') || a.name.localeCompare(b.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [projects, searchQuery, countryFilter, categoryFilter, sortBy, unclaimedOnly]);

  const unclaimedCount = useMemo(
    () => projects.filter(isUnclaimed).length,
    [projects]
  );

  const handleClaimClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/directory' } } });
      return;
    }

    setClaimTarget(project);
  };

  if (loading) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p>Loading directory...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Link to={isLoggedIn ? '/dashboard' : '/'} style={{ color: '#FD5A47', textDecoration: 'none' }}>
            ← {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
          </Link>
          <ProjectsLoadError onRetry={() => setRetryKey((k) => k + 1)} />
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .directory-projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .directory-toolbar {
            grid-template-columns: 1fr 1fr !important;
          }
          .directory-search-wrap {
            grid-column: 1 / -1 !important;
          }
        }
        @media (max-width: 640px) {
          .directory-projects-grid {
            grid-template-columns: 1fr !important;
          }
          .directory-toolbar {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <main style={{ background: '#F5F5F5', minHeight: '100vh', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 1rem)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link
              to={isLoggedIn ? '/dashboard' : '/'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#FD5A47', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '1.5rem' }}
            >
              ← {isLoggedIn ? 'Back to Dashboard' : 'Back to Home'}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF3F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LayoutGrid size={24} strokeWidth={1.75} color="#FD5A47" aria-hidden />
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                Project Directory
              </h1>
            </div>

            <p style={{ fontSize: '1.0625rem', color: '#6B7280', margin: '0 0 0.5rem 0', maxWidth: 640, lineHeight: 1.6 }}>
              Browse every live project in the directory. Found yours? Claim ownership so you can manage your listing.
            </p>
            <p style={{ fontSize: '0.9375rem', color: '#9CA3AF', margin: 0 }}>
              {filteredProjects.length} of {projects.length} projects
              {unclaimedCount > 0 && ` · ${unclaimedCount} available to claim`}
            </p>
          </div>

          <div
            className="directory-toolbar"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="directory-search-wrap" style={{ position: 'relative' }}>
              <Search
                size={18}
                strokeWidth={1.75}
                color="#9CA3AF"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, category, tag..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  fontSize: '0.9375rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  background: '#F9FAFB',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              style={{ padding: '0.75rem 0.875rem', fontSize: '0.875rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}
            >
              <option value="all">All countries</option>
              {countries.map(({ code, name }) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.75rem 0.875rem', fontSize: '0.875rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ padding: '0.75rem 0.875rem', fontSize: '0.875rem', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer' }}
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="country">Country</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#374151',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={unclaimedOnly}
              onChange={(e) => setUnclaimedOnly(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#FD5A47', cursor: 'pointer' }}
            />
            <HandHeart size={16} strokeWidth={1.75} aria-hidden />
            Show unclaimed projects only
          </label>

          {filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', background: '#FFFFFF', borderRadius: '12px' }}>
              <p style={{ fontSize: '1.125rem', color: '#6B7280', margin: 0 }}>No projects match your filters.</p>
            </div>
          ) : (
            <div className="directory-projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
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
                  <Link
                    to={getProjectUrl(project)}
                    style={{ display: 'block', padding: '1.5rem', textDecoration: 'none', color: 'inherit', flex: 1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      {project.image && (
                        <img src={project.image} alt={project.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1F2937', margin: '0 0 0.5rem 0', wordBreak: 'break-word' }}>
                          {project.name}
                        </h3>
                        {project.verified && <VerifiedBadge />}
                      </div>
                    </div>

                    {project.categories && project.categories.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {project.categories.slice(0, 2).map((cat, idx) => (
                          <span key={idx} style={{ padding: '0.25rem 0.75rem', background: '#FEF3C7', color: '#92400E', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.description && (
                      <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                      {(project.location || project.country_name) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <img src={markerPinIcon} alt="" style={{ width: '14px', height: '14px' }} />
                          {project.location?.split(',')[0] || project.country_name}
                        </span>
                      )}
                      {project.bitcoin_acceptance.lightning && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <img src={lightningIcon} alt="" style={{ width: '14px', height: '14px' }} />
                          Lightning
                        </span>
                      )}
                      {project.bitcoin_acceptance.onchain && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <img src={bitcoinIcon} alt="" style={{ width: '14px', height: '14px' }} />
                          On-chain
                        </span>
                      )}
                    </div>
                  </Link>

                  {isUnclaimed(project) && (
                    <div style={{ padding: '0 1.5rem 1.25rem' }}>
                      <button
                        type="button"
                        onClick={(e) => handleClaimClick(e, project)}
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 1rem',
                          background: 'transparent',
                          color: '#DC2626',
                          border: '1.5px solid #DC2626',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#DC2626';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#DC2626';
                        }}
                      >
                        <HandHeart size={15} strokeWidth={1.75} aria-hidden />
                        Claim this project?
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {claimTarget && (
        <ClaimProjectModal
          projectId={claimTarget.id}
          projectName={claimTarget.name}
          onClose={() => setClaimTarget(null)}
          onSuccess={() => {
            setClaimTarget(null);
            setRetryKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}
