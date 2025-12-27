import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || data.error || 'Registration failed');
      }

      const data = await response.json();

      if (data.data?.accessToken) {
        localStorage.setItem('access_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
      }

      navigate('/', { replace: true });
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
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
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

              <button type="submit" className="btn-primary" disabled={loading}>
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
  );
}


