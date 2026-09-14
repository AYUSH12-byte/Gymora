import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import TrainerDashboardScreen from "../screens/trainer/TrainerDashboardScreen";
import MemberDashboardScreen from "../screens/member/MemberDashboardScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = ({ user }) => {
  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Create Account" }}
          />
        </>
      ) : user.role === "admin" ? (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
      ) : user.role === "trainer" ? (
        <Stack.Screen
          name="TrainerDashboard"
          component={TrainerDashboardScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="MemberDashboard"
          component={MemberDashboardScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;