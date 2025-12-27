import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || data.error || 'Authentication failed');
      }

      const data = await response.json();

      if (data.data?.accessToken) {
        localStorage.setItem('access_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
      }

      navigate(from === '/login' ? '/' : from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page app-main">
      <div className="container">
        <div className="auth-layout">
          <div>
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
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
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
  );
}


