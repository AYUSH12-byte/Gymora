import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";

import AdminDrawerNavigator from "./AdminDrawerNavigator";
import TrainerDrawerNavigator from "./TrainerDrawerNavigator";

import MemberDrawerNavigator from "./MemberDrawerNavigator";

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
        </>
      ) : user.role === "admin" ? (
        <Stack.Screen
          name="AdminTabs"
          component={AdminDrawerNavigator}
          options={{ headerShown: false }}
        />
      ) : user.role === "trainer" ? (
        <Stack.Screen
          name="TrainerTabs"
          component={TrainerDrawerNavigator  }
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="MemberDrawer"
          component={MemberDrawerNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;