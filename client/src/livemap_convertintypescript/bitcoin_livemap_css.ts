/**
 * Live Map 3D Styles
 * Custom styling for the 3D map component with enhanced pointers and orange labels
 * Converted from CSS to TypeScript
 */

import { CSSProperties } from 'react';

/**
 * Base styles for the Bitcoin Live Map component
 */
export const bitcoinLivemapStyles = {
  /**
   * Container & Map styles
   */
  container: {
    position: 'relative' as const,
    margin: 0,
    overflow: 'hidden' as const,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    background: '#f8f9fa',
  } as CSSProperties,

  map: {
    width: '100%',
    height: '600px',
  } as CSSProperties,

  /**
   * Controls styles
   */
  controls: {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '8px',
    zIndex: 1000,
  } as CSSProperties,

  controlBtn: {
    padding: '10px',
    fontSize: '12px',
    fontWeight: 500,
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  } as CSSProperties,

  controlBtnHover: {
    background: '#fff',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  } as CSSProperties,

  /**
   * Popup Overlay styles
   */
  popupOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  } as CSSProperties,

  /**
   * Popup Box styles
   */
  popup: {
    position: 'fixed' as const,
    top: '60%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '75vh',
    overflowY: 'auto' as const,
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: "'Satoshi Variable', sans-serif",
    zIndex: 10000,
  } as CSSProperties,

  /**
   * Header styles
   */
  popupHeaderTop: {
    position: 'sticky' as const,
    top: 0,
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '18px 40px',
    background: '#FD5A47',
    color: '#fff',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    zIndex: 1,
  } as CSSProperties,

  headerTitle: {
    margin: 0,
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  } as CSSProperties,

  closePopup: {
    fontSize: '1.5rem',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  } as CSSProperties,

  /**
   * Content Wrapper styles
   */
  popupContentWrapper: {
    padding: '20px 30px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '20px',
  } as CSSProperties,

  /**
   * Project Title Row styles
   */
  projectTitle: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '10px',
    marginBottom: '20px',
  } as CSSProperties,

  projectLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  } as CSSProperties,

  projectName: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#344054',
    margin: 0,
  } as CSSProperties,

  projectFlag: {
    marginLeft: 'auto',
    width: '30px',
    height: '30px',
  } as CSSProperties,

  /**
   * Description styles
   */
  projectDescription: {
    margin: 0,
    fontSize: '0.95rem',
    lineHeight: 1.6,
    color: '#344054',
  } as CSSProperties,

  /**
   * Socials styles
   */
  projectSocials: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: '15px',
  } as CSSProperties,

  projectSocialsItem: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '8px',
    background: 'rgba(255, 197, 103, 0.1)',
    padding: '8px 12px',
    borderRadius: '6px',
  } as CSSProperties,

  projectSocialsIcon: {
    width: '16px',
    height: '16px',
  } as CSSProperties,

  projectSocialsText: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#B54708',
  } as CSSProperties,

  /**
   * Details Grid styles
   */
  projectDetails: {
    display: 'grid' as const,
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  } as CSSProperties,

  detailItem: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '4px',
  } as CSSProperties,

  detailLabel: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#344054',
  } as CSSProperties,

  detailLabelIcon: {
    width: '16px',
    height: '16px',
  } as CSSProperties,

  detailValue: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#344054',
    margin: 0,
  } as CSSProperties,

  detailLink: {
    fontSize: '0.85rem',
    color: '#FD5A47',
    textDecoration: 'none',
  } as CSSProperties,

  /**
   * Activity Badges styles
   */
  statusActive: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    background: '#ECFDF3',
    color: '#027A48',
  } as CSSProperties,

  statusInactive: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    background: '#FEF3F2',
    color: '#B42318',
  } as CSSProperties,

  /**
   * Mapbox Controls Group styles
   */
  mapboxCtrlGroup: {
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  } as CSSProperties,

  mapboxCtrlGroupButton: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
  } as CSSProperties,

  mapboxCtrlGroupButtonHover: {
    background: '#fff',
  } as CSSProperties,
} as const;

/**
 * Responsive styles for tablet (max-width: 768px)
 */
export const bitcoinLivemapStylesTablet = {
  map: {
    height: '400px',
  } as CSSProperties,

  controls: {
    position: 'static' as const,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    padding: '10px',
    gap: '6px',
  } as CSSProperties,

  controlBtn: {
    flex: 1,
    minWidth: '100px',
    fontSize: '11px',
    padding: '8px',
  } as CSSProperties,

  projectDetails: {
    gridTemplateColumns: '1fr',
  } as CSSProperties,

  popupContentWrapper: {
    padding: '15px 20px',
  } as CSSProperties,

  popupHeaderTop: {
    padding: '12px 20px',
  } as CSSProperties,
} as const;

/**
 * Responsive styles for mobile (max-width: 480px)
 */
export const bitcoinLivemapStylesMobile = {
  map: {
    height: '300px',
    borderRadius: '4px',
  } as CSSProperties,

  controlBtn: {
    fontSize: '10px',
    padding: '6px',
  } as CSSProperties,

  popupContentWrapper: {
    padding: '10px 15px',
  } as CSSProperties,

  popupHeaderTop: {
    fontSize: '0.9rem',
  } as CSSProperties,

  projectName: {
    fontSize: '1.5rem',
  } as CSSProperties,
} as const;

/**
 * CSS classes that need to be applied via className (for pseudo-selectors and complex selectors)
 * These should be added to a CSS file or styled-components
 */
export const bitcoinLivemapCSSClasses = `
/* Hide Mapbox logo, attribution & bottom-left controls */
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-logo,
.mapboxgl-ctrl-attrib-inner {
  display: none !important;
}

/* Hover states */
.bitcoin-livemap-control-btn:hover {
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.project-description p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #344054;
}

.project-socials img {
  width: 16px;
  height: 16px;
}

.project-socials p {
  margin: 0;
  font-size: 0.85rem;
  color: #B54708;
}

.detail-label img {
  width: 16px;
  height: 16px;
}

.mapboxgl-ctrl-group {
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.mapboxgl-ctrl-group > button {
  background: rgba(255, 255, 255, 0.95) !important;
  border: none !important;
}

.mapboxgl-ctrl-group > button:hover {
  background: #fff !important;
}

@media (max-width: 768px) {
  .bitcoin-livemap {
    height: 400px;
  }

  .bitcoin-livemap-controls {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 10px;
    gap: 6px;
  }

  .bitcoin-livemap-control-btn {
    flex: 1;
    min-width: 100px;
    font-size: 11px;
    padding: 8px;
  }

  .project-details {
    grid-template-columns: 1fr;
  }

  .popup-content-wrapper {
    padding: 15px 20px;
  }

  .popup-header-top {
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .bitcoin-livemap {
    height: 300px;
    border-radius: 4px;
  }

  .bitcoin-livemap-control-btn {
    font-size: 10px;
    padding: 6px;
  }

  .popup-content-wrapper {
    padding: 10px 15px;
  }

  .popup-header-top {
    font-size: 0.9rem;
  }

  .project-name {
    font-size: 1.5rem;
  }
}
`;

/**
 * Helper function to merge base styles with responsive styles
 */
export const getResponsiveStyles = (
  baseStyles: CSSProperties,
  tabletStyles?: CSSProperties,
  mobileStyles?: CSSProperties,
  isTablet?: boolean,
  isMobile?: boolean
): CSSProperties => {
  if (isMobile && mobileStyles) {
    return { ...baseStyles, ...tabletStyles, ...mobileStyles };
  }
  if (isTablet && tabletStyles) {
    return { ...baseStyles, ...tabletStyles };
  }
  return baseStyles;
};

/**
 * Type definitions for style keys
 */
export type BitcoinLivemapStyleKey = keyof typeof bitcoinLivemapStyles;

