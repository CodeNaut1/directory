import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import infographicQ1 from '../assets/infographic_q1_2025.png';
import infographicQ2 from '../assets/infographic_q2_2025.png';
import infographicQ3 from '../assets/infographic_q3_2025.png';
import infographicQ4 from '../assets/infographic_q4_2025.png';
import '../styles/global.css';

interface InfographicVersion {
  id: string;
  name: string;
  image: string;
}

export default function InfographicArchive() {
  useEffect(() => {
    document.title = 'Infographic Archives - Africa Bitcoin Directory';
  }, []);

  const infographics: InfographicVersion[] = [
    {
      id: 'q4-2025',
      name: 'Infographic Q4 2025',
      image: infographicQ4,
    },
    {
      id: 'q3-2025',
      name: 'Infographic Q3 2025',
      image: infographicQ3,
    },
    {
      id: 'q2-2025',
      name: 'Infographic Q2 2025',
      image: infographicQ2,
    },
    {
      id: 'q1-2025',
      name: 'Infographic Q1 2025',
      image: infographicQ1,
    },
  ];

  const handleViewImage = (image: string, name: string) => {
    // Open image in new tab
    window.open(image, '_blank');
  };

  const handleDownloadPDF = async (name: string, imageUrl: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const imgWidth = img.width;
      const imgHeight = img.height;

      const pixelsToMm = 25.4 / 96;
      const pdfWidth = imgWidth * pixelsToMm;
      const pdfHeight = imgHeight * pixelsToMm;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });
      pdf.addImage(imageUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting image to PDF:', error);
      alert(`Unable to convert ${name} to PDF. Please try again later.`);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFDFA',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          Infographic Archives
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
          }}
        >
          Explore our previous quarterly infographics
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1.5rem, 4vw, 2rem)',
          }}
          className="infographic-archive-grid"
        >
          <style>{`
            @media (max-width: 640px) {
              .infographic-archive-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
          {infographics.map((infographic) => (
            <div
              key={infographic.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Preview Image */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  overflow: 'hidden',
                  background: '#F9FAFB',
                  position: 'relative',
                }}
              >
                <img
                  src={infographic.image}
                  alt={infographic.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    margin: '0 0 1rem 0',
                  }}
                >
                  {infographic.name}
                </h3>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: 'auto',
                  }}
                >
                  <button
                    onClick={() => handleViewImage(infographic.image, infographic.name)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: '#FD5A47',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E04835';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FD5A47';
                    }}
                  >
                    View Image
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(infographic.name, infographic.image)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: '#FFFFFF',
                      color: '#FD5A47',
                      border: '1px solid #FD5A47',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
