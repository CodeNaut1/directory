import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import coordinatesData from '../data/coordinates.json';
import type { Project, ProjectCoordinate, CountryRegion } from '../data/projects.types';
import { buildProjectLookup, fetchAllApprovedProjects } from '../lib/projectsApi';
import ProjectsLoadError from './ProjectsLoadError';
import { getProjectUrl } from '../utils/projectUrl';
import infographicImage from '../assets/African Bitcoin Ecosystem Infographic Q3 2026.png';

export default function InfographicMap() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const projectCoordinates = coordinatesData.project_coordinates as unknown as ProjectCoordinate[];
  const countryRegions = coordinatesData.country_regions as unknown as CountryRegion[];

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllApprovedProjects({ force: retryKey > 0 });
      setProjects(data);
    } catch (err) {
      console.error('Error loading infographic projects:', err);
      setError('Unable to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [retryKey]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const projectLookup = useMemo(() => buildProjectLookup(projects), [projects]);

  const approvedProjectCoordinates = useMemo(() => {
    return projectCoordinates.filter((coord) => {
      const project = projectLookup.get(coord.proj_id);
      return project?.status === 'approved';
    });
  }, [projectCoordinates, projectLookup]);

  const handleRegionClick = (countryCode: string) => {
    navigate(`/country/${countryCode.toLowerCase()}`);
  };

  const handleIndividualProjectClick = (projId: string) => {
    const project = projectLookup.get(projId);
    if (!project) return;
    navigate(getProjectUrl(project));
  };

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

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280' }}>
        Loading infographic...
      </div>
    );
  }

  if (error) {
    return <ProjectsLoadError onRetry={() => setRetryKey((k) => k + 1)} />;
  }

  return (
    <svg
      style={{ width: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 5988 9192"
    >
      <image xlinkHref={infographicImage} style={{ width: '5988px' }} />

      {countryRegions.map((region) =>
        renderCountryShape(region, () => handleRegionClick(region.code))
      )}

      {approvedProjectCoordinates.map((coord, idx) => renderProjectShape(coord, idx))}
    </svg>
  );
}
