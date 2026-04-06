import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Create Your Project',
      description: 'Fill in your Bitcoin project details — name, description, links, and category. It only takes a few minutes.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA6E41" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Submit for Review',
      description: 'Once your details look good, send your project to our team. We review every submission for quality and accuracy.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA6E41" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Get Approved',
      description: 'After approval, your project goes live on the Bitcoin directory for the world to discover and explore.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA6E41" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      number: '04',
      title: 'Update Anytime',
      description: 'Your project is always yours. Edit details, update links, or add new information whenever things change.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA6E41" strokeWidth="2">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      ),
    },
  ];

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  // FINAL SCREEN - Screen 5
  if (currentStep === steps.length) {
    return (
      <main style={{ background: '#F5EDE4', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'transparent',
              border: '3px solid #EA6E41',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EA6E41" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem' }}>
            You're all set.
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#6B7280', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Start building your Bitcoin project listing today.
          </p>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '0.75rem 1.75rem',
              background: '#EA6E41',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D95F35';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#EA6E41';
            }}
          >
            Get started
          </button>
        </div>
      </main>
    );
  }

  // STEPS 1-4
  const currentStepData = steps[currentStep];

  return (
    <main style={{ background: '#F5EDE4', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '0.375rem 1rem',
            background: '#F4DED1',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#EA6E41',
            marginBottom: '1.5rem',
            letterSpacing: '0.025em',
          }}
        >
          ₿ BITCOIN LIVE DIRECTORY
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem', margin: 0 }}>
          How it works
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#6B7280', margin: '0.75rem 0 0 0' }}>
          Four simple steps to list your project with the world.
        </p>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '450px' }}>
        {/* Background stacked cards */}
        {steps.map((_, index) => {
          if (index <= currentStep) return null;
          const offset = (index - currentStep) * 8;
          const rotation = (index - currentStep) * 2;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                background: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transform: `translateX(${offset}px) translateY(${offset}px) rotate(${rotation}deg)`,
                opacity: 0.6,
                zIndex: steps.length - index,
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* Current card */}
        <div
          style={{
            position: 'relative',
            zIndex: 100,
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '2rem 1.75rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: isAnimating ? 'translateX(-120%) rotate(-15deg)' : 'translateX(0) rotate(0deg)',
            opacity: isAnimating ? 0 : 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 1, 1)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#F4DED1',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#EA6E41',
                }}
              >
                ₿
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em' }}>
                STEP {currentStepData.number}
              </span>
            </div>

            <div
              style={{
                width: '48px',
                height: '48px',
                background: '#FEF5F1',
                border: '1px solid #FDE8E0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              {currentStepData.icon}
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem', margin: 0 }}>
              {currentStepData.title}
            </h2>

            <p style={{ fontSize: '0.9375rem', color: '#6B7280', lineHeight: 1.65, margin: '0.75rem 0 0 0' }}>
              {currentStepData.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              {steps.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: index === currentStep ? '#EA6E41' : '#D1D5DB',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#EA6E41',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#D95F35';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EA6E41';
              }}
            >
              Next
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4.5 9l3-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}