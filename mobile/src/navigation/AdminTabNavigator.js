import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import MembersScreen from "../screens/admin/MembersScreen";

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
      />

      <Tab.Screen
        name="Members"
        component={MembersScreen}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;