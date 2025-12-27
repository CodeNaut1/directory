/**
 * API utility functions for authenticated requests
 */

export async function authenticatedFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  return fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export async function getCurrentUser() {
  try {
    const response = await authenticatedFetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

