import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const legacyBase44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: 'https://grind-taly-treat.base44.app',
  appBaseUrl,
});

const WORKER_URL =
  'https://grind-taly-coupons.talalbrkt1.workers.dev';

export const base44 = {
  ...legacyBase44,

  functions: {
    async invoke(name, body = {}) {
      const actionMap = {
        activateCoupon: 'activate',
        redeemCoupon: 'redeem',
      };

      const action = actionMap[name];

      if (!action) {
        return {
          data: null,
          error: new Error(`Unknown function: ${name}`),
        };
      }

      try {
        const response = await fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            ...body,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          return {
            data,
            error: new Error(data?.error || 'Request failed'),
          };
        }

        return {
          data,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error,
        };
      }
    },
  },
};
