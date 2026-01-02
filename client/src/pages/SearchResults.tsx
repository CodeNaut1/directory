import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  verified?: boolean;
  category?: {
    name: string;
    slug: string;
  };
  country?: {
    name: string;
    code: string;
  };
  city?: string;
  tags?: Array<{ name: string; slug: string }>;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchProjects = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Try API first
        if (API_URL) {
          const response = await fetch(
            `${API_URL}/api/search?q=${encodeURIComponent(query)}&page=1&limit=50`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setProjects(data.data);
              setLoading(false);
              return;
            }
          }
        }

        // Fallback to local data
        const module = await import('../data/locations.json');
        const data = module.default;
        if (data?.features) {
          const searchQuery = query.toLowerCase();
          const matches = data.features.filter((feature: any) => {
            const props = feature.properties || {};
            const name = (props.name || '').toLowerCase();
            const location = (props.location || '').toLowerCase();
            const category = (props.category || '').toLowerCase();
            const description = (props.description || '').toLowerCase();

            return (
              name.includes(searchQuery) ||
              location.includes(searchQuery) ||
              category.includes(searchQuery) ||
              description.includes(searchQuery)
            );
          });

          const transformedProjects: Project[] = matches.map((feature: any) => {
            const props = feature.properties || {};
            const slug = props.name
              ? props.name
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')
              : `project-${feature.id || Math.random()}`;

            // Extract city and country from location string (format: "City, Country")
            let city = '';
            let countryName = '';
            if (props.location) {
              const locationParts = props.location.split(',').map((s: string) => s.trim());
              city = locationParts[0] || '';
              countryName = locationParts[1] || '';
            }

            return {
              id: feature.id || slug,
              name: props.name || 'Unnamed Project',
              slug,
              description: props.description,
              logo: props.image || props.logo, // Use 'image' from locations.json
              website: props.link || props.website, // Use 'link' from locations.json
              verified: props.verified || props.active === true || props.active === 'true',
              category: props.category
                ? {
                    name: props.category,
                    slug: props.category.toLowerCase().replace(/\s+/g, '-'),
                  }
                : undefined,
              country: props.country_code || countryName
                ? {
                    name: countryName || props.country || '',
                    code: props.country_code || '',
                  }
                : undefined,
              city: city || props.city,
              tags: [], // Tags not available in locations.json
            };
          });

          setProjects(transformedProjects);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error('Error searching:', err);
        setError('An error occurred while searching. Please try again.');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    searchProjects();
  }, [query, API_URL]);

  useEffect(() => {
    document.title = query ? `Search: ${query} - African Bitcoin Directory` : 'Search - African Bitcoin Directory';
  }, [query]);

  return (
    <main className="app-main" style={{ background: '#FFFDFA', minHeight: '100vh', padding: '4rem 1rem' }}>
      <style>{`
        @media (max-width: 768px) {
          .search-result-card {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .search-result-logo {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              color: '#FD5A47',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1rem',
              display: 'inline-block',
            }}
          >
            ← Back to Home
          </Link>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#1F2937',
              margin: '1rem 0 0.5rem 0',
            }}
          >
            Search Results
          </h1>
          {query && (
            <p style={{ fontSize: '1rem', color: '#6B7280', margin: 0 }}>
              {loading ? 'Searching...' : `Found ${projects.length} result${projects.length !== 1 ? 's' : ''} for "${query}"`}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: '#6B7280' }}>Searching...</p>
          </div>
        ) : error ? (
          <div
            style={{
              background: '#FEF3F2',
              color: '#B42318',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
            }}
          >
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontSize: '1.125rem', color: '#4B5563', marginBottom: '0.5rem' }}>
              No projects found
            </p>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
              Try searching with different keywords or browse our categories.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#FD5A47',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id || project.slug}`}
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
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="search-result-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  {project.logo && (
                    <img
                      src={project.logo}
                      alt={project.name}
                      className="search-result-logo"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h2
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: '#1F2937',
                          margin: 0,
                        }}
                      >
                        {project.name}
                      </h2>
                      {project.verified && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            background: '#10B981',
                            color: '#FFFFFF',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p
                        style={{
                          fontSize: '0.9375rem',
                          color: '#4B5563',
                          lineHeight: 1.6,
                          margin: '0 0 0.75rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                      {project.category && (
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#FEF3C7',
                            color: '#92400E',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          {project.category.name}
                        </span>
                      )}
                      {project.country && (
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: '#6B7280',
                          }}
                        >
                          📍 {project.city ? `${project.city}, ` : ''}
                          {project.country.name}
                        </span>
                      )}
                      {project.tags && project.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {project.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: '#F3F4F6',
                                color: '#1F2937',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

