import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ComingSoon from "./pages/common/ComingSoon";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />

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
                <ComingSoon title="Gyms" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gym-admins"
            element={
              <ProtectedRoute>
                <ComingSoon title="Gym Admins" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscription-plans"
            element={
              <ProtectedRoute>
                <ComingSoon title="Subscription Plans" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gym-subscriptions"
            element={
              <ProtectedRoute>
                <ComingSoon title="Gym Subscriptions" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;