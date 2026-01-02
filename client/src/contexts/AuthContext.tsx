import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ FIX: Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send refresh token cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.accessToken) {
          localStorage.setItem('access_token', data.data.accessToken);
          setAccessToken(data.data.accessToken);
          return data.data.accessToken;
        }
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('access_token');

      if (token) {
        try {
          // Try to get user data with current token
          let response = await fetch(`${API_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          // If token expired (401), try to refresh it
          if (response.status === 401) {
            token = await refreshAccessToken();

            if (token) {
              // Retry with new token
              response = await fetch(`${API_URL}/api/users/me`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
            } else {
              throw new Error('Token refresh failed');
            }
          }

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setUser(data.data);
              setAccessToken(token);
            } else {
              throw new Error('Invalid user data');
            }
          } else {
            throw new Error('Failed to fetch user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
          setAccessToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw specific error from backend (handle both string and object)
        const errorMessage = typeof data.error === 'string'
          ? data.error
          : data.error?.message || 'Login failed';
        throw new Error(errorMessage);
      }

      localStorage.setItem('access_token', data.data.accessToken);
      setAccessToken(data.data.accessToken);

      if (data.data.user) {
        setUser(data.data.user);
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      setAccessToken(null);
      setUser(null);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw specific error from backend (handle both string and object)
        const errorMessage = typeof data.error === 'string'
          ? data.error
          : data.error?.message || 'Registration failed';
        throw new Error(errorMessage);
      }

      localStorage.setItem('access_token', data.data.accessToken);
      setAccessToken(data.data.accessToken);

      if (data.data.user) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!accessToken,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}