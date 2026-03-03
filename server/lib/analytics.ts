import ReactGA from 'react-ga4';

const TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || '';

export const initGA = () => {
  if (TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.initialize(TRACKING_ID);
  }
};

export const logPageView = (path: string) => {
  if (TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};