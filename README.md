# Gymora

Gymora is a multi-tenant  gym management platform built for managing gym operations, memberships, trainers, attendance, payments, and member insights across a backend API, a React Native mobile app, and a super-admin web dashboard.

## Features

- Role-based authentication for admins, trainers, and members
- Member and trainer management
- Membership and package management
- Attendance tracking and check-in/check-out workflows
- Payment and billing records
- Workout plan management
- Progress and reporting dashboards
- Member portal access for gym members
- Scheduled membership processing and automatic lifecycle updates
- Super-admin support for gym and subscription management

## Project Structure

```text
Gymora/
├── backend/           Express.js API, MongoDB models, routes, middleware, and scheduled jobs
├── mobile/            Expo React Native app for gym staff and members
├── super-admin-web/   React + Vite dashboard for platform-level admin operations
├── README.md
├── .github/
└── .git/
```

## Technology Stack

### Backend

- Node.js
- Express.js 5
- MongoDB + Mongoose
- JWT-based authentication
- bcryptjs for password hashing
- Helmet and CORS for security
- node-cron for scheduled jobs

### Mobile App

- Expo SDK 57
- React Native 0.86
- React Navigation
- Axios
- Async Storage
- Expo Camera and Image Picker

### Super Admin Web

- Vite
- React 19
- React Router
- Tailwind CSS
- Axios

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or a valid MongoDB connection string
- Expo CLI or the Expo tooling included with the project
- Android Studio for Android development or Xcode for iOS development (macOS)

## Environment Setup

Create a `backend/.env` file in the backend directory with the following values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/gym_management
JWT_SECRET=replace-with-a-long-random-secret
PORT=7000
```

You can also add any other project-specific environment variables required by your local setup, but the values above are required for the core API to run.

## Backend Setup

1. Open a terminal in the `backend` directory:

   ```bash
   cd backend
   npm install
   ```

2. Start the API in development mode:

   ```bash
   npm run dev
   ```

   Or run the production-style start command:

   ```bash
   npm start
   ```

3. Confirm the API is running:

   - Base URL: `http://localhost:7000`
   - Health route: `GET /`

## Mobile App Setup

1. Open a terminal in the `mobile` directory:

   ```bash
   cd mobile
   npm install
   ```

2. Update the API base URL in `mobile/src/constants/config.js` to match your backend host:

   ```js
   const API_BASE_URL = "http://YOUR_COMPUTER_IP:7000/api";
   ```

   Notes:
   - Use your machine's local IP on a physical device.
   - Android emulators often use `10.0.2.2` instead of `localhost`.
   - iOS simulators can often use `localhost` depending on the network setup.

3. Start the Expo app:

   ```bash
   npm start
   ```

   You can also launch directly:

   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Super Admin Web Setup

1. Open a terminal in the `super-admin-web` directory:

   ```bash
   cd super-admin-web
   npm install
   ```

2. Start the dashboard:

   ```bash
   npm run dev
   ```

3. Open the local Vite app in the browser, typically at:

   ```text
   http://localhost:5173
   ```

## API Route Groups

The backend exposes route groups under `/api`:

```text
/auth
/members
/packages
/memberships
/payments
/trainers
/workout-plans
/attendance
/dashboard
/progress
/notifications
/reports
/profile
/member-portal
/admin
/member-purchase
/member-payments
/super-admin/auth
/super-admin/gyms
/super-admin/users
/super-admin/subscription-plans
/super-admin/gym-subscriptions
/super-admin/dashboard
```

Some endpoints are protected and require a valid JWT in the Authorization header.

## Important Endpoints

- Admin dashboard: `GET /api/admin/dashboard`
- Super-admin dashboard: `GET /api/super-admin/dashboard`
- Authentication: `POST /api/auth/*`
- Members: `GET /api/members/*`
- Memberships: `GET /api/memberships/*`
- Payments: `GET /api/payments/*`
- Attendance: `GET /api/attendance/*`

## Creating an Admin User

The backend includes an admin creation utility at `backend/utils/createAdmin.js`.

Review the required fields before running it, then execute it from the backend directory:

```bash
node utils/createAdmin.js
```

## Development Notes

- Keep secrets in `backend/.env` and do not commit them.
- Keep MongoDB running before starting the backend.
- Start the backend before using authenticated mobile features.
- The application automatically runs scheduled membership jobs when the backend starts.
- The platform supports both staff-facing mobile workflows and a super-admin platform dashboard.

## License

This project currently uses the license specified in `mobile/LICENSE`.

**Author:** Ayush Chaudhari
