import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { createDrawerNavigator } from "@react-navigation/drawer";

// Dashboard
import MemberDashboardScreen from "../screens/member/dashboard/MemberDashboardScreen";

// Membership
import MemberMembershipScreen from "../screens/member/membership/MemberMembershipScreen";

// Workout Plans
import MemberWorkoutPlansScreen from "../screens/member/workout/MemberWorkoutPlansScreen";
import MemberWorkoutPlanDetailsScreen from "../screens/member/workout/MemberWorkoutPlanDetailsScreen";

// Attendance
import MemberAttendanceScreen from "../screens/member/attendance/MemberAttendanceScreen";
import QRScannerScreen from "../screens/member/attendance/QRScannerScreen";

// Payments
import MemberPaymentsScreen from "../screens/member/payment/MemberPaymentsScreen";

// Progress
import MemberProgressScreen from "../screens/member/progess/MemberProgressScreen";

// Profile
import MemberProfileScreen from "../screens/member/profile/MemberProfileScreen";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { navigation, state } = props;

  const currentRoute = state.routes[state.index]?.name;

  const menuItems = [
    {
      name: "MemberDashboard",
      label: "Dashboard",
    },
    {
      name: "MemberMembership",
      label: "Membership",
    },
    {
      name: "MemberWorkoutPlans",
      label: "Workout Plans",
    },
    {
      name: "MemberAttendance",
      label: "Attendance",
    },
    {
      name: "MemberQRScanner",
      label: "Scan Attendance QR",
    },
    {
      name: "MemberPayments",
      label: "Payments",
    },
    {
      name: "MemberProgress",
      label: "Progress",
    },
    {
      name: "MemberProfile",
      label: "Profile",
    },
  ];

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>M</Text>
        </View>

        <Text style={styles.drawerTitle}>Member Panel</Text>

        <Text style={styles.drawerSubtitle}>Gym Management</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.name;

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.activeMenuItem]}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.menuLabel,
                  isActive && styles.activeMenuLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.drawerFooter}>
        <Text style={styles.footerTitle}>Member Account</Text>

        <Text style={styles.footerText}>
          Manage your gym activity
        </Text>
      </View>
    </View>
  );
};

const MemberDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} />
      )}
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
        name="MemberDashboard"
        component={MemberDashboardScreen}
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
        }}
      />

      {/* Membership */}
      <Drawer.Screen
        name="MemberMembership"
        component={MemberMembershipScreen}
        options={{
          title: "Membership",
          drawerLabel: "Membership",
        }}
      />

      {/* Workout Plans */}
      <Drawer.Screen
        name="MemberWorkoutPlans"
        component={MemberWorkoutPlansScreen}
        options={{
          title: "Workout Plans",
          drawerLabel: "Workout Plans",
        }}
      />

      {/* Workout Plan Details */}
      <Drawer.Screen
        name="MemberWorkoutPlanDetails"
        component={MemberWorkoutPlanDetailsScreen}
        options={{
          title: "Workout Details",
          drawerItemStyle: {
            display: "none",
          },
        }}
      />

      {/* Attendance */}
      <Drawer.Screen
        name="MemberAttendance"
        component={MemberAttendanceScreen}
        options={{
          title: "Attendance",
          drawerLabel: "Attendance",
        }}
      />

      {/* QR Scanner */}
      <Drawer.Screen
        name="MemberQRScanner"
        component={QRScannerScreen}
        options={{
          title: "Scan Attendance QR",
          drawerLabel: "Scan Attendance QR",
        }}
      />

      {/* Payments */}
      <Drawer.Screen
        name="MemberPayments"
        component={MemberPaymentsScreen}
        options={{
          title: "Payments",
          drawerLabel: "Payments",
        }}
      />

      {/* Progress */}
      <Drawer.Screen
        name="MemberProgress"
        component={MemberProgressScreen}
        options={{
          title: "Progress",
          drawerLabel: "Progress",
        }}
      />

      {/* Profile */}
      <Drawer.Screen
        name="MemberProfile"
        component={MemberProfileScreen}
        options={{
          title: "Profile",
          drawerLabel: "Profile",
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  drawerHeader: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
  },

  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
  },

  drawerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  drawerSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 4,
  },

  menuContainer: {
    paddingTop: 15,
    paddingHorizontal: 12,
  },

  menuItem: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 9,
    marginBottom: 4,
  },

  activeMenuItem: {
    backgroundColor: "#eff6ff",
  },

  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  activeMenuLabel: {
    color: "#2563eb",
    fontWeight: "800",
  },

  drawerFooter: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 18,
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  footerText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});

export default MemberDrawerNavigator;