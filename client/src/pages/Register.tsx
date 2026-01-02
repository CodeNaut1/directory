import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms to continue');
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Register - African Bitcoin Directory";
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .auth-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .auth-hero {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .auth-hero-pill-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .auth-hero-pill {
            text-align: center !important;
          }
          .password-requirements {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section className="auth-page app-main">
        <div className="container">
          <div className="auth-layout">
            <div className="auth-hero">
              <p className="auth-hero-eyebrow">Join the directory</p>
              <h1 className="auth-hero-title">Create your account to manage your projects.</h1>
              <p className="auth-hero-subtitle">
                Sign up to list, update, and manage your Bitcoin-only projects. Help builders, donors, and
                communities discover what you&apos;re building across Africa.
              </p>

              <div className="auth-hero-pill-row">
                <span className="auth-hero-pill">Manage your projects</span>
                <span className="auth-hero-pill">Self-managed listings</span>
                <span className="auth-hero-pill">Connected to live map</span>
              </div>

              <div className="auth-hero-meta">
                <span>No tokens. No shitcoins.</span>
                <span>Just Bitcoin builders pushing the continent forward.</span>
              </div>
            </div>

            <div className="auth-card">
              <div className="auth-card-header-eyebrow">Create account</div>
              <h2 className="auth-card-title">Create your account</h2>
              <p className="auth-card-subtitle">
                Use an email you check often. We&apos;ll use it for verification and important
                updates about your projects.
              </p>

              {error && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#FEF3F2',
                    color: '#B42318',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                  }}
                >
                  {error}
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Full name</label>
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: '#667085',
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Requirements Checklist */}
                  {password && (
                    <div className="password-requirements" style={{ marginTop: '0.75rem', fontSize: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasMinLength ? '#16A34A' : '#667085' }}>
                        <span style={{ fontWeight: 600 }}>{hasMinLength ? '✓' : '○'}</span>
                        <span>8+ characters</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasUpperCase ? '#16A34A' : '#667085' }}>
                        <span style={{ fontWeight: 600 }}>{hasUpperCase ? '✓' : '○'}</span>
                        <span>Uppercase letter</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasLowerCase ? '#16A34A' : '#667085' }}>
                        <span style={{ fontWeight: 600 }}>{hasLowerCase ? '✓' : '○'}</span>
                        <span>Lowercase letter</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasNumber ? '#16A34A' : '#667085' }}>
                        <span style={{ fontWeight: 600 }}>{hasNumber ? '✓' : '○'}</span>
                        <span>Number</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasSpecialChar ? '#16A34A' : '#667085', gridColumn: 'span 2' }}>
                        <span style={{ fontWeight: 600 }}>{hasSpecialChar ? '✓' : '○'}</span>
                        <span>Special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="auth-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: '#667085',
                      }}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="3" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: passwordsMatch ? '#16A34A' : '#DC2626' }}>
                      <span style={{ fontWeight: 600 }}>{passwordsMatch ? '✓' : '✗'}</span>
                      <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                    </div>
                  )}
                </div>

                <div className="auth-terms">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="terms">
                    I agree to only list Bitcoin-only projects (no tokens, NFTs or multi-coin
                    exchanges) and agree to African Bitcoiners&apos; verification guidelines.
                  </label>
                </div>

                <button type="submit" className="btn-primary" disabled={loading || !isPasswordValid}>
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div className="auth-footer">
                <div>
                  Already have an account?{' '}
                  <Link to="/login">
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}