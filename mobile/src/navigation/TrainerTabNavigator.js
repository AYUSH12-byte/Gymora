import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TrainerDashboardScreen from "../screens/trainer/TrainerDashboardScreen";

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ title }) => {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.subtitle}>
        This module will be added in the next step.
      </Text>
    </View>
  );
};

const TrainerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#222",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="TrainerDashboard"
        component={TrainerDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="TrainerMembers"
        children={() => (
          <PlaceholderScreen title="My Members" />
        )}
        options={{
          title: "My Members",
        }}
      />

      <Tab.Screen
        name="TrainerWorkouts"
        children={() => (
          <PlaceholderScreen title="Workout Plans" />
        )}
        options={{
          title: "Workout Plans",
        }}
      />

      <Tab.Screen
        name="TrainerProgress"
        children={() => (
          <PlaceholderScreen title="Progress" />
        )}
        options={{
          title: "Progress",
        }}
      />

      <Tab.Screen
        name="TrainerProfile"
        children={() => (
          <PlaceholderScreen title="Profile" />
        )}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f6fa",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 8,
    color: "#777",
    textAlign: "center",
  },
});

export default TrainerTabNavigator;