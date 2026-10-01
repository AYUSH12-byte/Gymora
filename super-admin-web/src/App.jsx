import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ComingSoon from "./pages/common/ComingSoon";
import Gyms from "./pages/gyms/Gyms";
import GymAdmins from "./pages/gym-admins/GymAdmins";
import SubscriptionPlans from "./pages/subscription-plans/SubscriptionPlans";
import GymSubscriptions from "./pages/gym-subscriptions/GymSubscriptions";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gyms"
            element={
              <ProtectedRoute>
                <Gyms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gym-admins"
            element={
              <ProtectedRoute>
                <GymAdmins />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription-plans"
            element={
              <ProtectedRoute>
                <SubscriptionPlans />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gym-subscriptions"
            element={
              <ProtectedRoute>
                <GymSubscriptions />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
