import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    document.title = "Login - African Bitcoin Directory";
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      setTimeout(() => {
        const isAdmin = user?.role === 'admin';
        const redirectPath = isAdmin ? '/admin' : (from === '/login' ? '/dashboard' : from);
        navigate(redirectPath, { replace: true });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
        }
      `}</style>

      <section className="auth-page app-main">
        <div className="container">
          <div className="auth-layout">
            <div className="auth-hero">
              <p className="auth-hero-eyebrow">Welcome back</p>
              <h1 className="auth-hero-title">Log in to manage your Bitcoin-only project.</h1>
              <p className="auth-hero-subtitle">
                Update your listing, keep your information live and verified, and help builders
                discover you across the African Bitcoin economy.
              </p>

              <div className="auth-hero-pill-row">
                <span className="auth-hero-pill">Live &amp; verified projects</span>
                <span className="auth-hero-pill">Bitcoin-only ecosystem</span>
                <span className="auth-hero-pill">Africa-wide reach</span>
              </div>

              <div className="auth-hero-meta">
                <span>Single account for directory + live map.</span>
                <span>Managed by African Bitcoiners, updated by you.</span>
              </div>
            </div>

            <div className="auth-card">
              <div className="auth-card-header-eyebrow">Sign in</div>
              <h2 className="auth-card-title">Log in to your project profile</h2>
              <p className="auth-card-subtitle">
                Use the email you registered your project with. No spam, no noise — just tools to
                manage your presence.
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
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@project.org"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label">Password</label>
                    <button type="button" className="auth-label-helper">
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>

              <div className="auth-footer">
                <div>
                  New to the directory?{' '}
                  <Link to="/register">
                    Create an account
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