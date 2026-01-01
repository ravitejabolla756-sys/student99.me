# StuDENT Platform

## Overview

StuDENT is an all-in-one productivity tools platform designed for school and college students. It provides 39+ free tools across categories including calculators, image processing, PDF manipulation, student productivity tools, AI-powered writing helpers, and media tools. The platform operates with a no-login, no-subscription model, prioritizing accessibility and speed through client-side processing wherever possible.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built with Vite
- **Styling**: Tailwind CSS with custom design system following Notion/Linear/Khan Academy aesthetic
- **Component Library**: shadcn/ui components (New York style) with Radix UI primitives
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Theme**: Light/dark mode support with CSS custom properties

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api/*`
- **AI Integration**: Google Gemini API for AI-powered tools (summarization, essay generation, grammar checking)

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Session Storage**: In-memory storage (MemStorage class) for development; connect-pg-simple available for production sessions

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route pages and tool implementations
    lib/          # Utilities and tool definitions
    hooks/        # Custom React hooks
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  gemini.ts       # AI service integration
shared/           # Shared types and schema
migrations/       # Database migrations
```

### Tool Categories
1. **Calculators**: Basic, scientific, percentage, EMI, GPA, CGPA, age, unit converter, time duration
2. **Image Tools**: Resize, crop, compress, format conversion, grayscale, quality control
3. **PDF Tools**: Merge, split, reorder, extract, rotate, compress, metadata, images-to-PDF
4. **Student Tools**: Notes, to-dos, timers, planners, study aids
5. **AI Tools**: Essay generator, summarizer, grammar checker, paraphraser, note generator
6. **Media Tools**: Audio and video processing using ffmpeg.wasm

### Key Design Decisions
- **Client-side Processing**: Image and media tools use browser-based libraries (browser-image-compression, canvas APIs, ffmpeg.wasm) to minimize server load and ensure privacy
- **No Authentication Required**: Tools work immediately without user accounts
- **Shared Schema**: TypeScript types shared between frontend and backend via `@shared/*` path alias
- **Component Reusability**: Tool layout component provides consistent navigation and styling across all tools

## External Dependencies

### AI Services
- **Google Gemini API**: Powers AI tools (summarization, essay writing, grammar checking, note generation, paraphrasing). Requires `GEMINI_API_KEY` environment variable.

### Database
- **PostgreSQL**: Primary database, requires `DATABASE_URL` environment variable

### Client-Side Libraries
- **ffmpeg.wasm**: Browser-based audio/video processing
- **browser-image-compression**: Client-side image compression
- **pdf-lib** (implied): PDF manipulation
- **CropperJS**: Image cropping functionality

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **react-day-picker**: Calendar component
- **embla-carousel-react**: Carousel functionality
- **recharts**: Chart components