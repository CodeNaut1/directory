import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import homepageImage1 from '../assets/homepage_image1.png';
import homepageImage2 from '../assets/homepage_image2.png';
import verifiedIcon from '../assets/verified_icon.png';
import circularFocusIcon from '../assets/circularfocus_icon.png';
import communityIconOrange from '../assets/community_icon_orange.png';
import africaIcon from '../assets/africa_icon.png';
import CountryCarousel from '../components/CountryCarousel';
import {
  FEATURED_CATEGORIES,
  countCategories,
  type CategoryCounts,
} from '../data/featuredCategories';

export default function HomePage() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    businesses: 0,
    education: 0,
    circularEconomy: 0,
    miners: 0,
    communities: 0,
    media: 0,
    hodl: 0,
    nonProfit: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [countsError, setCountsError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      setLoadingCounts(true);
      setCountsError(false);

      try {
        if (!API_URL) {
          throw new Error('API URL not configured');
        }

        let allProjects: any[] = [];
        let page = 1;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(`${API_URL}/api/projects?page=${page}&limit=${limit}`);
          if (!response.ok) {
            throw new Error('Failed to fetch projects');
          }

          const data = await response.json();
          if (data.success && data.data) {
            allProjects = [...allProjects, ...data.data];
            const total = data.meta?.total || 0;
            hasMore = allProjects.length < total;
            page++;
          } else {
            throw new Error('Invalid API response');
          }
        }

        const verifiedProjects = allProjects.filter((project: any) => project.verified === true);
        setCategoryCounts(countCategories(verifiedProjects));
      } catch (apiError) {
        console.error('Error loading category counts:', apiError);
        setCountsError(true);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCategoryCounts();
  }, [API_URL, retryKey]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Navigate to search results page with query parameter
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            min-height: auto !important;
          }
          .hero-image-left,
          .hero-image-right {
            display: none !important;
          }
          .categories-grid {
            overflow-x: auto !important;
            justify-content: flex-start !important;
            gap: 1.25rem !important;
            padding-bottom: 0.5rem !important;
            -webkit-overflow-scrolling: touch;
          }
          .category-item {
            flex: 0 0 auto !important;
            min-width: 88px !important;
          }
          .why-essential-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 640px) {
          .search-form > div {
            flex-direction: column !important;
          }
          .search-input {
            width: 100% !important;
          }
          .search-button {
            width: 100% !important;
            justify-content: center !important;
          }
          .categories-grid {
            gap: 1rem !important;
          }
          .category-item {
            min-width: 76px !important;
          }
          .category-item p {
            font-size: 0.875rem !important;
          }
          .why-essential-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <main className="app-main" style={{ background: '#FFFDFA', minHeight: '100vh' }}>
        <section
          style={{
            padding: '2rem 0 clamp(1rem, 3vw, 4rem) 0',
            maxWidth: '100%',
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <div
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: '3rem',
              alignItems: 'stretch',
              marginBottom: '2rem',
              minHeight: '600px',
              maxWidth: 1400,
              marginLeft: 'auto',
              marginRight: 'auto',
              paddingLeft: 'clamp(1rem, 4vw, 2rem)',
              paddingRight: 'clamp(1rem, 4vw, 2rem)',
            }}
          >
            <div
              className="hero-image-left"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignSelf: 'stretch',
                marginLeft: '-2rem',
              }}
            >
              <img
                src={homepageImage1}
                alt="African Bitcoin Economy"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  filter: 'saturate(0.85)',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                gap: '1rem',
                paddingTop: 'clamp(1rem, 2vw, 3rem)',
                paddingBottom: 'clamp(1rem, 2vw, 3rem)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h1
                  style={{
                    fontFamily: '"Instrument Serif", Georgia, serif',
                    fontSize: 'clamp(3rem, 5vw, 4.6rem)',
                    fontWeight: 500,
                    lineHeight: 1,
                    color: '#1F2937',
                    margin: 0,
                  }}
                >
                  Connecting the African Bitcoin Economy
                </h1>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // flex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    color: '#4B5563',
                    lineHeight: 1.7,
                    maxWidth: '800px',
                    margin: 0,
                  }}
                >
                  Discover, support, and list the businesses and projects driving economic inclusion,
                  circularity, and innovation across the continent.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <Link
                  to="/how-it-works"
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: '#FD5A47',
                    border: '2px solid #FD5A47',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FD5A47';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#FD5A47';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="8" r="7" />
                    <path d="M8 4v4l3 3" strokeLinecap="round" />
                  </svg>
                  How It Works
                </Link>
                <Link
                  to="/infographic-q3-2026"
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: '#1F2937',
                    border: '2px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1F2937';
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#1F2937';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#1F2937';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  <BarChart3 size={16} strokeWidth={2} />
                  Q3 2026 Infographic
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <form onSubmit={handleSearch} className="search-form" style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      maxWidth: '100%',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Project Name, Country, Industry (e.g., Energy, Retail, Farming)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      style={{
                        flex: 1,
                        padding: '1rem 1.5rem',
                        fontSize: '1rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        background: '#FFFFFF',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#FD5A47';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(253, 90, 71, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="submit"
                      className="search-button"
                      style={{
                        padding: '1rem 2rem',
                        background: '#FD5A47',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s, transform 0.2s',
                        boxShadow: '0 4px 12px rgba(253, 90, 71, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f94833';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FD5A47';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 19L14.65 14.65"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div
              className="hero-image-right"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                alignSelf: 'stretch',
                marginRight: '-2rem',
              }}
            >
              <img
                src={homepageImage2}
                alt="African Bitcoin Economy"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  filter: 'saturate(0.85)',
                }}
              />
            </div>
          </div>
        </section>

        <CountryCarousel />

        <section
          style={{
            padding: '2rem clamp(1rem, 4vw, 1rem) 3rem',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#1F2937',
              marginBottom: '2rem',
            }}
          >
            Browse by Category
          </h2>
          <div
            className="categories-grid"
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
              maxWidth: 1200,
              margin: '0 auto',
              overflowX: 'auto',
              padding: '0.5rem 0',
            }}
          >
            {FEATURED_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.label}
                  className="category-item"
                  to={`/category/${category.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.625rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    flex: '1 1 0',
                    minWidth: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.75}
                      color="#4B5563"
                      aria-hidden
                    />
                  </div>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#1F2937',
                      margin: 0,
                      textAlign: 'center',
                      lineHeight: 1.35,
                    }}
                  >
                    {category.label}
                  </p>
                  <span
                    style={{
                      color: '#FD5A47',
                      fontSize: '1rem',
                      fontWeight: 700,
                      padding: '0.375rem 0.75rem',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(237, 99, 0, 0.06)',
                      border: '1px solid rgba(237, 99, 0, 0.15)',
                      boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
                      minWidth: 'fit-content',
                      flexShrink: 0,
                    }}
                  >
                    {loadingCounts ? '...' : countsError ? '—' : categoryCounts[category.key]}
                  </span>
                </Link>
              );
            })}
          </div>
          {countsError && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ color: '#6B7280', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                Unable to load projects. Please try again.
              </p>
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#FD5A47',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}
        </section>

        <section
          style={{
            padding: '4rem clamp(1rem, 4vw, 1rem)',
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: '#1F2937',
              marginBottom: '3rem',
            }}
          >
            Why This Directory is Essential
          </h2>
          <div
            className="why-essential-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            {[
              {
                icon: verifiedIcon,
                title: 'Live & Verified',
                desc: 'A continuously updated directory with projects authorized by our team for maximum credibility.',
              },
              {
                icon: circularFocusIcon,
                title: 'Circular Economy Focus',
                desc: 'Spotlight businesses and initiatives utilizing Bitcoin to create sustainable, closed-loop economic models.',
              },
              {
                icon: communityIconOrange,
                title: 'Community Driven',
                desc: 'Listings are submitted and maintained by the builders themselves, ensuring accuracy and relevance.',
              },
              {
                icon: africaIcon,
                title: 'Continental Reach',
                desc: 'The definitive map for finding where you can Spend and Build with Bitcoin across all of Africa.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(237, 99, 0, 0.06)',
                    border: '1px solid rgba(237, 99, 0, 0.15)',
                    boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    style={{
                      width: '20px',
                      height: '20px',
                      objectFit: 'contain',
                      filter:
                        'brightness(0) saturate(100%) invert(40%) sepia(93%) saturate(1352%) hue-rotate(340deg) brightness(99%) contrast(96%)',
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                    fontWeight: 700,
                    color: '#1F2937',
                    margin: 0,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                    color: '#4B5563',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 1rem)',
            background: '#FD5A47',
            marginTop: '4rem',
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              Are you a builder?
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                color: '#FFFFFF',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Join hundreds of other projects driving the African Bitcoin economy forward. Get listed today.
            </p>
            <Link
              to="/create-project"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'clamp(200px, 50vw, 268px)',
                height: '72px',
                background: '#FFFFFF',
                color: '#FD5A47',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '1.5rem',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
              }}
            >
              List or Update Your Project
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}