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
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    businesses: 300,
    education: 400,
    circularEconomy: 220,
    miners: 257,
    communities: 603,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.features) {
            const counts: CategoryCounts = {
              businesses: 0,
              education: 0,
              circularEconomy: 0,
              miners: 0,
              communities: 0,
            };

            data.data.features.forEach((feature: any) => {
              const category = (feature.properties?.category || '').toLowerCase();
              if (category.includes('business')) counts.businesses++;
              else if (category.includes('education')) counts.education++;
              else if (category.includes('circular')) counts.circularEconomy++;
              else if (category.includes('mining') || category.includes('miner')) counts.miners++;
              else if (category.includes('community')) counts.communities++;
            });

            setCategoryCounts(counts);
          }
        }
      } catch (error) {
        console.error('Error fetching category counts:', error);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch('/api/locations');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.features) {
          const query = searchQuery.toLowerCase();
          const found = data.data.features.find((feature: any) => {
            const props = feature.properties || {};
            const name = (props.name || '').toLowerCase();
            const location = (props.location || '').toLowerCase();
            const category = (props.category || '').toLowerCase();
            const description = (props.description || '').toLowerCase();

            return (
              name.includes(query) ||
              location.includes(query) ||
              category.includes(query) ||
              description.includes(query)
            );
          });

          if (found) {
            const slug = found.properties.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            navigate(`/project/${slug}`);
          } else {
            console.log('No project found matching:', searchQuery);
          }
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  return (
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
            paddingLeft: '2rem',
            paddingRight: '2rem',
          }}
        >
          <div
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
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
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
                  fontSize: '1.125rem',
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
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

          {/* Right Images - Vertical Collage */}
          <div
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

      {/* Categories Section */}
      <section
        style={{
          padding: '2rem 1rem 3rem',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
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
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          {/* Businesses */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <img
              src={businessesIcon}
              alt="Businesses"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Businesses
            </p>
            <span
              style={{
                color: '#FD5A47',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(237, 99, 0, 0.06)',
                border: '1px solid rgba(237, 99, 0, 0.15)',
                boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
              }}
            >
              {categoryCounts.businesses}
            </span>
          </div>

          {/* Education */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <img
              src={educationIcon}
              alt="Education"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Education
            </p>
            <span
              style={{
                color: '#FD5A47',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(237, 99, 0, 0.06)',
                border: '1px solid rgba(237, 99, 0, 0.15)',
                boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
              }}
            >
              {categoryCounts.education}
            </span>
          </div>

          {/* Circular Economy */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <img
              src={circularIcon}
              alt="Circular Economy"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Circular Economy
            </p>
            <span
              style={{
                color: '#FD5A47',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(237, 99, 0, 0.06)',
                border: '1px solid rgba(237, 99, 0, 0.15)',
                boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
              }}
            >
              {categoryCounts.circularEconomy}
            </span>
          </div>

          {/* Miners */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <img
              src={minersIcon}
              alt="Miners"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Miners
            </p>
            <span
              style={{
                color: '#FD5A47',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(237, 99, 0, 0.06)',
                border: '1px solid rgba(237, 99, 0, 0.15)',
                boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
              }}
            >
              {categoryCounts.miners}
            </span>
          </div>

          {/* Communities */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <img
              src={communitiesIcon}
              alt="Communities"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Communities
            </p>
            <span
              style={{
                color: '#FD5A47',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(237, 99, 0, 0.06)',
                border: '1px solid rgba(237, 99, 0, 0.15)',
                boxShadow: '0 2px 8px rgba(237, 99, 0, 0.06)',
              }}
            >
              {categoryCounts.communities}
            </span>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '4rem 1rem',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '3rem',
          }}
        >
          Why This Directory is Essential
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <div
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
                src={verifiedIcon}
                alt="Live & Verified"
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  filter: 'brightness(0) saturate(100%) invert(40%) sepia(93%) saturate(1352%) hue-rotate(340deg) brightness(99%) contrast(96%)',
                }}
              />
            </div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Live & Verified
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#4B5563',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              A continuously updated directory with projects authorized by our team for maximum
              credibility.
            </p>
          </div>

          <div
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
                src={circularFocusIcon}
                alt="Circular Economy Focus"
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  filter: 'brightness(0) saturate(100%) invert(40%) sepia(93%) saturate(1352%) hue-rotate(340deg) brightness(99%) contrast(96%)',
                }}
              />
            </div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Circular Economy Focus
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#4B5563',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Spotlight businesses and initiatives utilizing Bitcoin to create sustainable,
              closed-loop economic models.
            </p>
          </div>

          <div
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
                src={communityIconOrange}
                alt="Community Driven"
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  filter: 'brightness(0) saturate(100%) invert(40%) sepia(93%) saturate(1352%) hue-rotate(340deg) brightness(99%) contrast(96%)',
                }}
              />
            </div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Community Driven
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#4B5563',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Listings are submitted and maintained by the builders themselves, ensuring accuracy
              and relevance.
            </p>
          </div>

          <div
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
                src={africaIcon}
                alt="Continental Reach"
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  filter: 'brightness(0) saturate(100%) invert(40%) sepia(93%) saturate(1352%) hue-rotate(340deg) brightness(99%) contrast(96%)',
                }}
              />
            </div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1F2937',
                margin: 0,
              }}
            >
              Continental Reach
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#4B5563',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              The definitive map for finding where you can Spend and Build with Bitcoin across all
              of Africa.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: '6rem 1rem',
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
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Are you a builder?
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              color: '#FFFFFF',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Join hundreds of other projects driving the African Bitcoin economy forward. Get listed
            today.
          </p>
          <Link
            to="/list-project"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '268px',
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
  );
}
