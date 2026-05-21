# URL Shortener (MERN Stack)

A full-stack web application that allows users to create short, memorable links, track their performance, and manage their links through a beautiful dashboard. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure
The project is divided into two main directories:
- `Frontend/`: The React application (Vite, Tailwind CSS)
- `Backend/`: The Node.js/Express API and MongoDB connection

## Core Features
- **Public & Authenticated Use**: Anyone can instantly shorten a URL from the homepage. Registered users can track, manage, and analyze their generated links.
- **Custom Aliases & Expiries**: Users can create custom short codes (e.g., `amazon-sale`) and set optional expiration dates for their links.
- **Analytics**: Track total clicks on each URL directly from the Dashboard.
- **Link Management**: Activate, deactivate, or delete links at any time.
- **Secure Authentication**: Full JWT-based user authentication, including a "Forgot Password" email flow.
- **Responsive Design**: Beautiful, modern UI optimized for mobile phones, tablets, and desktop displays.

## Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Git

## Step-by-Step Installation & Execution

### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone <your-repository-url>
cd "URL Shortner"
```

### 2. Setup the Backend
Navigate to the `Backend` directory and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:5000

# Optional: Real email credentials for password resets
# If left empty, the app will use a mock Ethereal test account
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the backend development server:
```bash
npm run dev
```
*(The backend should now be running on `http://localhost:5000`)*

### 3. Setup the Frontend
Open a new terminal window, navigate to the `Frontend` directory, and install dependencies:
```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```
*(The frontend should now be running on `http://localhost:5173`)*

### 4. Open the App!
Navigate to [http://localhost:5173](http://localhost:5173) in your browser. You can immediately start shortening URLs, or click "Sign Up" to create an account and access the Dashboard.
