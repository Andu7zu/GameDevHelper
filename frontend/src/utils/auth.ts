export const getToken = () => localStorage.getItem('access_token');

export const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const handleTokenError = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  if (!token) {
    handleTokenError();
    throw new Error('No authentication token found');
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
      handleTokenError();
      throw new Error('Authentication failed');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      handleTokenError();
    }
    throw error;
  }
} 