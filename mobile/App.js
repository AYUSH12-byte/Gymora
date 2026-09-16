import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./src/navigation/AppNavigator";
import TrainerTabNavigator from "./src/navigation/TrainerTabNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user && user.isTrainer ? <TrainerTabNavigator /> : <AppNavigator user={user} />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}