# Dkart Store (`dkart.pk`) - Premium Pakistani E-Commerce Platform

A complete, modern, production-ready e-commerce platform built for **Dkart** (`dkart.pk`). Designed with a mobile-first, high-converting architecture inspired by the polish and user experience of top lifestyle brands like [Zero Lifestyle](https://zerolifestyle.co), tailored specifically for Pakistani online shoppers.

---

## 🎨 Official Brand Identity & Color System

- **Brand Name**: Dkart
- **Domain**: `dkart.pk`
- **Primary Brand Blue**: `#1927F4` (Primary conversion CTAs, Add to Cart, Buy Now, interactive elements)
- **Accent Orange**: `#FF9100` (Discount badges, flash sales, countdowns, special promotions)
- **Dark Gray / Charcoal**: `#414042` (Typography, headings, body text, secondary icons)
- **Backgrounds**: `#FFFFFF` & `#F8F9FB` (Clean, modern, trustworthy shopping canvas)

---

## 🏗️ Tech Stack & Architecture

- **Frontend (`client/`)**:
  - **Framework**: React.js 19 with Vite
  - **Styling**: Tailwind CSS v3 with Dkart Brand Theme System
  - **Icons**: Lucide React
  - **Routing**: React Router DOM (v7) with ScrollToTop
  - **State**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`, `ToastContext`) with localStorage persistence
  - **Deployment**: Configured for **Vercel** (`vercel.json` SPA rewrite rules)

- **Backend (`server/`)**:
  - **Runtime**: Node.js (ES Modules) + Express.js
  - **Database**: SQLite (`better-sqlite3`) with relational schema & WAL mode for high concurrency
  - **Authentication**: JSON Web Tokens (JWT) + Bcrypt password hashing
  - **Image Processing**: Multer file upload handling with format and size validation
  - **Deployment**: Configured for **Render** (`render.yaml` blueprint)

---

## ⚡ Key Features

### 1. Storefront & Customer Journey
- **Announcement Bar**: Nationwide delivery, Cash on Delivery reassurance, and free delivery thresholds.
- **Hero Section**: High-impact promotional carousel with value propositions, trust tags, and direct conversion buttons.
- **Shop by Category**: Responsive category cards with lifestyle imagery and instant filtering.
- **Product Catalog**: Multi-criteria filters (category, price range slider, in-stock only), responsive grid, and custom sort modes.
- **Mobile Filter Drawer**: Slide-out drawer built specifically for effortless one-handed smartphone filtering.
- **Product Detail Page (Conversion-Focused)**:
  - Multi-image zoom gallery & thumbnail selector.
  - Variant picker (colors, editions) with dynamic price calculation.
  - Sticky Mobile Add to Cart & Buy Now bottom bar.
  - Pakistani delivery calculators and trust badges.
  - Accordion tabs for description, key features, technical specs, delivery SLAs, and verified customer reviews.
  - Real customer review submission form with instant rating updates.
- **Slide-Over Cart Drawer & Dedicated Cart Page**:
  - Quantity controls, item removal, coupon application (`DKART10`, `WELCOME500`).
  - Free delivery progress meter (Free shipping on orders above Rs. 3,000).
- **Streamlined Pakistani Checkout**:
  - 1-Page fast checkout.
  - Pakistani Province dropdown (Punjab, Sindh, KPK, Balochistan, ICT, AJK, GB) and major city autocomplete.
  - **Cash on Delivery (COD)** default payment method + online payment simulation.
- **Order Confirmation & Tracking**:
  - Order ID generation (`DK-XXXXX`) and courier tracking (`TCS-XXXXXXX`).
  - Itemized receipt with delivery window estimation.
  - Public order tracking page with visual delivery timeline stepper.
  - Direct 1-click WhatsApp support button with order reference.
- **Customer Account**: Saved profile details and order history with live status pills.

### 2. Professional Admin Dashboard (`/admin`)
- **Executive Analytics**: Gross revenue in PKR, total orders, pending shipments, low-stock warnings.
- **Product Management**: Add, edit, delete products, manage prices, sale discounts, stock, badges, and image URLs.
- **Order Management**: Search orders by customer name, phone, or ID; update delivery statuses (`Pending` -> `Confirmed` -> `Processing` -> `Shipped` -> `Delivered`).
- **Stock & Inventory**: Live stock levels and quick inline quantity updater.
- **Homepage Banner Management**: Create, publish, or remove hero slides and promotional banners.

---

## 🔑 Default Credentials

### Administrator Account
- **Email**: `admin@dkart.pk`
- **Password**: `admin123`
- **Access**: Full admin dashboard at `/admin`

### Demo Customer Account
- **Email**: `customer@dkart.pk`
- **Password**: `customer123`

*(Note: The Login page also features 1-click demo buttons to automatically populate credentials for rapid testing).*

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Start Backend Server
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🌐 Production Deployment

### Frontend on Vercel
1. Connect your repository to [Vercel](https://vercel.com).
2. Set the Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://dkart-backend-api.onrender.com/api`).
5. Deploy! (Routing is handled automatically via `client/vercel.json`).

### Backend on Render
1. Create a new Web Service on [Render](https://render.com).
2. Set Root Directory to `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or `10000`)
   - `JWT_SECRET`: A secure random secret string
   - `CLIENT_URL`: Your frontend Vercel URL (e.g. `https://dkart.pk`)
6. Deploy!
