import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// The proxy.ts middleware only redirects unauthenticated users on navigation
// (page load / refresh) — it never runs while an already-open SPA page sits
// idle. If the session cookie becomes invalid in the background (expiry,
// wifi drop/reconnect, etc.), the next API call gets a 401 but nothing
// otherwise sends the user to /login until they manually refresh. Catch
// that here so it happens automatically.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401 && typeof window !== 'undefined') {
      const url = err.config?.url ?? '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      const onAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthEndpoint && !onAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (data?.message) return data.message;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
