const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const isTokenNearingExpiry = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) - Date.now() < REFRESH_THRESHOLD;
  } catch {
    return true;
  }
};

export const handleTokenError = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  try {
    const response = await fetch('http://localhost:5000/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data.access_token;
  } catch (error) {
    handleTokenError();
    throw error;
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = getToken();
  
  if (!token) {
    handleTokenError();
    throw new Error('No authentication token found');
  }

  // Check if token needs refresh
  if (isTokenNearingExpiry(token)) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      handleTokenError();
      throw error;
    }
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      // Try to refresh token on 401
      try {
        token = await refreshAccessToken();
        // Retry the original request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        
        if (!retryResponse.ok) {
          throw new Error('Authentication failed');
        }
        
        return retryResponse;
      } catch (error) {
        handleTokenError();
        throw new Error('Authentication failed');
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      handleTokenError();
    }
    throw error;
  }
} 