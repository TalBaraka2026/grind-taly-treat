import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

import {
  generateToken,
  computeEffectiveStatus,
  serializeCoupon,
} from "../../shared/couponUtils.ts";


// ============================================================
// إعدادات النظام
// ============================================================

const COUPON_VALIDITY_MS = 60 * 60 * 1000;       // الكوبون صالح ساعة
const IP_COOLDOWN_MS = 48 * 60 * 60 * 1000;       // كوبون واحد لكل IP كل 48 ساعة


// ============================================================
// الحصول على IP المستخدم
// ============================================================

function getClientIP(req: Request): string {
  // Base44 / Proxy
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    // إذا كان هناك أكثر من IP، نأخذ أول IP
    const firstIP = forwardedFor
      .split(",")[0]
      .trim();

    if (firstIP) {
      return firstIP;
    }
  }

  // بعض البروكسيات تستخدم هذا الهيدر
  const realIP = req.headers.get("x-real-ip");

  if (realIP && realIP.trim()) {
    return realIP.trim();
  }

  // في حالة عدم توفر IP
  return "unknown";
}


// ============================================================
// تنسيق وقت الانتظار للمستخدم
// ============================================================

function formatRemaining(ms: number): string {
  const totalMinutes = Math.ceil(ms / (60 * 1000));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  }

  return `${minutes} دقيقة`;
}


// ============================================================
// الوظيفة الرئيسية
// ============================================================

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));

    const token =
      typeof body.token === "string" && body.token.trim()
        ? body.token.trim()
        : null;


    // ========================================================
    // أولًا:
    // إذا تم إرسال Token موجود
    // نتحقق من الكوبون فقط
    // ========================================================

    if (token) {
      const matches =
        await base44.asServiceRole.entities.Coupon.filter({
          token,
        });

      if (!matches || matches.length === 0) {
        return Response.json(
          {
            error: "not_found",
            message: "الكوبون غير موجود",
          },
          {
            status: 404,
          }
        );
      }

      let coupon = matches[0];

      const now = Date.now();

      const effectiveStatus =
        computeEffectiveStatus(coupon, now);


      // تحديث حالة الكوبون إذا تغيرت
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


    // ========================================================
    // ثانيًا:
    // طلب إنشاء كوبون جديد
    // ========================================================

    const clientIP = getClientIP(req);

    const now = Date.now();


    // ========================================================
    // البحث عن الكوبونات السابقة لنفس IP
    // ========================================================

    let previousCoupons = [];

    if (clientIP !== "unknown") {
      previousCoupons =
        await base44.asServiceRole.entities.Coupon.filter({
          client_ip: clientIP,
        });
    }


    // ========================================================
    // تحديد آخر كوبون لهذا الـIP
    // ========================================================

    let latestCoupon = null;

    if (
      previousCoupons &&
      previousCoupons.length > 0
    ) {
      for (const coupon of previousCoupons) {

        if (!coupon.issued_at) {
          continue;
        }

        const issuedTime =
          new Date(coupon.issued_at).getTime();

        if (Number.isNaN(issuedTime)) {
          continue;
        }

        if (
          !latestCoupon ||
          issuedTime >
            new Date(latestCoupon.issued_at).getTime()
        ) {
          latestCoupon = coupon;
        }
      }
    }


    // ========================================================
    // التحقق من مرور 48 ساعة
    // ========================================================

    if (latestCoupon) {

      const lastIssuedTime =
        new Date(
          latestCoupon.issued_at
        ).getTime();

      const timePassed =
        now - lastIssuedTime;

      const remaining =
        IP_COOLDOWN_MS - timePassed;


      // ما زال داخل فترة الـ48 ساعة
      if (remaining > 0) {

        return Response.json(
          {
            error: "cooldown",
            message:
              "لقد حصل هذا الجهاز على كوبون بالفعل.",
            remaining_ms: remaining,
            remaining:
              formatRemaining(remaining),
            next_coupon_at:
              new Date(
                lastIssuedTime +
                  IP_COOLDOWN_MS
              ).toISOString(),
          },
          {
            status: 429,
          }
        );
      }
    }


    // ========================================================
    // إنشاء Token جديد
    // ========================================================

    let newToken = generateToken();


    // منع تكرار الكود
    for (
      let attempt = 0;
      attempt < 10;
      attempt++
    ) {

      const existing =
        await base44.asServiceRole.entities.Coupon.filter({
          token: newToken,
        });

      if (
        !existing ||
        existing.length === 0
      ) {
        break;
      }

      newToken = generateToken();
    }


    // ========================================================
    // صلاحية الكوبون ساعة واحدة
    // ========================================================

    const expiresAt =
      new Date(
        now + COUPON_VALIDITY_MS
      ).toISOString();


    // ========================================================
    // وقت إصدار الكوبون
    // ========================================================

    const issuedAt =
      new Date(now).toISOString();


    // ========================================================
    // إنشاء الكوبون
    // ========================================================

    const created =
      await base44.asServiceRole.entities.Coupon.create({

        token: newToken,

        discount_percent: 15,

        expires_at: expiresAt,

        status: "active",

        // بيانات الحماية الجديدة
        client_ip: clientIP,

        issued_at: issuedAt,
      });


    // ========================================================
    // إرجاع الكوبون
    // ========================================================

    return Response.json(
      serializeCoupon(created)
    );

  } catch (error) {

    console.error(
      "activateCoupon error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
