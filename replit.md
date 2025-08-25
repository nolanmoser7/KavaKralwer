# Kava Krawler - Progressive Web App

## Overview

Kava Krawler is a Progressive Web App (PWA) designed to help users discover kava and kratom bars near them. The app provides location-based discovery, social features like check-ins and reviews, user profiles with achievements, and bar submission capabilities. Built with modern web technologies, it offers a native app-like experience with offline capabilities through service workers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 with Vite**: Modern React setup with fast build tooling and hot module replacement
- **TypeScript**: Full type safety across the application
- **Routing**: Wouter for lightweight client-side routing with mobile-first navigation
- **State Management**: TanStack Query for server state with built-in caching and synchronization
- **UI Framework**: Radix UI components with shadcn/ui design system for consistent, accessible interface
- **Styling**: Tailwind CSS with custom tropical theme colors and responsive design
- **PWA Features**: Configured with manifest.json for app-like installation and offline capabilities

### Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging, error handling, and security
- **Authentication**: Replit Auth integration with OpenID Connect for seamless user authentication
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple for persistence
- **Database Layer**: Drizzle ORM for type-safe database operations and migrations
- **API Design**: RESTful endpoints for bars, reviews, check-ins, favorites, and user management
- **Geospatial Features**: PostGIS support for location-based queries and mapping

### Data Storage
- **Primary Database**: PostgreSQL 16 with PostGIS extension hosted on Neon
- **Schema Design**: Comprehensive tables for users, bars, reviews, check-ins, favorites, photos, and achievements
- **Geospatial Data**: Point geometry storage with spatial indexing for efficient location queries
- **Session Storage**: Database-backed sessions for reliable authentication state
- **Migration System**: Drizzle Kit for database schema versioning and deployment

### User Experience Architecture
- **Mobile-First Design**: Bottom navigation with tab-based interface optimized for mobile usage
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features
- **Offline Support**: Service worker configuration for caching critical resources and API responses
- **Location Services**: Integration with browser geolocation API and Google Maps JavaScript SDK
- **Social Features**: Check-in system with photos, ratings using custom shell-based component, and achievement tracking

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity with connection pooling
- **drizzle-orm**: Type-safe database toolkit with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management with caching and synchronization
- **wouter**: Lightweight routing library for React applications

### UI and Design System
- **@radix-ui/***: Comprehensive set of accessible UI primitives including dialogs, dropdowns, and form controls
- **tailwindcss**: Utility-first CSS framework with custom tropical theme configuration
- **class-variance-authority**: Type-safe utility for managing CSS class variants
- **lucide-react**: Consistent icon library for UI elements

### Authentication and Security
- **openid-client**: OpenID Connect client for Replit Auth integration
- **passport**: Authentication middleware for Express.js applications
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for user authentication state

### Maps and Location Services
- **Google Maps JavaScript SDK**: Interactive mapping, geocoding, and location services
- **@googlemaps/markerclusterer**: Marker clustering for better map performance with multiple locations

### Form Handling and Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Validation resolver for Zod schema integration
- **zod**: TypeScript-first schema validation for forms and API data
- **drizzle-zod**: Integration layer between Drizzle ORM and Zod validation

### Development and Build Tools
- **vite**: Fast development server and build tool with React plugin
- **tsx**: TypeScript execution engine for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment