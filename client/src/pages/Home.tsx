import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import homepageImage1 from '../assets/homepage_image1.png';
import homepageImage2 from '../assets/homepage_image2.png';
import businessesIcon from '../assets/businesses_icon.png';
import educationIcon from '../assets/education_icon.png';
import circularIcon from '../assets/circular-icon.png';
import minersIcon from '../assets/miners-icon.png';
import communitiesIcon from '../assets/communities_icon.png';
import verifiedIcon from '../assets/verified_icon.png';
import circularFocusIcon from '../assets/circularfocus_icon.png';
import communityIconOrange from '../assets/community_icon_orange.png';
import africaIcon from '../assets/africa_icon.png';

interface CategoryCounts {
  businesses: number;
  education: number;
  circularEconomy: number;
  miners: number;
  communities: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || '';

  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    businesses: 0,
    education: 0,
    circularEconomy: 0,
    miners: 0,
    communities: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      setLoadingCounts(true);

      try {
        // Try API first to get counts of published and verified projects
        if (API_URL) {
          try {
            // Fetch all published projects (API already filters by published=true)
            // We'll fetch with a high limit to get all projects, then filter for verified
            const response = await fetch(`${API_URL}/api/projects?page=1&limit=1000`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                // Filter for verified projects only (published is already filtered by API)
                const verifiedProjects = data.data.filter(
                  (project: any) => project.verified === true
                );

                const counts: CategoryCounts = {
                  businesses: 0,
                  education: 0,
                  circularEconomy: 0,
                  miners: 0,
                  communities: 0,
                };

                verifiedProjects.forEach((project: any) => {
                  const categoryName = (project.category?.name || '').toLowerCase();
                  const categorySlug = (project.category?.slug || '').toLowerCase();

                  if (categoryName.includes('business') || categorySlug.includes('business')) {
                    counts.businesses++;
                  } else if (categoryName.includes('education') || categorySlug.includes('education')) {
                    counts.education++;
                  } else if (categoryName.includes('circular') || categorySlug.includes('circular')) {
                    counts.circularEconomy++;
                  } else if (categoryName.includes('mining') || categoryName.includes('miner') || categorySlug.includes('mining') || categorySlug.includes('miner')) {
                    counts.miners++;
                  } else if (categoryName.includes('community') || categorySlug.includes('community')) {
                    counts.communities++;
                  }
                });

                setCategoryCounts(counts);
                setLoadingCounts(false);
                return;
              }
            }
          } catch (apiError) {
            console.warn('API request failed, falling back to local data:', apiError);
          }
        }
      } catch (apiError) {
        console.warn('API not available, falling back to local data:', apiError);
      }

      // Fallback to local data (NEW STRUCTURE)
      try {
        const module = await import('../data/projects.json');
        const data = module.default;

        if (data?.projects) {
          const counts: CategoryCounts = {
            businesses: 0,
            education: 0,
            circularEconomy: 0,
            miners: 0,
            communities: 0,
          };

          // Filter for active/published projects only in fallback
          const activeProjects = data.projects.filter((project: any) =>
            project.active !== false && project.status === 'approved'
          );

          activeProjects.forEach((project: any) => {
            // Categories is an array in new structure
            const categories = project.categories || [];
            const categoriesStr = categories.join(' ').toLowerCase();

            if (categoriesStr.includes('business')) counts.businesses++;
            else if (categoriesStr.includes('education')) counts.education++;
            else if (categoriesStr.includes('circular')) counts.circularEconomy++;
            else if (categoriesStr.includes('mining') || categoriesStr.includes('miner')) counts.miners++;
            else if (categoriesStr.includes('community')) counts.communities++;
          });

          setCategoryCounts(counts);
        }
      } catch (localError) {
        console.error('Error loading local data:', localError);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCategoryCounts();
  }, [API_URL]);

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
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
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
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          .why-essential-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <main className="app-main" style={{ background: '#FFFDFA', minHeight: '100vh' }}>
        <section
          style={{
            padding: '5rem 0 6rem',
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
                justifyContent: 'space-between',
                gap: '2rem',
                padding: '2rem 0',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h1
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    fontWeight: 700,
                    lineHeight: 1.2,
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
                  flex: 1,
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
            CATEGORIES
          </h2>
          <div
            className="categories-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0',
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            {[
              { icon: businessesIcon, label: 'Businesses', count: categoryCounts.businesses },
              { icon: educationIcon, label: 'Education', count: categoryCounts.education },
              { icon: circularIcon, label: 'Circular Economy', count: categoryCounts.circularEconomy },
              { icon: minersIcon, label: 'Miners', count: categoryCounts.miners },
              { icon: communitiesIcon, label: 'Communities', count: categoryCounts.communities },
            ].map((category) => (
              <div
                key={category.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'clamp(0.75rem, 2vw, 1rem)',
                }}
              >
                <img
                  src={category.icon}
                  alt={category.label}
                  style={{ width: 'clamp(32px, 4vw, 40px)', height: 'clamp(32px, 4vw, 40px)', objectFit: 'contain' }}
                />
                <p
                  style={{
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    fontWeight: 500,
                    color: '#1F2937',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {category.label}
                </p>
                <span
                  style={{
                    color: '#FD5A47',
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    fontWeight: 700,
                    padding: 'clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(237, 99, 0, 0.06)',
                    border: '1px solid rgba(237, 99, 0, 0.15)',
                    boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
                    minWidth: 'fit-content',
                  }}
                >
                  {loadingCounts ? '...' : category.count}
                </span>
              </div>
            ))}
          </div>
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
              List Your Project
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}