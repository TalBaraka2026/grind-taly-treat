import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  generateToken,
  computeEffectiveStatus,
  serializeCoupon,
} from "../../shared/couponUtils.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));

    const token =
      typeof body.token === "string" && body.token.trim()
        ? body.token.trim()
        : null;

    if (token) {
      const matches =
        await base44.asServiceRole.entities.Coupon.filter({
          token,
        });

      if (!matches || matches.length === 0) {
        return Response.json(
          { error: "not_found" },
          { status: 404 }
        );
      }

      let coupon = matches[0];

      const now = Date.now();

      const effectiveStatus =
        computeEffectiveStatus(coupon, now);

      if (effectiveStatus !== coupon.status) {
        coupon =
          await base44.asServiceRole.entities.Coupon.update(
            coupon.id,
            {
              status: effectiveStatus,
            }
          );
      }

      return Response.json(
        serializeCoupon(coupon)
      );
    }

    // إنشاء كوبون جديد بصلاحية ساعة كاملة
    let newToken = generateToken();

    for (let attempt = 0; attempt < 5; attempt++) {
      const existing =
        await base44.asServiceRole.entities.Coupon.filter({
          token: newToken,
        });

      if (!existing || existing.length === 0) {
        break;
      }

      newToken = generateToken();
    }

    // صلاحية الكوبون: 60 دقيقة
    const expiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    ).toISOString();

    const created =
      await base44.asServiceRole.entities.Coupon.create({
        token: newToken,
        discount_percent: 15,
        expires_at: expiresAt,
        status: "active",
      });

    return Response.json(
      serializeCoupon(created)
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
                        }
