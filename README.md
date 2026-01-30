# AR Portal Prototype

A modern web application for managing authorized representatives, products, and document distributions in the pharmaceutical industry.

## Tech Stack

- **Next.js 14** - React framework with built-in routing and optimization
- **tRPC** - End-to-end type-safe APIs
- **Prisma** - Database ORM with migrations
- **PostgreSQL 16** - Relational database
- **NextAuth** - Authentication and authorization
- **shadcn/ui** - Accessible component library
- **Tailwind CSS** - Utility-first styling

## Prerequisites

- **Node.js** 18+ (with npm/pnpm)
- **PostgreSQL** 16
- **pnpm** package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ar-portal
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure your settings (database URL, NextAuth secret, etc.).

To generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Start PostgreSQL

Using Docker Compose:

```bash
docker-compose up -d
```

Or use your local PostgreSQL 16 instance.

### 5. Run Database Migrations

```bash
pnpm prisma migrate dev
```

### 6. Seed the Database (Optional)

```bash
pnpm prisma db seed
```

This creates demo users and sample data.

### 7. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding, use these credentials to test:

- **QBD Admin Account**
  - Email: `admin@qbdgroup.com`
  - Password: `admin123`

- **Customer Account**
  - Email: `john@acmemedical.com`
  - Password: `customer123`

## Project Structure

```
src/
  app/              # Next.js App Router pages and layouts
    api/            # API routes (tRPC, NextAuth)
    auth/           # Authentication pages
    dashboard/      # Dashboard pages
  components/       # Reusable React components
    ui/            # shadcn/ui components
  server/          # Server-side logic
    routers/       # tRPC routers
    db/            # Database utilities
  lib/             # Utility functions and helpers
  styles/          # Global styles
prisma/
  schema.prisma    # Database schema definition
```

## Features

- **Authentication & Authorization** - Role-based access control with NextAuth
- **Product Management** - Browse and manage product catalog
- **Document Distribution** - Upload, manage, and distribute documents
- **Dashboard** - Real-time analytics and monitoring
- **User Management** - Admin panel for user and role management
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prisma studio` - Open Prisma Studio (visual database editor)
- `pnpm prisma migrate dev` - Create and run migrations
- `pnpm prisma db seed` - Seed database with sample data

## License

Proprietary - QBD Group
