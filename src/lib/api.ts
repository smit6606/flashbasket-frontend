const getApiUrl = () => {
    if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('devtunnels.ms')) {
        // If we're on a dev tunnel like xxxx-3000.inc1.devtunnels.ms
        // The backend is likely at xxxx-5000.inc1.devtunnels.ms
        return `https://${hostname.replace('-3000', '-5000')}/api`;
    }
    
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

type FetchOptions = RequestInit & {
  params?: Record<string, string | number>;
};

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { params, ...init } = options;
  
  let url = `${API_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  let data;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response', e);
      data = { message: 'Failed to parse server response' };
    }
  } else {
    const text = await response.text();
    data = { message: text || 'Empty or non-JSON response from server' };
  }

  if (!response.ok) {
    const error: any = new Error(data.message || data.error || 'Something went wrong');
    error.response = { data };
    throw error;
  }

  return data;
};

export const api = {
  get: (endpoint: string, params?: Record<string, any>) => apiFetch(endpoint, { method: 'GET', params }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint: string, body?: any) => apiFetch(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
