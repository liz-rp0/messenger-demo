# Messenger Delivery & Inventory Management App

A modern, full-stack delivery management system built with **Next.js 16**, **React 19**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. Features real-time case tracking, messenger management, inventory control, and comprehensive analytics dashboard.

## 🚀 Features

### Core Features

- **Authentication System** - Role-based access control (Admin, Manager, Messenger)
- **Case Management** - Create, track, and manage delivery cases with real-time status updates
- **Messenger Tracking** - Monitor messenger locations, efficiency, and case assignments
- **Inventory Management** - Track stock levels, service history, and inventory actions
- **Public Tracking** - Customers can track deliveries via public links without login
- **Analytics Dashboard** - Real-time metrics, revenue trends, and performance analytics
- **Responsive Design** - Mobile-first UI with Tailwind CSS v4 and Shadcn components

### Business Workflow

1. **PENDING** - Admin creates delivery case
2. **ACCEPTED** - Messenger accepts the job
3. **EN_ROUTE** - Messenger is traveling to location
4. **INSPECTING** - Messenger inspects the item/service
5. **PAID** - Payment received, case closed

## 📋 Tech Stack

 | Category | Technology |
 | ---------- | ------------ |
 | **Framework** | Next.js 16 (App Router) |
 | **Runtime** | React 19 |
 | **Language** | TypeScript 5 |
 | **Database** | PostgreSQL with Prisma ORM |
 | **Styling** | Tailwind CSS v4 + @tailwindcss/postcss |
 | **UI Components** | Shadcn/ui (Base UI Primitives) |
 | **Icons** | Lucide React |
 | **Tables** | TanStack React Table |
 | **Drag & Drop** | @dnd-kit |
 | **Charts** | Recharts |
 | **Validation** | Zod |
 | **Authentication** | JWT with jose |
 | **Toast Notifications** | Sonner |

## 🏗️ Project Structure

```text
messenger-demo/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── login/                    # Login page
│   │   ├── dashboard/                # Protected dashboard routes
│   │   │   ├── page.tsx             # Main dashboard
│   │   │   ├── inventory/            # Inventory management
│   │   │   ├── messenger/            # Messenger management
│   │   │   ├── analytics/            # Analytics dashboard
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── track/                    # Public tracking pages
│   │   │   ├── [orderId]/page.tsx   # Individual order tracking
│   │   │   └── page.tsx              # Tracking search
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── cases/                # Case CRUD operations
│   │   │   ├── inventory/            # Inventory endpoints
│   │   │   ├── analytics/            # Analytics data
│   │   │   ├── track/                # Public tracking API
│   │   │   └── admin_sayz/           # Custom admin endpoints
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles & theme tokens
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── case-card.tsx
│   │   │   ├── inventory-stock-table.tsx
│   │   │   ├── inventory-action-form.tsx
│   │   │   ├── quick-dispatch-form.tsx
│   │   │   ├── revenue-trends.tsx
│   │   │   ├── messenger-efficiency.tsx
│   │   │   └── notification-listener.tsx
│   │   ├── app-sidebar.tsx           # Sidebar navigation
│   │   ├── nav-main.tsx              # Main navigation
│   │   ├── login-form.tsx            # Login component
│   │   ├── data-table.tsx            # Reusable data table
│   │   └── site-header.tsx           # Header component
│   ├── hooks/
│   │   └── use-mobile.ts             # Mobile detection hook
│   ├── lib/
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── prisma.ts                 # Prisma client
│   │   ├── inventory.ts              # Inventory logic
│   │   └── utils.ts                  # Utility functions
│   └── proxy.ts                      # Proxy utilities
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Database seeding script
├── public/                            # Static assets
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── tailwind.config.ts                # Tailwind configuration
├── next.config.ts                    # Next.js configuration
└── components.json                    # Shadcn component registry
```

## 🧪 Test Credentials

 | Username | Password | Role | Purpose |
 | ---------- | ---------- | ------ | --------- |
 | admin_sayz | 1000 | ADMIN | Full system access |
 | admin | 3144 | MANAGER | Case & messenger management |
 | mass1 | 1111 | MESSENGER | View assigned cases |
 | mass2 | 1111 | MESSENGER | View assigned cases |

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd messenger-demo
```

1. **Install dependencies**

```bash
npm install
```

1. **Setup environment variables**

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/messenger_db
JWT_SECRET=your-secret-key-here
```

1. **Setup database**

```bash
npx prisma migrate dev
npx prisma db seed
```

1. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 📱 Pages & Routes

### Public Routes

- `/` - Home page
- `/login` - Authentication
- `/track` - Tracking search page
- `/track/[orderId]` - Individual order tracking page

### Protected Routes (Requires Login)

- `/dashboard` - Main dashboard (role-based content)
- `/dashboard/inventory` - Inventory management
- `/dashboard/messenger` - Messenger management
- `/dashboard/analytics` - Analytics & reports

## 🔌 API Endpoints

### Authentication

- `POST /api/auth` - User login

### Cases

- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/[id]` - Get case details
- `PATCH /api/cases/[id]` - Update case status

### Inventory

- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `PATCH /api/inventory` - Update inventory

### Analytics

- `GET /api/analytics` - Get analytics data

### Public Tracking

- `GET /api/track/[orderId]` - Get order tracking data (public)

### Admin

- `GET /api/admin_sayz` - Admin operations
- `POST /api/admin_sayz` - Admin actions

## 🎨 Design System

### Color Tokens

- **Primary** - `oklch(0.205 0 0)` - Button highlights & emphasis
- **Background** - `oklch(1 0 0)` - Clean minimal background
- **Card** - `oklch(1 0 0)` - Card containers
- **Border** - `oklch(0.922 0 0)` - Subtle dividers

### Animations

- **fade-in** - Smooth page transitions
- **slide-up** - Element entrance effects
- **progress-pulse** - Status indicator animations

## 📦 Component Library

The app uses **Shadcn/ui** with **Base UI** primitives, providing:

- Accessible, unstyled components
- Full TypeScript support
- Customizable through Tailwind CSS
- Complete set of UI primitives

Key components:

- Button, Input, Textarea, Label
- Card, Dialog, Drawer, Modal
- Table, Pagination, Sidebar
- Select, Combobox, Popover
- Tabs, Accordion, Calendar
- And 40+ more!

## 🔐 Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Secure password handling
- Public tracking with limited data exposure
- TypeScript strict mode for type safety

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy with one click

```bash
vercel deploy
```

### Environment Variables for Production

```env
DATABASE_URL=postgresql://...
JWT_SECRET=secure-random-string
NEXTAUTH_URL=https://yourdomain.com
```

## 📊 Database Schema

Key tables:

- **users** - User accounts with roles
- **cases** - Delivery cases with status tracking
- **messengers** - Messenger profiles & assignments
- **inventory** - Stock management
- **service_history** - Historical records

## 🎯 Roadmap

### Completed ✅

- Prisma ORM integration
- PostgreSQL CRUD operations
- JWT authentication with cookies
- Core dashboard functionality
- Inventory management
- Messenger tracking

### In Progress

- Image upload (receipts, photos)
- Advanced analytics dashboard
- Real-time notifications via WebSocket
- Mobile app companion

### Planned

- SMS notifications
- GPS real-time tracking
- Payment integration
- Multi-language support

## 🐛 Known Issues

None currently reported.

## 📝 Documentation Files

- `DESIGN.md` - Design system specifications
- `GEMINI.md` - AI assistant guidelines & rules
- `history.md` - Detailed implementation history

## 🤝 Contributing

1. Create a feature branch
1. Make your changes
1. Test thoroughly
1. Submit a pull request

## 📄 License

This project is private and confidential.

## 👨‍💻 Author

Developed with ❤️ for efficient delivery management.

---

**Last Updated:** June 2026  
**Version:** 0.1.0  
**Status:** Active Development
