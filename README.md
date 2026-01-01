# RAMS Generation Platform

A comprehensive RAMS (Risk Assessment & Method Statement) generation platform for UK steel fabricators and construction contractors.

## Features

- 🔐 Multi-tenant organization system with role-based access control
- 📋 Structured RAMS builder with guided workflows
- 🏗️ Job/project management
- 📄 Professional DOCX export with branded templates
- 🔍 Knowledge base of previous RAMS for reuse
- ⚡ Fast, modern stack (Next.js + NestJS + PostgreSQL)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd polar-rocket
```

2. **Start the database**
```bash
docker-compose up -d
```

3. **Set up the backend**
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

4. **Set up the frontend**
```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Admin (Adminer): http://localhost:8080

## Project Structure

```
rams-platform/
├── frontend/          # Next.js 14 application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── backend/           # NestJS application
│   ├── src/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── rams/
│   │   └── main.ts
│   ├── prisma/
│   └── package.json
└── docker-compose.yml
```

## Tech Stack

**Frontend:**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- TanStack Query

**Backend:**
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Development

### Database Management

```bash
# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Documentation

- [Technical Specification](./RAMS_PLATFORM_SPECIFICATION.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [API Documentation](./backend/API.md) (coming soon)

## License

Proprietary - All rights reserved

## Support

For support, please contact the development team.
