# URL Shortener - Backend

** Live API:** [https://url-shortner-1-yjbd.onrender.com](https://url-shortner-1-yjbd.onrender.com)  
**Frontend Link:** [https://url-shortner-frontend-f3zc.onrender.com/](https://url-shortner-frontend-f3zc.onrender.com/)

This is the Express.js and MongoDB backend for the URL Shortener application. It provides a RESTful API for user authentication, URL shortening, and link management.

## Tech Stack
- **Node.js & Express.js**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT (JSON Web Tokens)**: Secure user authentication
- **Nodemailer**: Email service for password reset functionality
- **Bcryptjs**: Password hashing

## Environment Variables
Create a `.env` file in this directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://url-shortner-frontend-f3zc.onrender.com
BASE_URL=https://url-shortner-1-yjbd.onrender.com

# Optional: For real email delivery (Password Reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
*Note: If `EMAIL_USER` is not provided, the server will fallback to Ethereal Email for mock testing.*

## Key Features
- **Public & Private Shortening**: Unauthenticated users can shorten URLs, while authenticated users have their URLs linked to their account.
- **Authentication**: Full Login, Register, Forgot Password, and Reset Password flows.
- **Link Management**: Endpoints for retrieving, deleting, activating, and deactivating URLs.
- **Analytics**: Endpoints for tracking click statistics on shortened URLs.

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in the development mode using nodemon.
The server will restart if you make edits.

### `npm start`
Runs the compiled app in production mode.
