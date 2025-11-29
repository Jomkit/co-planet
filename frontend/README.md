# Co-Planet Frontend

The frontend web application for Co-Planet, a collaborative trip planning platform. Built with Next.js, React, TypeScript, and Tailwind CSS, this mobile-first application provides an intuitive interface for planning and managing trips.

## Overview

Co-Planet Frontend is a modern, responsive web application that allows users to create and manage trips with detailed itineraries, activities, and traveler information. The app features a clean, user-friendly interface with a bento-style dashboard for visualizing trip details.

## Tech Stack

- **Framework**: Next.js 16.0.5 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist Sans & Geist Mono (Next.js fonts)

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with fonts and metadata
│   ├── page.tsx             # Home/landing page
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── trips/
│   │   ├── page.tsx         # Trips list/dashboard page
│   │   ├── create/
│   │   │   └── page.tsx     # Trip creation page
│   │   └── [id]/
│   │       └── page.tsx     # Individual trip detail page (bento layout)
│   └── favicon.ico
├── components/
│   ├── Navigation.tsx       # Site navigation component
│   └── TripForm.tsx         # Trip creation/editing form
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
└── eslint.config.mjs        # ESLint configuration
```

## Features

### Landing Page (`/`)
- Clean, welcoming interface with gradient background
- Quick trip creation input
- Redirects to detailed trip creation form

### Trips Dashboard (`/trips`)
- View all created trips
- Quick trip creation section
- Trip cards showing name, destination, and start date
- Clickable cards navigate to trip details

### Trip Creation (`/trips/create`)
- Comprehensive trip form with:
  - Trip name and destination
  - Start and end dates
  - Traveler list (comma-separated)
  - Trip summary
  - Dynamic activity planning (excursions, restaurants, flights, lodging)
- Pre-populates trip name from URL parameter
- Creates trip and activities in a single flow

### Trip Detail Page (`/trips/[id]`)
- Bento-style grid layout for visual appeal
- Displays:
  - Trip summary (2-column span)
  - Traveler badges
  - Itinerary with all activities
- Activity cards show type, date, and location
- Responsive grid adapts to screen size

### Navigation
- Persistent navigation bar
- Links to Home and Trips pages
- Clean, minimal design

## Setup and Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   Or with yarn:
   ```bash
   yarn install
   ```

## Running the Development Server

1. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   
   Or with yarn:
   ```bash
   yarn dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

3. **The app will hot-reload as you make changes to the code**

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server on port 3000 |
| `build` | `npm run build` | Build production-ready application |
| `start` | `npm run start` | Start production server (requires build first) |
| `lint` | `npm run lint` | Run ESLint for code quality checks |

## API Integration

The frontend connects to the Flask backend API running on `http://localhost:5000`. Ensure the backend server is running before using the frontend.

### API Endpoints Used

- `GET /api/trips` - Fetch all trips
- `POST /api/trips` - Create a new trip
- `GET /api/trips/:id` - Fetch trip details with activities
- `POST /api/trips/:id/activities` - Add activities to a trip

## Key Components

### TripForm
A comprehensive form component for creating trips with:
- Form state management with React hooks
- Dynamic activity list (add/remove activities)
- URL parameter integration for pre-filling trip name
- Validation and error handling
- Sequential API calls (create trip, then add activities)

### Navigation
Simple navigation component providing:
- Site branding
- Links to main pages
- Consistent header across all pages

## Styling

The application uses Tailwind CSS with a custom color scheme:
- **Primary Colors**: Green (for CTAs and accents)
- **Background Gradients**: Orange to Amber (for landing page)
- **Neutral Colors**: Gray scale for text and backgrounds
- **Design System**: Consistent spacing, rounded corners, and shadows

### Design Principles
- **Mobile-first**: Responsive design that works on all screen sizes
- **Bento Layout**: Modern grid-based card layout for trip details
- **Clean UI**: Minimal, intuitive interface with clear visual hierarchy
- **Smooth Interactions**: Hover states and transitions for better UX

## TypeScript

The project is fully typed with TypeScript, including:
- Interface definitions for Trip and Activity models
- Type-safe component props
- Proper typing for API responses and form data

## Development Notes

### Path Aliases
The project uses `@/` as an alias for the root directory:
```typescript
import Navigation from "@/components/Navigation";
```

### Client Components
Most components use `"use client"` directive as they require:
- React hooks (useState, useEffect)
- Browser APIs
- Event handlers

### Data Flow
1. User creates trip on landing page or trips page
2. Redirected to `/trips/create` with trip name as URL parameter
3. TripForm pre-fills name and allows adding details
4. On submit, trip is created via API, then activities are added
5. User is redirected to trip detail page showing bento layout

## Browser Compatibility

The application is compatible with modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Building for Production

1. **Create an optimized production build:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm run start
   ```

The production build includes:
- Optimized JavaScript bundles
- Minified CSS
- Static page generation where possible
- Image optimization

## Environment Variables

Currently, the API URL is hardcoded to `http://localhost:5000`. For production deployments, consider using environment variables:

Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then update API calls to use:
```typescript
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips`)
```

## Future Enhancements

Potential features to consider:
- User authentication and multi-user support
- Trip sharing and collaboration
- Map integration for destinations
- Photo uploads for trips and activities
- Budget tracking
- Packing list management
- Weather integration
- Export trip itinerary as PDF

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Next.js will prompt you to use a different port, or you can specify one:
```bash
npm run dev -- -p 3001
```

### API Connection Issues
Ensure the backend server is running on `http://localhost:5000`. Check the browser console for CORS or network errors.

### Build Errors
Clear the Next.js cache and rebuild:
```bash
rm -rf .next
npm run build
```

## Contributing

When contributing to the frontend:
1. Follow the existing code style and TypeScript patterns
2. Ensure all components are properly typed
3. Test responsive design on multiple screen sizes
4. Run `npm run lint` before committing
5. Keep components focused and reusable
