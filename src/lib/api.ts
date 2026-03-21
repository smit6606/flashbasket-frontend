import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ 
    showSpinner: false, 
    trickleSpeed: 200,
    minimum: 0.3
});

const getApiUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (apiUrl) return apiUrl;

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname.includes('devtunnels.ms')) {
            // Auto-detect backend API URL for dev tunnels if env is missing
            return `https://${hostname.replace('-3000', '-5000')}/api`;
        }
    }

    return 'http://localhost:5000/api';
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
  if (!(init.body instanceof FormData) && init.method !== 'GET' && init.method !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: 'include',
    mode: 'cors',
  };

  NProgress.start();

  try {
    const response = await fetch(url, fetchOptions);

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
      const isLoginRequest = url.includes('/auth/login');
      
      if (response.status === 401 && typeof window !== 'undefined' && !isLoginRequest) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new CustomEvent('unauthorized-redirect', { 
              detail: { message: data.message } 
          }));
      }
      const error: any = new Error(data.message || data.error || 'Something went wrong');
      error.response = { data };
      throw error;
    }

    return data;
  } finally {
    NProgress.done();
  }
};

export const api = {
  get: (endpoint: string, params?: Record<string, any>) => apiFetch(endpoint, { method: 'GET', params }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint: string, body?: any) => apiFetch(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
