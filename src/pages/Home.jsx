import { useState, useEffect, useCallback, useRef } from 'react';

import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'gh_coupon_token';

const COOLDOWN_MS = 48 * 60 * 60 * 1000;

export function useCoupon() {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenRef = useRef(null);

  const activate = useCallback(async (tokenParam) => {
    const res = await base44.functions.invoke('activateCoupon', {
      token: tokenParam || undefined,
    });

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
      .then(async (data) => {
        /*
         * لو الكوبون مستخدم بالفعل:
         * - أقل من 48 ساعة → يظل ممنوعًا
         * - بعد 48 ساعة → إنشاء كوبون جديد
         */
        if (data?.status === 'used' && data?.redeemed_at) {
          const redeemedTime = new Date(data.redeemed_at).getTime();
          const now = Date.now();

          const elapsed = now - redeemedTime;

          if (elapsed >= COOLDOWN_MS) {
            return activate(null);
          }
        }

        return data;
      })
      .catch(() => {
        // الكود غير موجود أو غير صالح → إنشاء كوبون جديد
        localStorage.removeItem(STORAGE_KEY);

        return activate(null).catch((e) => {
          setError(e?.message || 'error');
        });
      })
      .finally(() => setLoading(false));
  }, [activate]);

  const refresh = useCallback(() => {
    if (tokenRef.current) {
      return activate(tokenRef.current).catch(() => {});
    }
  }, [activate]);

  return {
    coupon,
    loading,
    error,
    token: tokenRef.current,
    refresh,
    activate,
  };
                                        }
