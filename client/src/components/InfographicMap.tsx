import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import projectsData from '../data/projects.json';
import coordinatesData from '../data/coordinates.json';
import type { Project, ProjectCoordinate, CountryRegion } from '../data/projects.types';

export default function InfographicMap() {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<any>(null);
  const [isRegionOverview, setIsRegionOverview] = useState(false);
  const navigate = useNavigate();

  // Extract data from imports (with type assertions for JSON compatibility)
  const projects = projectsData.projects as unknown as Project[];
  const projectCoordinates = coordinatesData.project_coordinates as unknown as ProjectCoordinate[];
  const countryRegions = coordinatesData.country_regions as unknown as CountryRegion[];

  // Group projects by country code
  const projectsByCountry = projects.reduce(
    (acc, project) => {
      const countryCode = project.country_code.toLowerCase();
      if (!acc[countryCode]) acc[countryCode] = [];
      acc[countryCode].push(project);
      return acc;
    },
    {} as Record<string, Project[]>
  );

  // Helper to find project by ID or name
  const findProjectById = (projId: string): Project | null => {
    return projects.find((p) => p.id === projId || p.slug === projId) || null;
  };

  const handleRegionClick = (countryCode: string, countryName: string) => {
    const countryProjects = projectsByCountry[countryCode] || [];

    if (countryProjects.length === 0) {
      console.log(`No projects found for ${countryName}`);
      return;
    }

    setPopupData({ countryName, projects: countryProjects });
    setIsRegionOverview(true);
    setActivePopup(`region-${countryCode}`);
  };

  const handleIndividualProjectClick = (projId: string) => {
    const project = findProjectById(projId);

    if (!project) {
      console.log(`Project not found: ${projId}`);
      return;
    }

    setPopupData(project);
    setIsRegionOverview(false);
    setActivePopup(`project-${project.id}`);
  };

  const handleProjectClick = (project: Project) => {
    setPopupData(project);
    setIsRegionOverview(false);
    setActivePopup(`project-${project.id}`);
  };

  const closePopup = () => {
    setActivePopup(null);
    setPopupData(null);
    setIsRegionOverview(false);
  };

  const gotoLiveMap = () => {
    navigate('/live-map');
  };

  const navigateToProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const createSocialLink = (type: string, url: string): string => {
    if (!url) return '';

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

  // Render country region SVG shapes
  const renderCountryShape = (region: CountryRegion, onClick: () => void) => {
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

  // Render individual project SVG shapes
  const renderProjectShape = (coord: ProjectCoordinate, idx: number) => {
    if (!coord.infographic) return null;

    const onClick = () => handleIndividualProjectClick(coord.proj_id);

    const baseProps = {
      onClick,
      style: { cursor: 'pointer' },
      className: 'image-mapper-shape',
      fill: 'rgba(0,0,0,0)',
    };

    if (coord.infographic.type === 'rect') {
      const [x, y, width, height] = coord.infographic.coords.split(',').map(Number);
      return (
        <g key={`${coord.proj_id}-${idx}`} {...baseProps}>
          <rect x={x} y={y} width={width} height={height} />
        </g>
      );
    }

    if (coord.infographic.type === 'polygon') {
      return (
        <g key={`${coord.proj_id}-${idx}`} {...baseProps}>
          <polygon points={coord.infographic.coords} />
        </g>
      );
    }

    if (coord.infographic.type === 'circle') {
      const [cx, cy, r] = coord.infographic.coords.split(',').map(Number);
      return (
        <g key={`${coord.proj_id}-${idx}`} {...baseProps}>
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
                  {popupData.projects.map((project: Project, idx: number) => (
                    <li key={idx} className="infograph-click">
                      <img
                        src={project.image || 'https://via.placeholder.com/40'}
                        alt={project.name}
                        className="project-logo"
                      />
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleProjectClick(project);
                        }}
                      >
                        {project.name}{' '}
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                      <br />
                      {project.description}
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
                        title={popupData.country_name}
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
                      popupData.website ? createSocialLink('website', popupData.website) : '',
                      popupData.social?.twitter ? createSocialLink('twitter', popupData.social.twitter) : '',
                      popupData.social?.linkedin ? createSocialLink('linkedin', popupData.social.linkedin) : '',
                      popupData.social?.instagram ? createSocialLink('instagram', popupData.social.instagram) : '',
                      popupData.social?.nostr ? createSocialLink('nostr', popupData.social.nostr) : '',
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
                    <p className="detail-value">{popupData.categories?.join(', ') || 'Unknown'}</p>
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
                  <p className="detail-value">{popupData.founder?.name || 'Not available'}</p>
                  {popupData.founder?.twitter && (
                    <a href={popupData.founder.twitter} target="_blank" rel="noopener">
                      @{popupData.founder.twitter.split('/').pop()}
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

                {/* View Full Project Button */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => navigateToProject(popupData.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: '#FD5A47',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E04835'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FD5A47'; }}
                  >
                    View Full Project Page →
                  </button>
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
            className="image-mapper-shape"
          />
        </g>

        {/* Render all country regions */}
        {countryRegions.map((region) =>
          renderCountryShape(region, () => handleRegionClick(region.code, region.name))
        )}

        {/* Render all individual project shapes */}
        {projectCoordinates.map((coord, idx) => renderProjectShape(coord, idx))}
      </svg>
    </>
  );
}