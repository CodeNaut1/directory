import { useEffect, useState } from 'react';
import InfographicMap from '../components/InfographicMap';
import '../styles/livemap.css';

export default function Infographic() {
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    document.title = 'Infographic - Africa Bitcoin Directory';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDFA' }}>
      {/* Instruction Modal */}
      {showInstructions && (
        <div
          className="instruction-modal"
          style={{ display: 'flex' }}
          onClick={() => setShowInstructions(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>Tap a country on the map to see Bitcoin initiatives in that region.</p>
            <button
              className="got-it-btn"
              onClick={() => setShowInstructions(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Infographic Map */}
      <div className="infographic-container">
        <InfographicMap />
      </div>
    </div>
  );
}