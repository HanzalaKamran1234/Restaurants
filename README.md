# Ziyafat (ضیافت) - Premium Online Food Delivery Platform

Ziyafat is a luxury, modern, cinematic online restaurant and food delivery platform built specifically for the Pakistani market, with a focus on Karachi (starting with North Nazimabad). It combines a high-end visual aesthetic (deep red/dark theme, glassmorphic layout, micro-animations) with standard delivery checkout flows.

---

## 🏗️ Architecture Overview

The codebase is organized as a monorepo consisting of:
- **`backend/`**: Node.js & Express API server written in TypeScript, using Prisma ORM to interact with the database. Includes JWT authentication, coupon validation, automated loyalty point calculation, and mock Email/WhatsApp notification generators.
- **`frontend/`**: Next.js App Router (14+) utilizing Tailwind CSS, Lucide icons, and Framer Motion. Contains a bilingual interface (English/Urdu with Noto Nastaliq support), global state checkout, live order tracking, and an admin dashboard CMS.

---

## ⚡ Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, GSAP.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM.
- **Database**: SQLite (default zero-config local run) or PostgreSQL (configured for production Neon/Railway deployment).
- **Communication Channels**: WhatsApp Click-to-Chat payload architecture, mock HTML emails saved directly to disk on order changes.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Install Dependencies
Install all monorepo modules by running:
```bash
# In the root directory:
npm run install
# This will install packages inside both the backend and frontend folders.
```

### 3. Initialize Database
Create and seed the database using Prisma:
```bash
cd backend
npx prisma db push
npm run db:seed
```
This sets up a local SQLite database file `dev.db` and populates it with:
- Categories: Fast Food and Desi Khany.
- 11 initial signature menu items with descriptions, calories, and HD images.
- Admin credentials: `admin@ziyafat.com` / `admin123`
- Customer credentials: `hamza@gmail.com` / `customer123`

### 4. Running the Application
From the root directory, open two terminals:

**Terminal 1 (Backend Server)**:
```bash
npm run backend:dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
npm run frontend:dev
# Running on http://localhost:3000
```

---

## 📡 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create customer accounts.
- `POST /api/auth/login` - Authenticate and return JWT token.
- `GET /api/auth/profile` - Retrieve user profile and saved addresses (Guarded).

### Menu & Categories
- `GET /api/categories` - Fetch all food categories.
- `GET /api/menu` - Fetch menu items (supports query parameters: `category`, `search`, `spiceLevel`, `minPrice`, `maxPrice`, `sort`).
- `GET /api/menu/:id` - Fetch detailed description and reviews for a specific item.
- `POST /api/menu` - Create new menu item (Admin only).
- `PUT /api/menu/:id` - Update availability or price (Admin only).
- `DELETE /api/menu/:id` - Delete menu item (Admin only).

### Orders
- `POST /api/orders` - Place a guest or member order. Returns a structured `whatsappLink` and details.
- `GET /api/orders/:id` - Public status fetch for tracking.
- `GET /api/orders/user` - Fetch order history (Guarded).
- `PATCH /api/orders/:id/status` - Update timeline status (Admin only).

### Coupons & Offers
- `GET /api/coupons/validate` - Validates promo codes.
- `POST /api/coupons` - Create new promo discount code (Admin only).

---

## 💬 WhatsApp Integration & Emails

### WhatsApp Click-To-Chat
When a customer clicks checkout, the backend generates a structured text payload URL-encoded for WhatsApp Web and WhatsApp Mobile API. It formats:
- Order ID & Customer Name
- Delivery Address and Landmark
- Bulleted list of items and quantities
- Grand total billing breakdown
- Payment type selected

If the API fails to submit directly, the user is presented with a button on screen pointing to `https://wa.me/923001234567?text=<payload>` to submit manually.

### Mock HTML Emails
Since local SMTP is not configured, the backend writes rendered emails as static `.html` files under:
`backend/temp_emails/`
- Order placement: `order_<orderNum>_customer_confirm.html` and `order_<orderNum>_admin_alert.html`
- Kitchen status preparation: `order_<orderNum>_ready_status.html`
- Delivery: `order_<orderNum>_delivered_status.html`

Open these files in a browser to inspect the visual rendering of the luxury email branding.
