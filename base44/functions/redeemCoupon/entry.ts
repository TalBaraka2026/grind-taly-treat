import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { computeEffectiveStatus, serializeCoupon } from "../../shared/couponUtils.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!token) {
      return Response.json({ error: "token_required" }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.Coupon.filter({ token });
    if (!matches || matches.length === 0) {
      return Response.json({ success: false, error: "not_found" }, { status: 404 });
    }
    let coupon = matches[0];
    const now = Date.now();
    const effectiveStatus = computeEffectiveStatus(coupon, now);

    if (effectiveStatus !== "active") {
      if (effectiveStatus !== coupon.status) {
        coupon = await base44.asServiceRole.entities.Coupon.update(coupon.id, { status: effectiveStatus });
      }
      return Response.json({ success: false, coupon: serializeCoupon(coupon) });
    }

    const redeemedAt = new Date().toISOString();
    coupon = await base44.asServiceRole.entities.Coupon.update(coupon.id, {
      status: "used",
      redeemed_at: redeemedAt,
    });
    return Response.json({ success: true, coupon: serializeCoupon(coupon) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}