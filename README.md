# Glow & Smooth Laser Clinic

A production-ready full-stack beauty clinic management system built with Next.js 16, TypeScript, Prisma, and Tailwind CSS.

## Features

### Customer Website
- **Home Page** — R&R-style asymmetric hero, curated treatments, shop preview, promo banner
- **Services Page** — Category-grouped service cards with bilingual (EN/AR) support
- **Booking Page** — 3-step booking flow with sticky "Your Journey" sidebar
- **Shop Page** — Product grid with server-side pagination, sidebar filters, discount display
- **Product Detail** — Premium product showcase with quantity selector
- **Cart & Checkout** — Full e-commerce flow with discount calculations
- **Contact Page** — Philosophy section, contact form, environment gallery, commitment band

### Admin Dashboard
- **Dashboard** — Revenue stats, appointments, orders, low-stock alerts
- **Calendar** — Day/Week/Month views with drag-and-drop
- **Time Slots** — Bulk generate + individual slot management
- **Services** — Bilingual (EN/AR) service management with image upload
- **Service Categories** — Premium card grid with color coding
- **Products** — Inventory management with stock tracking
- **Product Categories** — Category management
- **Discounts** — Percentage-based discounts (all/category-specific)
- **Home Content** — Control promo banner, hero text, CTA content
- **Orders, Customers, Financials, Settings**

### Design System: Velvet Bloom
- **Colors**: Primary `#a42c82`, Secondary `#943e7e`, Surface `#fff7f9`
- **Fonts**: Playfair Display (headings) + Be Vietnam Pro (body)
- **Skills**: press-feedback, card-lift, img-zoom, arrow-slide, btn-press, btn-shimmer, Reveal scroll animations
- **Bilingual**: Full English + Arabic (RTL) support

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: SQLite (Prisma ORM)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **Fonts**: next/font (Playfair Display + Be Vietnam Pro)
- **Notifications**: Telegram Bot API
- **Image Upload**: Local + Cloudinary support

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- SQLite

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma db push

# Start development server
bun run dev
```

### Environment Variables

```env
DATABASE_URL=file:./db/custom.db
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci-cd.yml`):
1. **Lint** — ESLint + TypeScript type checking
2. **Build** — Next.js production build
3. **Deploy** — Auto-deploy to Vercel on `main` branch pushes

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Velvet Bloom design system
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # SPA router
├── components/
│   ├── admin/             # Admin dashboard pages
│   ├── customer/          # Customer-facing pages
│   ├── shared/            # Shared components (header, footer, etc.)
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities, discount logic, API client
├── store/                 # Zustand stores (nav, cart, auth, lang)
└── prisma/                # Database schema
```

## Default Admin Login

- Email: `admin@glowsmooth.clinic`
- Password: `admin123`

## License

MIT
