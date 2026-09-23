# Gymora

Gymora is a gym management system with an Express and MongoDB backend and an Expo React Native mobile application.

## Features

- Authentication and role-based access for administrators, trainers, and members
- Member, trainer, membership package, and subscription management
- Attendance tracking
- Payments and member purchases
- Workout plan management
- Progress tracking
- Notifications
- Dashboard and report endpoints
- Member portal functionality
- Scheduled membership processing

## Technology Stack

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Helmet and CORS
- node-cron for scheduled membership jobs

### Mobile

- Expo SDK 57
- React Native 0.86
- React Navigation
- Axios
- Async Storage
- Expo Camera and Image Picker

## Project Structure

```text
Gymora/
├── backend/    Express API, MongoDB models, controllers, routes, and middleware
├── mobile/     Expo React Native application
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- Expo CLI or the Expo tooling included with the project
- Android Studio for Android development, or Xcode for iOS development on macOS

## Backend Setup

1. Open a terminal in the backend directory:

   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` using the example file:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/gym_management
   JWT_SECRET=replace-with-a-long-random-secret
   PORT=7000
   ```

3. Start the API:

   ```bash
   npm start
   ```

   For development with automatic restarts:

   ```bash
   npm run dev
   ```

The API is available at `http://localhost:7000`. The root health check is `GET /`.

## Mobile Setup

1. Open a second terminal in the mobile directory:

   ```bash
   cd mobile
   npm install
   ```

2. Update `mobile/src/constants/config.js` so `API_BASE_URL` uses the backend machine's reachable IP address:

   ```js
   const API_BASE_URL = "http://YOUR_COMPUTER_IP:7000/api";
   ```

   A physical device must be on the same network as the computer running the backend. Android emulators can typically use `10.0.2.2` instead of `localhost` to reach the host machine.

3. Start Expo:

   ```bash
   npm start
   ```

   Or launch directly on a target platform:

   ```bash
   npm run android
   npm run ios
   npm run web
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
```

Most protected endpoints require a valid JWT supplied in the request authorization header.

## Creating an Admin User

The backend includes an admin creation utility at `backend/utils/createAdmin.js`. Review its required fields before running it, then execute it from the backend directory with:

```bash
node utils/createAdmin.js
```

## Development Notes

- Keep secrets in `backend/.env`; do not commit them.
- Keep MongoDB running before starting the backend.
- Start the backend before using authenticated mobile features.
- The backend starts a scheduled membership job when the server starts.

## License

This project currently uses the license specified in `mobile/LICENSE`.

**Author:** Ayush Chaudhari
