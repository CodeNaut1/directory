import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { fetchAllApprovedProjects } from '../lib/projectsApi';
import ProjectsLoadError from './ProjectsLoadError';

interface CountryEntry {
  code: string;
  name: string;
  isGlobal?: boolean;
}

function buildCountryList(projects: Array<{ status?: string; country_code?: string; country_name?: string }>): CountryEntry[] {
  const map = new Map<string, string>();

  for (const project of projects) {
    if (project.status !== 'approved') continue;
    const code = (project.country_code || '').toLowerCase().trim();
    if (!code) continue;

    const name = code === 'xx' ? 'Africa Wide' : (project.country_name || code.toUpperCase());
    if (!map.has(code)) {
      map.set(code, name);
    }
  }

  return Array.from(map.entries())
    .map(([code, name]) => ({
      code,
      name,
      isGlobal: code === 'xx',
    }))
    .sort((a, b) => {
      if (a.isGlobal) return 1;
      if (b.isGlobal) return -1;
      return a.name.localeCompare(b.name);
    });
}

export default function CountryCarousel() {
  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true);
      setError(false);

      try {
        const allProjects = await fetchAllApprovedProjects({ force: retryKey > 0 });
        setCountries(buildCountryList(allProjects));
      } catch (err) {
        console.error('Error loading countries:', err);
        setError(true);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, [retryKey]);

  const loopItems = countries.length > 0 ? [...countries, ...countries] : [];
  const duration = Math.max(countries.length * 2.8, 48);

  return (
    <>
      <style>{`
        .country-carousel-section {
          padding: 2rem 0 3rem;
          width: 100%;
        }

        .country-carousel-heading {
          text-align: center;
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #1F2937;
          margin: 0 0 2rem;
          padding: 0 clamp(1rem, 4vw, 2rem);
        }

        .country-marquee-fullbleed {
          width: 100vw;
          position: relative;
          left: 50%;
          margin-left: -50vw;
        }

        .country-marquee-viewport {
          overflow: hidden;
          width: 100%;
          container-type: inline-size;
          --flag-gap: 2rem;
          --flags-visible: 10;
          --flag-width: calc((100cqi - (var(--flags-visible) - 1) * var(--flag-gap)) / var(--flags-visible));
          padding: 3rem 0;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        .country-marquee-track {
          display: flex;
          width: max-content;
          gap: var(--flag-gap, 2rem);
          animation: country-marquee-scroll var(--marquee-duration, 60s) linear infinite;
          will-change: transform;
        }

        .country-marquee-track.paused {
          animation-play-state: paused;
        }

        @keyframes country-marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .country-flag-link {
          position: relative;
          flex-shrink: 0;
          display: block;
          text-decoration: none;
          border-radius: 0;
        }

        .country-flag-link:focus-visible {
          outline: 2px solid #374151;
          outline-offset: 4px;
        }

        .country-flag-rect {
          position: relative;
          width: var(--flag-width);
          aspect-ratio: 3 / 2;
          height: auto;
          border-radius: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
          transform-origin: center center;
        }

        .country-flag-link:hover {
          z-index: 20;
        }

        .country-flag-link:hover .country-flag-rect {
          transform: scale(1.18);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
        }

        .country-flag-rect .fi {
          width: 100%;
          height: 100%;
          font-size: var(--flag-width);
          line-height: 1;
          border-radius: 0;
          background-size: cover;
          display: block;
        }

        .country-flag-rect--globe {
          background: linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .country-flag-tooltip {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem 0.5rem;
          background: rgba(17, 24, 39, 0.78);
          color: #FFFFFF;
          font-size: clamp(0.6875rem, 1.2cqi, 0.8125rem);
          font-weight: 600;
          line-height: 1.25;
          text-align: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .country-flag-link:hover .country-flag-tooltip {
          opacity: 1;
        }

        .country-flag-rect--globe .country-flag-tooltip {
          background: rgba(17, 24, 39, 0.72);
        }

        @media (max-width: 767px) {
          .country-marquee-viewport {
            --flag-width: 72px;
            --flag-gap: 1.25rem;
          }

          .country-flag-rect--globe svg {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      <section className="country-carousel-section">
        <h2 className="country-carousel-heading">Browse by Country</h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.9375rem', padding: '0 1rem' }}>
            Loading countries...
          </p>
        ) : error ? (
          <ProjectsLoadError onRetry={() => setRetryKey((k) => k + 1)} />
        ) : countries.length === 0 ? null : (
          <div className="country-marquee-fullbleed">
            <div
              className="country-marquee-viewport"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className={`country-marquee-track${paused ? ' paused' : ''}`}
                style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
              >
                {loopItems.map((country, index) => (
                  <Link
                    key={`${country.code}-${index}`}
                    to={`/country/${country.code}`}
                    className="country-flag-link"
                    aria-label={country.name}
                  >
                    <div className={`country-flag-rect${country.isGlobal ? ' country-flag-rect--globe' : ''}`}>
                      {country.isGlobal ? (
                        <Globe size={36} strokeWidth={1.5} color="#374151" aria-hidden="true" />
                      ) : (
                        <span className={`fi fi-${country.code}`} aria-hidden="true" />
                      )}
                      <span className="country-flag-tooltip" role="tooltip">
                        {country.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
