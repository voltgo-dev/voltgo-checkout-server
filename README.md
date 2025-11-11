# VoltGo Checkout Server (Vercel + Stripe)
جاهز للنشر خلال دقائق. هذا الخادم الخفيف ينشئ جلسات دفع Stripe Checkout ويستقبل Webhooks بأمان.

## ⚡ ماذا يوفر؟
- `POST /api/create-checkout-session` يعيد `sessionId` و/أو `url` لصفحة الدفع.
- `POST /api/webhook` يستقبل إشعارات Stripe ويؤكد الدفع.
- مثال توليد QR موقّع (اختياري): `POST /api/generate-signed-qr`.

> **هام**: ضع المفاتيح في إعدادات Vercel (Environment Variables) ولا تضعها في الكود.

---

## 🛠 الخطوات السريعة للنشر
1) أنشئ حساب/مشروع على **Vercel**.
2) ارفع هذا المجلد (كـ Git أو Zip).
3) في مشروع Vercel → Settings → Environment Variables أضف المتغيرات:
   - `STRIPE_SECRET_KEY` (sk_test_... أو sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` (من Dashboard → Developers → Webhooks)
   - `STRIPE_PUBLISHABLE_KEY` (pk_test_... لا يستخدم هنا، لكنه مفيد في الـ client)
   - `APP_BASE_URL` (رابط تطبيقك/موقعك مثل https://voltgo.app)
   - `QR_JWT_SECRET` (أي نص سري لتوقيع QR)
4) من Stripe Dashboard فعّل Webhook إلى:
   - `https://<YOUR-VERCEL-URL>/api/webhook`
5) اختبر بوضع Test Mode ببطاقة: 4242 4242 4242 4242

---

## 🔗 استخدامه من تطبيقك (Client)
أرسل طلب POST إلى `/api/create-checkout-session` مع JSON مثل:
```json
{
  "amount": 5,
  "description": "Phone charging - 30 min",
  "userId": "user_123",
  "storeId": "store_456"
}
```
سيعود لك:
```json
{ "sessionId": "cs_test_...", "url": "https://checkout.stripe.com/c/..." }
```
ثم في الواجهة:
```js
// الخيار 1: افتح رابط "url" مباشرة
window.location.href = url;

// أو الخيار 2: باستخدام Stripe.js
const stripe = Stripe("pk_test_..."); // المفتاح العلني
stripe.redirectToCheckout({ sessionId });
```

---

## 🧪 ملاحظات مهمة
- ملف `webhook.js` مُهيّأ لقراءة raw body كما يتطلب Stripe.
- إن أردت توسيع المنطق (حفظ DB/إشعارات) ضع الكود في الأماكن المشار لها بتعليقات.
