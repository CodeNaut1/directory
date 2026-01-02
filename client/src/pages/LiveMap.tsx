import { useEffect } from 'react';
import BitcoinLiveMap from '../components/BitcoinLiveMap';
import '../styles/livemap.css';

export default function LiveMap() {
  useEffect(() => {
    document.title = 'Live Map - African Bitcoiners Directory';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Hero Section */}
      {/* <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931A 100%)',
          color: 'white',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Bitcoin Africa Live Map
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
          Explore the growing Bitcoin ecosystem across Africa. Discover projects, communities, and
          innovations driving Bitcoin adoption on the continent.
        </p>
      </div> */}

      {/* Map Container */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0 0 4rem 0'
      }}>
        <BitcoinLiveMap
          width="100%"
          height="800px"
          lat={1.0}
          lng={30.0}
          zoom={3.5}
          pitch={45}
          bearing={0}
          style="light-v10"
          terrain="false"
          buildings="false"
          controls={false}
          locations={true}
        />
      </div>

      {/* Info Section */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem 4rem 2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>
            About This Map
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#4a5568' }}>
            This interactive map showcases Bitcoin projects, communities, businesses, and
            educational initiatives across Africa. Each marker represents an organization
            or project actively contributing to Bitcoin adoption and education on the
            continent. Click on any marker to learn more about the project and connect
            with the community.
          </p>
        </div>
      </div>
    </div>
  );
}