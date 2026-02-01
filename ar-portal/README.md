# AR Portal - Authorized Representative Portal

A comprehensive Next.js 14 application for managing medical device regulatory compliance, products, and documentation for Authorized Representatives in the EU.

## 🚀 Project Status

**Current Phase**: Phase D Complete ✅
**Next Phase**: Phase E - Product Module

### Completed Phases
- ✅ **Phase A**: Next.js 14 project initialization with TypeScript, Tailwind CSS, shadcn/ui
- ✅ **Phase B**: Database schema (Prisma) with 7 models, migrations, and seed data
- ✅ **Phase C**: Authentication (NextAuth.js v5) with role-based access control
- ✅ **Phase D**: UI foundation with 39+ components, forms, tables, and layouts

### Pending Phases
- 📋 **Phase E**: Product module (API + UI)
- 📋 **Phase F**: Document module (API + UI)
- 📋 **Phase G**: Dashboard and final polish

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI)
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table v8
- **Icons**: Lucide React

## 📁 Project Structure

```
ar-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes (login, register)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── page.tsx
│   │   │       ├── products/
│   │   │       ├── documents/
│   │   │       └── settings/
│   │   ├── api/               # API routes
│   │   │   └── auth/[...nextauth]/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/              # Login/Register forms
│   │   ├── forms/             # Reusable form components
│   │   ├── layout/            # Sidebar, Header, MainLayout
│   │   ├── tables/            # DataTable with sorting/filtering
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── auth/              # Authentication utilities
│   │   ├── validations/       # Zod schemas
│   │   ├── db.ts              # Prisma client
│   │   └── utils.ts
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Route protection
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── public/                    # Static assets
└── package.json
```

## 🗄️ Database Schema

### Core Models
- **User**: Authentication with role-based access (5 roles)
- **Manufacturer**: Customer organizations
- **Product**: Medical devices with EU classifications
- **Document**: Files with versioning support
- **DocumentVersion**: Document history tracking
- **Submission**: Regulatory submissions to authorities
- **AuditLog**: Complete activity audit trail

### User Roles
1. **ADMIN**: Full system access
2. **EC_REP_MANAGER**: Manage users, manufacturers, products, documents
3. **EC_REP_EXPERT**: Manage products and technical documentation
4. **EC_REP_ASSISTANT**: Support role with limited access
5. **CUSTOMER**: Manufacturer users (view-only)

## 🎨 UI Components Built

### Layout (3 components)
- `Sidebar`: Collapsible navigation with user menu
- `Header`: Breadcrumbs and page titles
- `MainLayout`: Main wrapper with authentication

### Forms (3 components)
- `FormField`: Reusable field wrapper with validation
- `ProductForm`: Complete product create/edit form
- `DocumentUploadForm`: File upload with validation

### Tables (6 components)
- `DataTable`: Generic sortable/filterable table
- `DataTablePagination`: Page controls
- `DataTableToolbar`: Search and filters
- `DataTableColumnHeader`: Sortable headers
- `DataTableFacetedFilter`: Multi-select filters
- `DataTableViewOptions`: Column visibility

### UI Utilities (6 components)
- `StatusBadge`: Colored status indicators
- `LoadingSpinner`: Loading states (3 variants)
- `EmptyState`: Empty data display
- `ErrorMessage`: Error handling (2 variants)
- `PageHeader`: Page title with actions
- `StatCard`: Dashboard metric cards

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ar-portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration:
# - DATABASE_URL (PostgreSQL connection string)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (http://localhost:3000 for dev)
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📚 Key Features Implemented

### Authentication
- ✅ Secure credential-based authentication
- ✅ Password hashing with bcryptjs
- ✅ JWT session management
- ✅ Role-based access control (RBAC)
- ✅ Protected routes with middleware
- ✅ Session utilities (requireAuth, requireRole, etc.)

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode ready (infrastructure in place)
- ✅ Accessible components (WCAG 2.1 AA)
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Smooth animations and transitions

### Developer Experience
- ✅ Full TypeScript coverage
- ✅ Type-safe forms with Zod validation
- ✅ Reusable component library
- ✅ Consistent code style (ESLint + Prettier)
- ✅ Hot reload in development
- ✅ Production-optimized builds

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ar_portal"

# NextAuth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Upcoming API Routes (Phase E)
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

## 🎯 Roadmap

### Phase E: Product Module (Next)
- [ ] Product CRUD API routes
- [ ] Product list page with DataTable
- [ ] Product detail page
- [ ] Product create/edit forms
- [ ] Search and advanced filtering
- [ ] Bulk operations
- [ ] Export functionality

### Phase F: Document Module
- [ ] Document upload/download API
- [ ] File storage (cloud integration)
- [ ] Document viewer
- [ ] Version control UI
- [ ] Document approval workflow
- [ ] Metadata management

### Phase G: Dashboard & Polish
- [ ] Dashboard with charts and metrics
- [ ] Recent activity feed
- [ ] Quick actions panel
- [ ] Advanced search
- [ ] Notification system
- [ ] User preferences
- [ ] Final responsive polish
- [ ] Performance optimization
- [ ] Comprehensive testing

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build test
npm run build
```

## 📝 Development Guidelines

### Component Creation
- Use TypeScript for all components
- Follow Next.js 14 conventions (use client/server components)
- Include JSDoc comments for complex logic
- Export types alongside components

### Styling
- Use Tailwind CSS utility classes
- Follow the design system (see PHASE_D_COMPLETION.md)
- Use CSS variables for theming
- Maintain consistent spacing (4px grid)

### Forms
- Use React Hook Form + Zod validation
- Create reusable validation schemas
- Include proper error messages
- Handle loading and disabled states

### API Routes
- Follow RESTful conventions
- Include proper error handling
- Return consistent response formats
- Add request validation

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure build passes (`npm run build`)
4. Submit a pull request

## 📄 License

[Your License Here]

## 📞 Support

For questions or issues, please contact [your-email@example.com]

---

**Last Updated**: 2026-02-01
**Version**: 0.1.0 (Phases A-D Complete)
**Status**: Ready for Phase E Development
