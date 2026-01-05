import { useNavigate } from 'react-router-dom';
import projectsData from '../data/projects.json';
import coordinatesData from '../data/coordinates.json';
import type { Project, ProjectCoordinate, CountryRegion } from '../data/projects.types';
import infographicImage from '../assets/African Bitcoin Ecosystem Infographic Q1 2026.png';

export default function InfographicMap() {
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

  // Navigate directly to first project in country
  const handleRegionClick = (countryCode: string) => {
    const countryProjects = projectsByCountry[countryCode] || [];

    if (countryProjects.length === 0) {
      console.log(`No projects found for country: ${countryCode}`);
      return;
    }

    // Navigate to first project in the country
    navigate(`/project/${countryProjects[0].id}`);
  };

  // Navigate directly to project page
  const handleIndividualProjectClick = (projId: string) => {
    const project = findProjectById(projId);

    if (!project) {
      console.log(`Project not found: ${projId}`);
      return;
    }

    navigate(`/project/${project.id}`);
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
    <svg
      style={{ width: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 7984 11680"
    >
      <image
        xlinkHref={infographicImage}
        style={{ width: '7984px' }}
      />

      {/* Render all country regions */}
      {countryRegions.map((region) =>
        renderCountryShape(region, () => handleRegionClick(region.code))
      )}

      {/* Render all individual project shapes */}
      {projectCoordinates.map((coord, idx) => renderProjectShape(coord, idx))}
    </svg>
  );
}