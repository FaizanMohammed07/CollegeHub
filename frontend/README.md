# CollegeHub Frontend 🎓

A modern, production-ready React frontend for the College Hub application. Connect, explore, and grow with your college community!

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at **http://localhost:5173** (or next available port if in use).

### Backend Connection

The frontend connects to the backend API running on `http://localhost:4000`. Make sure the backend is running before starting the frontend.

```bash
# In another terminal, start the backend
cd server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── UI.jsx           # Core UI components (Button, Card, Input, Modal, etc.)
│   ├── Layouts.jsx      # Layout utilities (ProtectedRoute, ErrorBoundary, etc.)
│   ├── Navigation.jsx   # Top navigation/header component
│   └── LayoutWrapper.jsx # Wrapper that adds Navigation to protected pages
│
├── context/             # React Context for state management
│   ├── AuthContext.jsx      # Authentication state (login, signup, logout)
│   ├── UserContext.jsx      # User profile and user-related operations
│   ├── ClubContext.jsx      # Club management state
│   └── EventContext.jsx     # Event management state
│
├── hooks/               # Custom React hooks
│   └── useCustomHooks.js  # Collection of custom hooks
│
├── pages/               # Page components
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── DashboardPage.jsx
│   ├── AdminDashboardPage.jsx
│   ├── ProfilePage.jsx
│   ├── ClubsListPage.jsx
│   ├── ClubDetailPage.jsx
│   ├── CreateClubPage.jsx
│   ├── EventsListPage.jsx
│   ├── EventDetailPage.jsx
│   ├── CreateEventPage.jsx
│   ├── MyRegistrationsPage.jsx
│   └── SearchEventsPage.jsx
│
├── services/            # API communication layer
│   ├── api.js           # Axios instance with interceptors
│   ├── auth.service.js  # Authentication service
│   └── endpoints.js     # Organized API endpoint functions
│
├── styles/              # Global styles
│   └── globals.css      # Tailwind setup, custom animations
│
├── App.jsx              # Main app component with routing
├── main.jsx             # React app entry point
├── index.html           # HTML entry point
└── vite.config.js       # Vite configuration
```

## 🔧 Configuration

### Environment Variables (`.env`)

```properties
VITE_API_URL=http://localhost:4000          # Backend API URL
VITE_API_TIMEOUT=30000                      # API request timeout (ms)
VITE_LOG_LEVEL=debug                        # Logging level
VITE_ENABLE_MAPBOX=true                     # Enable Mapbox integration
VITE_MAPBOX_TOKEN=your_token                # Mapbox API token
VITE_APP_NAME=College Hub                   # App name
VITE_PRODUCTION=false                       # Production mode flag
```

## 🎨 Features

### Authentication ✅

- Login with email/password
- Sign up with validation
- Forgot password flow
- Password reset with token
- Automatic token refresh (15m access, 7d refresh)
- Remember me functionality
- Secure token storage

### Clubs Management ✅

- Browse all clubs with search and filters
- View club details, members, and events
- Create new clubs (admin only)
- Edit club information
- Join/leave clubs
- Auto-slug generation
- Category filtering
- Pagination

### Events Management ✅

- Browse events with status badges
- Advanced event search with filters
- View event details and attendee list
- Register/cancel registrations
- Event check-in with geolocation
- Create events (admin only)
- Track registration status
- View my registrations page
- Distance-based filtering (1-50 km)
- Date filtering (today, week, month, past)

### User Management ✅

- View and edit profile
- User stats and information
- Role-based access (student/club_admin/college_admin/super_admin)
- Logout functionality
- Profile avatar and role badge

### Admin Features ✅

- Admin dashboard with statistics
- Cache statistics display
- User location information
- User management interface

### Location Features ✅

- Geolocation integration
- Distance-based filtering
- Nearby events discovery
- Haversine distance calculation

### UI/UX ✅

- Responsive design (mobile-first)
- Loading states with skeletons
- Toast notifications
- Error boundaries
- Modal confirmations
- Form validation
- Empty states
- Smooth animations
- Consistent styling

## 🔐 Authentication & Authorization

### Token Management

- Access tokens: 15 minutes lifetime
- Refresh tokens: 7 days lifetime
- Automatic refresh on 401
- localStorage storage
- Logout clears all tokens

### Role-Based Access

- **student**: Browse and register
- **club_admin**: Create/manage clubs and events
- **college_admin**: Manage college resources
- **super_admin**: Full system access

## 🎯 State Management

Using **React Context API**:

```javascript
const { user, login, logout } = useAuth();
const { profile, getProfile, updateProfile } = useUser();
const { clubs, createClub, joinClub } = useClub();
const { events, createEvent, registerEvent } = useEvent();
```

## 🪝 Custom Hooks

- **useGeolocation()** - Get/watch user location
- **useDebounce()** - Debounce search input
- **useForm()** - Form handling and validation
- **useApi()** - Generic API call handler
- **usePagination()** - Pagination logic
- **useLocalStorage()** - Persist data
- **useAsync()** - Handle async operations

## 📡 API Integration

All API calls through `src/services/endpoints.js`. Axios client automatically:

- Adds Bearer token to requests
- Refreshes tokens on 401
- Handles errors consistently
- Logs requests in debug mode

## 🧪 Testing

```bash
npm run test          # Run tests
npm run test:ui       # UI testing
npm run test:coverage # Coverage report
```

## 📦 Build & Deployment

```bash
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Check for linting
npm run format        # Format code
```

## 🎨 Styling

**Tailwind CSS** with custom configuration:

- Custom colors (blue, green, red, amber)
- Custom animations (fadeIn, slideUp, spin)
- Responsive utilities
- Dark mode ready

## 🔍 Debugging

### Console Logging

Set `VITE_LOG_LEVEL=debug` in `.env`

### Network Requests

- DevTools → Network tab
- Check actual API calls
- Verify responses

### State Management

- React DevTools extension
- Check localStorage for tokens
- Inspect Context values

## 🐛 Troubleshooting

| Issue              | Solution                         |
| ------------------ | -------------------------------- |
| Cannot find module | Run `npm install`                |
| Import errors      | Use relative paths `./` not `@/` |
| API calls failing  | Check backend on port 4000       |
| Styles not loading | Clear browser cache              |
| Token issues       | Check localStorage and expiry    |
| Port in use        | App uses next available port     |

## 📚 Dependencies

### Core

- react (^18.2.0)
- react-dom (^18.2.0)
- react-router-dom (^6.20.0)

### API & State

- axios (^1.6.0)
- react-hot-toast (^2.4.0)

### Styling

- tailwindcss (^3.3.0)
- framer-motion (^10.16.0)

### Forms & Utils

- react-hook-form (^7.48.0)
- date-fns (^2.30.0)
- clsx (^2.0.0)

### Development

- vite (^5.0.0)
- eslint (^8.55.0)
- typescript (^5.3.0)
- vitest (^1.0.0)
- prettier (^3.1.0)

## 📋 Common Tasks

### Add a New Page

1. Create `src/pages/NewPage.jsx`
2. Import in `App.jsx`
3. Add route with `<ProtectedRoute>`
4. Update `Navigation.jsx` if needed

### Add API Endpoint

1. Add function in `src/services/endpoints.js`
2. Use via Context or direct import
3. Handle loading/error states

### Add Context

1. Create `src/context/NewContext.jsx`
2. Create provider and custom hook
3. Add provider to `App.jsx`
4. Use throughout app

## 🤝 Contributing

- Follow existing code structure
- Use functional components with hooks
- Add prop validation (JSDoc)
- Test before committing
- Keep components small
- Use meaningful commit messages

## 📝 License

MIT License

## 🎯 Next Steps

- [ ] Unit tests with Vitest
- [ ] E2E tests (Cypress/Playwright)
- [ ] PWA functionality
- [ ] Advanced analytics
- [ ] Error tracking (Sentry)
- [ ] Real-time notifications
- [ ] Image upload feature
- [ ] QR code scanner
- [ ] Multi-language support
- [ ] Dark mode theme

## 🆘 Support

1. Check this README
2. Review `server/api.http` for API docs
3. Check DevTools Console
4. Review code comments
5. Contact: support@colleggehub.com

---

**Happy coding!** 🚀 Build amazing things with CollegeHub!
