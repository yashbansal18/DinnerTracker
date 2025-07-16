# Second Helpings

A mobile-first web application for dinner hosts to manage events, track guests, dishes, and meal history. The primary goal is to help users avoid repeating the same dishes for the same guests by providing smart alerts and comprehensive tracking.

## Features

### Core Features
- **Guest Management**: Add and manage guests with dietary restrictions, preferences, and contact information
- **Dish Library**: Store recipes with ingredients, instructions, categories, and photos
- **Event Planning**: Create dinner events and assign guests and dishes
- **Smart Alerts**: Automatic detection of repeat dishes to prevent serving the same meal to guests
- **Search & Filter**: Cross-entity search across guests, dishes, and events
- **Meal History**: Track what dishes were served to which guests and when

### Smart Features
- **Repeat Dish Detection**: Alerts when you're about to serve the same dish to a guest
- **Dietary Restriction Tracking**: Monitor guest preferences and restrictions
- **Meal History Analytics**: View guest meal history and dish serving patterns
- **Mobile-First Design**: Optimized for mobile devices with responsive layout

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and build
- **Tailwind CSS** for styling
- **Radix UI** primitives with shadcn/ui components
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **PostgreSQL** with Drizzle ORM
- **Neon Database** (serverless PostgreSQL)
- **Replit Auth** with OpenID Connect
- **Multer** for file uploads

### Authentication & Security
- **Replit Auth** with OIDC
- **PostgreSQL-backed sessions**
- **HTTP-only cookies** with secure flags
- **Automatic user creation/updates**

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (provided via Replit)
- Replit account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd second-helpings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Database (automatically provided in Replit)
   DATABASE_URL=your_postgresql_connection_string
   
   # Session security
   SESSION_SECRET=your_session_secret
   
   # Replit Auth (automatically provided)
   REPL_ID=your_repl_id
   REPLIT_DOMAINS=your_replit_domains
   ISSUER_URL=https://replit.com/oidc
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                 # Express backend
│   ├── db.ts              # Database configuration
│   ├── index.ts           # Server entry point
│   ├── replitAuth.ts      # Authentication setup
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── uploads/               # File upload storage
```

## API Documentation

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

### Guests
- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get specific guest
- `POST /api/guests` - Create new guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

### Dishes
- `GET /api/dishes` - Get all dishes
- `GET /api/dishes/:id` - Get specific dish
- `POST /api/dishes` - Create new dish (with image upload)
- `PUT /api/dishes/:id` - Update dish
- `DELETE /api/dishes/:id` - Delete dish

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Analytics
- `GET /api/recently-served` - Get recently served dishes
- `POST /api/repeat-dish-alerts` - Check for repeat dish alerts
- `GET /api/guests/:id/meal-history` - Get guest meal history

## Database Schema

### Core Tables
- **users**: User profiles and authentication
- **guests**: Guest information and preferences
- **dishes**: Recipe library with ingredients and instructions
- **events**: Dinner events with date and details
- **event_guests**: Many-to-many relationship for event attendees
- **event_dishes**: Many-to-many relationship for event menu
- **guest_dish_favorites**: Track guest dish preferences
- **sessions**: PostgreSQL-backed session storage

## Features in Detail

### Guest Management
- Add guests with contact information
- Track dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Set favorite food categories
- Add custom tags and notes
- View meal history per guest

### Dish Library
- Store recipes with detailed ingredients
- Upload dish photos
- Categorize dishes (appetizer, main course, dessert, etc.)
- Add preparation time and instructions
- Track dish serving history

### Event Planning
- Create dinner events with date and description
- Assign guests to events
- Plan menu by selecting dishes
- Get smart alerts for repeat dishes
- Duplicate previous events

### Smart Alerts
- Automatic detection when serving same dish to same guest
- Configurable time windows for repeat detection
- Visual alerts during event planning
- Meal history tracking for analytics

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for consistent styling

## Deployment

The application is designed for deployment on Replit:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Replit**
   - Push code to Replit
   - Environment variables are automatically configured
   - Database migrations run automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

Built with ❤️ for dinner hosts who want to create memorable experiences for their guests.