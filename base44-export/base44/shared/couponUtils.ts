export function generateToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `GH-${code}`;
}

export function computeEffectiveStatus(coupon, nowMs) {
  if (coupon.status === "active") {
    const expiresAtMs = new Date(coupon.expires_at).getTime();
    if (nowMs > expiresAtMs) {
      return "expired";
    }
  }
  return coupon.status;
}

export function serializeCoupon(coupon) {
  return {
    token: coupon.token,
    discount_percent: coupon.discount_percent,
    expires_at: coupon.expires_at,
    status: coupon.status,
    redeemed_at: coupon.redeemed_at || null,
  };
}