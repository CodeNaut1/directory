import { useEffect } from 'react';
import InfographicMap from '../components/InfographicMap';
import '../styles/livemap.css';

export default function Infographic() {
  useEffect(() => {
    document.title = 'Infographic - Africa Bitcoin Directory';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDFA' }}>
      <div className="infographic-container">
        <InfographicMap />
      </div>
    </div>
  );
}
