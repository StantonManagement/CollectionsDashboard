# Collections Dashboard - Property Management System

## Overview

This is a property management collections dashboard application designed to streamline rent collection processes through AI-powered tenant communication and automated workflow management. The system features a split-screen interface with a priority-based collections queue on the left and a tabbed management interface on the right, enabling efficient handling of tenant interactions, payment plans, and escalations.

The application serves property management companies by providing tools to manage delinquent tenants, automate conversations, approve AI-generated responses, track payment plans, and handle escalations through a centralized dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and optimized bundling
- **UI Library**: Radix UI components with shadcn/ui styling system for consistent, accessible interface components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Layout Pattern**: Split-screen dashboard with fixed left panel (50%) for collections queue and right panel (50%) for tabbed interfaces

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for RESTful API endpoints
- **Development Setup**: Node.js with tsx for TypeScript execution in development
- **API Design**: RESTful endpoints organized by resource (tenants, conversations, payment plans, escalations)
- **Data Storage**: In-memory storage implementation with interface-based architecture for easy database integration
- **Session Management**: Express session handling with PostgreSQL session store configuration

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema Management**: Shared TypeScript schema definitions with Drizzle-Zod integration for validation
- **Database**: PostgreSQL with Neon serverless configuration for cloud deployment
- **Migrations**: Drizzle Kit for database schema migrations and management

### Core Data Models
- **Tenants**: Property occupants with contact information, debt details, and communication preferences
- **Conversations**: AI-powered chat sessions with confidence scoring and approval workflows
- **Payment Plans**: Structured payment arrangements with risk assessment and approval tracking
- **Escalations**: Priority-based escalation system for cases requiring human intervention

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Client-side State**: Session state managed through React Query with automatic retry and error handling

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom configuration for consistent design system
- **shadcn/ui**: Pre-built component library built on Radix UI with Tailwind styling
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Development and Build Tools
- **Vite**: Fast build tool with HMR for development and optimized production builds
- **TypeScript**: Type safety across frontend, backend, and shared code
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Database and ORM
- **Drizzle ORM**: TypeScript-first ORM with excellent type inference and PostgreSQL support
- **Neon Database**: Serverless PostgreSQL platform for scalable cloud database hosting
- **Drizzle Kit**: Database toolkit for migrations, introspection, and schema management

### State Management and Data Fetching
- **TanStack Query**: Powerful data synchronization library for server state management
- **React Hook Form**: Performant forms with minimal re-renders and built-in validation
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries

### Deployment and Platform
- **Replit**: Cloud development platform with integrated deployment and collaboration features
- **Replit Plugins**: Development tools including error overlay and cartographer for enhanced debugging