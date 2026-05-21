# URL Shortener - Frontend

This is the React frontend for the URL Shortener application. It provides a beautiful, responsive, and mobile-friendly user interface for interacting with the backend API.

## Tech Stack
- **React.js (Vite)**: Fast, modern frontend framework
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful, consistent icon set

## Key Features
- **Mobile Responsive**: Fully optimized for mobile devices, tablets, and desktops using a mobile-first Tailwind approach.
- **Public & Private Access**: 
  - **Public Home Page**: Clean landing page where anyone can instantly shorten a URL.
  - **User Dashboard**: Secure area where registered users can view their active links, track clicks, and toggle link statuses.
- **Authentication**: Modern UI for Login, Registration, and Password Reset flows.
- **Clipboard & Sharing**: Easily copy short URLs to the clipboard or use the native Web Share API on supported devices.

## Environment Variables
Create a `.env` file in this directory with the following variable:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in the development mode using Vite.
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### `npm run build`
Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.
