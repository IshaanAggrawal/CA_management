---
name: razorpay-integration
description: Standards and guidelines for integrating Razorpay payment links and subscriptions in this project.
---

# Razorpay Integration Standards

When implementing or modifying Razorpay logic in this project, follow these standards:

1. **Test Mode First:** Always assume we are operating in Test Mode unless explicitly told otherwise.
2. **Environment Variables:** Use `process.env.RAZORPAY_KEY_ID` and `process.env.RAZORPAY_KEY_SECRET`. Never hardcode keys in the source files.
3. **Payment Links (Invoices):** 
   - When generating an invoice payment link, use the `razorpay.paymentLink.create()` API.
   - Always store the returned `short_url` (the payment link) and `id` (the payment_link_id) in the Prisma database against the relevant entity (e.g., `Invoice`).
4. **Webhooks:**
   - Webhooks should be implemented at `/api/webhooks/razorpay`.
   - Always verify the webhook signature using `crypto.createHmac` and `process.env.RAZORPAY_WEBHOOK_SECRET`.
   - Update the database only after signature verification.
5. **Server Actions:** Keep the Razorpay instantiation (`new Razorpay({...})`) inside standard NextJS server actions (`lib/actions/razorpay-actions.ts`). Do not expose it to client components.
