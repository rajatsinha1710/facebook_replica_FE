# ConnectHub - Social Network Application

A full-featured React social media application that replicates Facebook's functionality with a unique, modern design. Built with React 18, Vite, Tailwind CSS, and React Router.

## Features

- **User Authentication**: Login and signup with secure session management
- **News Feed**: Create, view, like, comment, and share posts
- **User Profiles**: Customizable profiles with timeline, about section, and friends
- **Friend System**: Send/accept friend requests, view friend suggestions
- **Messaging**: Real-time chat simulation with multiple conversations
- **Notifications**: Real-time notifications for likes, comments, shares, and friend requests
- **Search**: Search across people, posts, groups, and events
- **Groups**: Join and create groups, discover communities
- **Events**: Create and attend events, view upcoming and past events
- **Settings**: Manage profile, privacy, notifications, and account settings

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library
- **date-fns**: Date formatting utilities
- **Framer Motion**: Animation library (included but optional)

## Getting Started

### Prerequisites

- **Node.js 14.18+** (or preferably **Node.js 16+** or **18+** for best compatibility)
- npm or yarn

**Important**: If you're using Node.js 14, make sure it's version 14.18.0 or higher. If you have an older version (like 14.9.0), please upgrade Node.js using:
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) - recommended
- Or download from [nodejs.org](https://nodejs.org/)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Demo Credentials

You can use these demo credentials to login:
- **Email**: john@example.com
- **Password**: password123

Or create a new account using the signup page.

## Project Structure

```
src/
├── api/              # Mock data and API simulation
├── components/       # Reusable UI components
├── context/          # React Context providers (Auth, Chat, Notifications)
├── pages/            # Page components
└── main.jsx          # Application entry point
```

## Key Components

- **Layout**: Main application layout with header and sidebar
- **Header**: Navigation bar with search, notifications, and user menu
- **Sidebar**: Main navigation menu
- **PostCard**: Post display with like, comment, and share functionality
- **CreatePost**: Post creation component with image upload
- **CommentSection**: Comments display and creation

## Pages

- **Home**: News feed with posts from friends
- **Profile**: User profile with timeline and about section
- **Friends**: Friend list, requests, and suggestions
- **Messages**: Chat interface with multiple conversations
- **Notifications**: Activity notifications
- **Groups**: Discover and join groups
- **Events**: Browse and attend events
- **Search**: Search across all content types
- **Settings**: Account and privacy settings

## Customization

The application uses a custom color palette defined in `tailwind.config.js`:
- **Primary**: Indigo/purple gradient (`primary-600` to `secondary-600`)
- **Secondary**: Purple/fuchsia tones
- **Accent**: Orange tones for highlights

You can customize these colors in the Tailwind config file.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Features Overview

### Authentication
- Secure login/logout
- Session persistence with localStorage
- User context throughout the app

### Social Features
- Create posts with text and images
- Like, comment, and share posts
- Friend request system
- Real-time notifications
- Direct messaging

### Discovery
- Global search functionality
- Groups discovery and joining
- Events calendar
- Friend suggestions

## Mock Data

The application uses mock data stored in `src/api/mockData.js`. In a production environment, this would be replaced with API calls to a backend server.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for educational purposes.

## Notes

- This is a frontend-only application with simulated backend functionality
- Real-time features use setTimeout simulation
- Images use placeholder services (DiceBear for avatars, Unsplash for photos)
- All data is stored in memory/localStorage and resets on page refresh

