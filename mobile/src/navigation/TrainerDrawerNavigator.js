import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { createDrawerNavigator } from "@react-navigation/drawer";

// Dashboard
import TrainerDashboardScreen from "../screens/trainer/dashboard/TrainerDashboardScreen";

// Members
import TrainerMembersScreen from "../screens/trainer/my member/TrainerMembersScreen";

// Workout Plans
import TrainerWorkoutPlansScreen from "../screens/trainer/workout plans/TrainerWorkoutPlansScreen";
import TrainerWorkoutPlanDetailsScreen from "../screens/trainer/workout plans/TrainerWorkoutPlanDetailsScreen";

// Attendance
import TrainerAttendanceScreen from "../screens/trainer/attendance/TrainerAttendanceScreen";

// Profile
import TrainerProfileScreen from "../screens/trainer/profile/TrainerProfileScreen";
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { navigation, state } = props;

  const currentRoute = state.routes[state.index]?.name;

  const menuItems = [
    {
      name: "TrainerDashboard",
      label: "Dashboard",
    },
    {
      name: "TrainerMembers",
      label: "My Members",
    },
    {
      name: "TrainerWorkoutPlans",
      label: "Workout Plans",
    },
    {
      name: "TrainerAttendance",
      label: "Attendance",
    },
    {
      name: "TrainerProfile",
      label: "Profile",
    },
  ];

  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileLetter}>T</Text>
        </View>

        <Text style={styles.drawerTitle}>Trainer Panel</Text>

        <Text style={styles.drawerSubtitle}>Gym Management</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.activeMenuItem]}
              onPress={() => navigation.navigate(item.name)}
            >
              <Text
                style={[styles.menuText, isActive && styles.activeMenuText]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gym Management System</Text>

        <Text style={styles.authorText}>Developed by Ayush Chaudhari</Text>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const TrainerDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: "#111827",
        },

        headerTintColor: "#fff",

        headerTitleStyle: {
          fontWeight: "700",
        },

        drawerType: "front",

        drawerStyle: {
          width: 285,
        },
      }}
    >
      {/* Dashboard */}
      <Drawer.Screen
        name="TrainerDashboard"
        component={TrainerDashboardScreen}
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
        }}
      />

      {/* Members */}
      <Drawer.Screen
        name="TrainerMembers"
        component={TrainerMembersScreen}
        options={{
          title: "Members",
          drawerLabel: "My Members",
        }}
      />

      {/* Workout Plans */}
      <Drawer.Screen
        name="TrainerWorkoutPlans"
        component={TrainerWorkoutPlansScreen}
        options={{
          title: "Workout Plans",
          drawerLabel: "Workout Plans",
        }}
      />

      {/* Workout Plan Details */}
      <Drawer.Screen
        name="TrainerWorkoutPlanDetails"
        component={TrainerWorkoutPlanDetailsScreen}
        options={{
          title: "Workout Details",
          drawerItemStyle: {
            display: "none",
          },
        }}
      />

      {/* Attendance */}
      <Drawer.Screen
        name="TrainerAttendance"
        component={TrainerAttendanceScreen}
        options={{
          title: "Attendance",
          drawerLabel: "Attendance",
        }}
      />

      {/* Profile - Coming Next */}
      <Drawer.Screen
        name="TrainerProfile"
        component={TrainerProfileScreen}
        options={{
          title: "Profile",
          drawerLabel: "Profile",
        }}
      />
    </Drawer.Navigator>
  );
};

const PlaceholderScreen = ({ title }) => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>{title}</Text>

      <Text style={styles.placeholderText}>
        This section will be added next.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  drawerHeader: {
    backgroundColor: "#111827",
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },

  profileCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  profileLetter: {
    fontSize: 25,
    fontWeight: "700",
    color: "#fff",
  },

  drawerTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#fff",
  },

  drawerSubtitle: {
    fontSize: 13,
    color: "#d1d5db",
    marginTop: 4,
  },

  menuContainer: {
    paddingTop: 15,
    paddingHorizontal: 12,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },

  activeMenuItem: {
    backgroundColor: "#f3f4f6",
  },

  menuText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "500",
  },

  activeMenuText: {
    color: "#111827",
    fontWeight: "700",
  },

  drawerFooter: {
    marginTop: "auto",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  footerText: {
    fontSize: 12,
    color: "#9ca3af",
  },

  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },

  placeholderTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  authorText: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },

  versionText: {
    marginTop: 4,
    fontSize: 12,
    color: "#999",
  },
});

export default TrainerDrawerNavigator;
