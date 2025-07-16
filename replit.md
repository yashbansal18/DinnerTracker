# Second Helpings - Dinner Event Manager

## Overview

Second Helpings is a full-stack web application designed to help users manage dinner events by tracking guests, dishes, and meal history. The application prevents serving the same dish to guests repeatedly and provides intelligent recommendations based on dietary preferences and past meals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Uploads**: Multer for handling image uploads

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation pattern for mobile UX
- Maximum width container (max-w-md) for mobile-centric layout

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on login
- **Security**: HTTP-only cookies with secure flags in production

### Data Models
- **Users**: Profile information (email, name, profile image)
- **Guests**: Contact info, dietary restrictions, tags, favorite categories
- **Dishes**: Recipes with ingredients, instructions, categories, and images
- **Events**: Dinner events linking guests and dishes
- **Relationships**: Many-to-many relationships between events-guests and events-dishes
- **Favorites**: Guest dish preferences tracking

### Core Features
- **Guest Management**: Add, edit, and track guest dietary preferences
- **Dish Library**: Store recipes with images, ingredients, and categorization
- **Event Planning**: Create events and assign guests and dishes
- **Repeat Detection**: Alert system to prevent serving same dishes to guests
- **Search & Filter**: Cross-entity search functionality
- **Meal History**: Track what dishes were served to which guests when

### File Management
- **Image Uploads**: Multer-based file handling with 5MB limit
- **Storage**: Local filesystem storage in uploads directory
- **Validation**: File type and size validation on upload

## Data Flow

1. **Authentication Flow**:
   - User accesses application → Replit Auth check → Session validation
   - Unauthenticated users redirected to login → OIDC flow → User creation/update

2. **Data Operations**:
   - Client makes API requests with credentials
   - Server validates session and user ownership
   - Database operations through Drizzle ORM
   - Response returned to client with React Query caching

3. **Real-time Updates**:
   - React Query handles cache invalidation
   - Optimistic updates for better UX
   - Background refetching for data consistency

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Auth**: Authentication and user management
- **Replit Environment**: Development and deployment platform

### Key Libraries
- **Database**: Drizzle ORM with Neon serverless driver
- **UI**: Radix UI primitives, Lucide icons
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with class-variance-authority
- **Date Handling**: date-fns for date formatting and manipulation

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across client and server
- **ESBuild**: Server-side bundling for production
- **Hot Reload**: Vite HMR for development

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Server**: tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Drizzle migrations with `npm run db:push`

### Production
- **Build Process**: 
  1. Vite builds client to `dist/public`
  2. ESBuild bundles server to `dist/index.js`
- **Runtime**: Node.js with built artifacts
- **Static Files**: Express serves client build and uploads
- **Database**: Neon serverless PostgreSQL

### Environment Variables
- `DATABASE_URL`: Neon database connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)
- `REPLIT_DOMAINS`: Allowed domains for OIDC

### File Structure
```
/client          # React frontend
/server          # Express backend
/shared          # Shared types and schemas
/uploads         # File upload storage
/migrations      # Database migrations
/dist            # Production build output
```

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment workflows.