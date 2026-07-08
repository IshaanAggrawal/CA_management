# ProAudit CA - CA Firm Management System

A modern, comprehensive web application built for Chartered Accountants to manage their firm's operations, staff, clients, and billing seamlessly.

## Features

- **Staff Management:** Role-based access control (Admin/Staff), capacity tracking, and efficiency metrics.
- **Client Management:** Manage corporate and individual clients, track KYC status, and store GSTIN/PAN details.
- **Billing & Subscriptions:** Integrated with Razorpay for handling invoices and automated plan upgrades.
- **Onboarding:** Automated firm creation and secure invite links for new staff members.

## Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org)
- **Database:** PostgreSQL (via [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Payments:** [Razorpay](https://razorpay.com/)
- **Styling:** Tailwind CSS

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies.
3. Configure your environment variables in `.env`:
   - Clerk Keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
   - Database URL (`DATABASE_URL`, `DIRECT_URL`)
   - Razorpay Keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_APP_URL`)
4. Run `npx prisma db push` to sync the database schema.
5. Start the development server with `npm run dev`.
6. Open [http://localhost:3000](http://localhost:3000) in your browser.