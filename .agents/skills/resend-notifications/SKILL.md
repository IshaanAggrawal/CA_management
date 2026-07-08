---
name: resend-notifications
description: Standards and guidelines for sending automated emails using Resend.
---

# Resend Notifications Standards

When implementing email pushers or automated notifications, follow these standard practices:

1. **API Key Management:** Always use `process.env.RESEND_API_KEY`. The SDK should be initialized as `const resend = new Resend(process.env.RESEND_API_KEY);`.
2. **From Address:** Use a standard verified domain or `onboarding@resend.dev` for testing. e.g. `from: 'BVG Site <onboarding@resend.dev>'`.
3. **Error Handling:** Always wrap `resend.emails.send(...)` in a `try/catch` block. Check `error` in the destructured response (`const { data, error } = await resend.emails.send(...)`).
4. **HTML Templates:** Prefer sending clean, semantic HTML emails. If sending support receipts or automated alerts, include dynamic data (like `Ticket ID`, `Client Name`).
5. **Server Actions Only:** Resend should only be invoked from backend/server actions (`lib/actions/*`). Never import the Resend SDK into a Client Component (`"use client"`).
