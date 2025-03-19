export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
          },
        });
        
        if (refreshResponse.ok) {
          const { access_token } = await refreshResponse.json();
          localStorage.setItem('access_token', access_token);
          
          // Retry original request with new token
          return fetchWithAuth(url, options);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
    
    // Refresh failed, redirect to login
    window.location.href = '/login';
  }

  return response;
}