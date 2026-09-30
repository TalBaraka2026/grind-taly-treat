import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'gh_coupon_token';

export function useCoupon() {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tokenRef = useRef(null);

  const activate = useCallback(async (tokenParam) => {
    const res = await base44.functions.invoke('activateCoupon', { token: tokenParam || undefined });
    const data = res.data;
    tokenRef.current = data.token;
    localStorage.setItem(STORAGE_KEY, data.token);
    setCoupon(data);
    setError(null);
    return data;
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const storedToken = localStorage.getItem(STORAGE_KEY);
    const initialToken = urlToken || storedToken || null;

    setLoading(true);
    activate(initialToken)
      .catch(() => {
        // stored/url token invalid or gone — fall back to creating a fresh coupon
        localStorage.removeItem(STORAGE_KEY);
        return activate(null).catch((e) => setError(e?.message || 'error'));
      })
      .finally(() => setLoading(false));
  }, [activate]);

  const refresh = useCallback(() => {
    if (tokenRef.current) return activate(tokenRef.current).catch(() => {});
  }, [activate]);

  return { coupon, loading, error, token: tokenRef.current, refresh, activate };
}