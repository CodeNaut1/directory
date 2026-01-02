import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import locationsData from '../data/locations.json';
import { countryRegions } from '../data/countryRegions';
import type { LocationFeature } from '../data/locations.types';

export default function InfographicMap() {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<any>(null);
  const [isRegionOverview, setIsRegionOverview] = useState(false);
  const navigate = useNavigate();

  // Group projects by country code
  const projectsByCountry = (locationsData.features as LocationFeature[]).reduce((acc, feature) => {
    const countryCode = feature.properties.country_code?.toLowerCase() || 'global';
    if (!acc[countryCode]) acc[countryCode] = [];
    acc[countryCode].push(feature);
    return acc;
  }, {} as Record<string, LocationFeature[]>);

  const handleRegionClick = (countryCode: string, countryName: string) => {
    const projects = projectsByCountry[countryCode] || [];

    if (projects.length === 0) {
      console.log(`No projects found for ${countryName}`);
      return;
    }

    setPopupData({ countryName, projects });
    setIsRegionOverview(true);
    setActivePopup(`region-${countryCode}`);
  };

  const handleProjectClick = (project: LocationFeature) => {
    setPopupData(project.properties);
    setIsRegionOverview(false);
    setActivePopup(`project-${project.properties.name}`);
  };

  const closePopup = () => {
    setActivePopup(null);
    setPopupData(null);
    setIsRegionOverview(false);
  };

  const gotoLiveMap = () => {
    navigate('/live-map');
  };

  const createSocialLink = (type: string, url: string): string => {
    const icons: Record<string, string> = {
      website: 'globe-vector.png',
      twitter: 'twitter-vector.png',
      linkedin: 'Linkedin-logo.svg',
      instagram: 'instagram1.svg',
      nostr: 'nostr-logo-purple-trasparent.svg',
    };
    const iconSrc = `https://bitcoiners.africa/wp-content/uploads/2025/04/${icons[type]}`;
    let displayText = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
    if (type === 'twitter' && url.includes('twitter.com')) {
      displayText = `@${url.split('/').pop()}`;
    }
    return `
      <div class="${type}">
        <a href="${url}" target="_blank" rel="noopener">
          <img src="${iconSrc}" alt="${type} icon"/>
          <p>${displayText}</p>
        </a>
      </div>
    `;
  };

  // Render SVG shape based on type
  const renderShape = (region: typeof countryRegions[0], onClick: () => void) => {
    const baseProps = {
      onClick,
      style: { cursor: 'pointer' },
      className: 'image-mapper-shape',
      fill: 'rgba(0,0,0,0)',
    };

    if (region.type === 'polygon') {
      return (
        <g key={region.code} {...baseProps}>
          <polygon points={region.coords} />
        </g>
      );
    }

    if (region.type === 'rect') {
      const [x, y, width, height] = region.coords.split(',').map(Number);
      return (
        <g key={region.code} {...baseProps}>
          <rect x={x} y={y} width={width} height={height} />
        </g>
      );
    }

    if (region.type === 'circle') {
      const [cx, cy, r] = region.coords.split(',').map(Number);
      return (
        <g key={region.code} {...baseProps}>
          <circle cx={cx} cy={cy} r={r} />
        </g>
      );
    }

    return null;
  };

  return (
    <>
      {/* Popup Overlay */}
      {activePopup && (
        <div
          className="bitcoin-livemap-popup-overlay"
          style={{ display: 'block' }}
          onClick={closePopup}
        />
      )}

      {/* Popup */}
      {activePopup && popupData && (
        <div className="bitcoin-livemap-popup" style={{ display: 'block' }}>
          <div className="popup-header-top">
            <h3 className="header-title">
              {isRegionOverview ? 'Region Overview' : 'Project Spotlight'}
            </h3>
            <span className="close-popup" onClick={closePopup}>
              ×
            </span>
          </div>

          <div className="popup-content-wrapper">
            {isRegionOverview ? (
              // Region Overview Popup
              <div className="popup-content">
                <h2>{popupData.countryName}</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {popupData.projects.map((project: LocationFeature, idx: number) => (
                    <li key={idx} className="infograph-click">
                      <img
                        src={project.properties.image || 'https://via.placeholder.com/40'}
                        alt={project.properties.name}
                      />
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleProjectClick(project);
                        }}
                      >
                        {project.properties.name}{' '}
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                      <br />
                      {project.properties.description}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              // Project Detail Popup
              <>
                <div className="popup-header">
                  <div className="project-title">
                    <img
                      src={popupData.image || 'https://via.placeholder.com/40'}
                      alt={popupData.name}
                      className="project-logo"
                    />
                    <h4 className="project-name">{popupData.name}</h4>
                    {popupData.country_code && popupData.country_code.length === 2 ? (
                      <span
                        className={`fi fi-${popupData.country_code.toLowerCase()} project-flag`}
                        title={popupData.location?.split(',').pop()?.trim()}
                      ></span>
                    ) : (
                      <span className="project-flag" title="Africa wide">
                        🌐
                      </span>
                    )}
                  </div>
                </div>

                <div className="project-description">
                  <p>{popupData.description || 'No description available'}</p>
                </div>

                <div
                  className="project-socials"
                  dangerouslySetInnerHTML={{
                    __html: [
                      popupData.link ? createSocialLink('website', popupData.link) : '',
                      popupData.twitter ? createSocialLink('twitter', popupData.twitter) : '',
                      popupData.linkedin ? createSocialLink('linkedin', popupData.linkedin) : '',
                      popupData.instagram
                        ? createSocialLink('instagram', popupData.instagram)
                        : '',
                      popupData.nostr ? createSocialLink('nostr', popupData.nostr) : '',
                    ]
                      .filter(Boolean)
                      .join(''),
                  }}
                />

                <div className="project-details">
                  <div className="detail-item city">
                    <p className="detail-label">
                      <img
                        src="https://bitcoiners.africa/wp-content/uploads/2025/04/location-icon.png"
                        alt="Location icon"
                      />
                      LOCATION
                    </p>
                    <p className="detail-value">{popupData.location || 'Unknown'}</p>
                  </div>
                  <div className="detail-item sector">
                    <p className="detail-label">
                      <img
                        src="https://bitcoiners.africa/wp-content/uploads/2025/04/puzzle-icon.png"
                        alt="Industry icon"
                      />
                      SECTOR
                    </p>
                    <p className="detail-value">{popupData.category || 'Unknown'}</p>
                  </div>
                </div>

                <div className="detail-item founder">
                  <p className="detail-label">
                    <img
                      src="https://bitcoiners.africa/wp-content/uploads/2025/04/user-icon.png"
                      alt="Founder icon"
                    />
                    FOUNDER INFORMATION
                  </p>
                  <p className="detail-value">{popupData.founder || 'Not available'}</p>
                  {popupData.founder_twitter && (
                    <a href={popupData.founder_twitter} target="_blank" rel="noopener">
                      @{popupData.founder_twitter.split('/').pop()}
                    </a>
                  )}
                </div>

                <div className="detail-item activity">
                  <p className="detail-label">
                    <img
                      src="https://bitcoiners.africa/wp-content/uploads/2025/04/activity-icon.png"
                      alt="Activity icon"
                    />
                    ACTIVITY STATUS
                  </p>
                  <p
                    className={`detail-value ${popupData.active === false ? 'status-inactive' : 'status-active'}`}
                  >
                    {popupData.active === false
                      ? 'Not active recently'
                      : 'Active in the Last 3 months'}{' '}
                    <i
                      className={
                        popupData.active === false ? 'fas fa-ban' : 'far fa-check-circle'
                      }
                    ></i>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SVG Map */}
      <svg
        style={{ width: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 5988 8331"
      >
        <image
          xlinkHref="https://bitcoiners.africa/wp-content/uploads/2025/10/African-Bitcoiners-The-Africa-Bitcoin-Ecosystem-Infographic-Q4-2025-FINAL-scaled.png"
          style={{ width: '5988px' }}
        />

        {/* LiveMap Button */}
        <g onClick={gotoLiveMap} style={{ cursor: 'pointer' }}>
          <rect
            x="5464.8319088319095"
            y="28.433048433048413"
            width="483.36182336182355"
            height="500.4216524216523"
            fill="rgba(0,0,0,0)"
          />
        </g>

        {/* Render all country regions */}
        {countryRegions.map((region) =>
          renderShape(region, () => handleRegionClick(region.code, region.name))
        )}
      </svg>
    </>
  );
}