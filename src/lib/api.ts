const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  get: (endpoint: string, params?: Record<string, any>) => apiFetch(endpoint, { method: 'GET', params }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};
