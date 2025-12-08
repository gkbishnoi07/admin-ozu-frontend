# Ozu Admin Portal - Replit Project

## Overview
This is the Ozu Admin Portal frontend application - a modern React + TypeScript admin interface for real-time rider tracking and delivery management. The application is connected to a FastAPI backend and uses Supabase for authentication.

**Current Status**: Successfully imported and configured for Replit environment (December 8, 2025)

## Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS with shadcn/ui components
- **Maps**: Leaflet + React-Leaflet for interactive mapping
- **Real-time Updates**: Socket.IO Client
- **Authentication**: Supabase Auth
- **Backend API**: FastAPI (external - Railway hosted)
- **UI Components**: shadcn/ui (Button, Card, Badge, etc.)

## Project Structure
```
ozu-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # shadcn/ui components
│   │   └── map/        # Map-specific components
│   ├── pages/          # Page components (Admin Portal, Auth, etc.)
│   ├── contexts/       # React contexts (AuthContext)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (API, Socket, Supabase)
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── .env                # Environment variables
├── vite.config.ts      # Vite configuration (configured for Replit)
└── package.json        # Dependencies and scripts
```

## Environment Configuration
The project uses the following environment variables (stored in `.env`):

- `VITE_BACKEND_BASE_URL` - FastAPI backend URL (currently Railway)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

## Replit Configuration

### Development Server
- **Port**: 5000 (required for Replit webview)
- **Host**: 0.0.0.0 (allows external access)
- **Workflow**: "Start application" runs `npm run dev`
- **HMR**: Configured for port 5000

### Deployment Settings
- **Type**: Static site deployment
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Key Features
1. **Live Interactive Map** - Real-time rider tracking with color-coded markers
2. **Rider Management** - Approve/reject rider applications
3. **Shipment Management** - Create and track shipments
4. **Issue Tracking** - Handle delivery issues and customer complaints
5. **Address Management** - Manage pickup/delivery addresses
6. **Real-time Updates** - WebSocket integration for instant updates

## Architecture Notes

### Authentication Flow
- Uses Supabase for user authentication
- Protected routes require valid session
- JWT tokens passed to backend API via Authorization header

### Backend Integration
- External FastAPI backend hosted on Railway
- RESTful API endpoints for CRUD operations
- WebSocket connection for real-time rider updates
- CORS configured to allow frontend access

### State Management
- React Context for authentication state
- Custom hooks for data fetching (useRiders, useShipments, useIssues)
- Socket.IO for real-time state synchronization

## Recent Changes (December 8, 2025)
1. Updated Vite configuration for Replit environment
   - Changed port from 3000 to 5000
   - Set host to 0.0.0.0
   - Configured HMR for port 5000
   - Added allowedHosts: true for proxy compatibility
2. Installed all npm dependencies
3. Configured "Start application" workflow
4. Set up static deployment configuration
5. Verified application runs successfully
6. **UI Redesign - Purple/Violet Theme (Matching Ozu Website)**
   - Purple/violet gradient background for Login page matching theozu.com
   - Gradient header for Admin Shipment Portal (violet to purple to fuchsia)
   - Purple gradient buttons with shadow effects
   - Violet accent color throughout (links, focus states, active tabs)
   - Modern rounded corners (rounded-xl, rounded-2xl) on cards and inputs
   - Glass-effect navigation pills with backdrop blur on header
   - Consistent violet-600 accent for interactive elements
   - White cards with clean shadows on gradient backgrounds

## Development Commands
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Preferences
None documented yet.

## Future Enhancements
- Add real-time notifications
- Implement analytics dashboard
- Add customer management features
- Enhance mobile responsiveness
