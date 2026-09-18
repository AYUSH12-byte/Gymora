import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";

import { View, Text, StyleSheet } from "react-native";
// Dashboard
import AdminDashboardScreen from "../screens/admin/dashboard/AdminDashboardScreen";

// Member screens
import MembersScreen from "../screens/admin/member/MembersScreen";
import AddMemberScreen from "../screens/admin/member/AddMemberScreen";
import MemberDetailsScreen from "../screens/admin/member/MemberDetailsScreen";

// Membership screens
import MembershipsScreen from "../screens/admin/membership/MembershipsScreen";
import MembershipDetailsScreen from "../screens/admin/membership/MembershipDetailsScreen";
import RenewMembershipScreen from "../screens/admin/membership/RenewMembershipScreen";

// Package screens
import PackagesScreen from "../screens/admin/package/PackagesScreen";
import AddPackageScreen from "../screens/admin/package/AddPackageScreen";
import EditPackageScreen from "../screens/admin/package/EditPackageScreen";

// Trainer screens
import TrainersScreen from "../screens/admin/trainer/TrainersScreen";
import AddTrainerScreen from "../screens/admin/trainer/AddTrainerScreen";
import TrainerDetailsScreen from "../screens/admin/trainer/TrainerDetailsScreen";
import EditTrainerScreen from "../screens/admin/trainer/EditTrainerScreen";

// Workout screens
import WorkoutPlansScreen from "../screens/admin/workout/WorkoutPlansScreen";
import AddWorkoutPlanScreen from "../screens/admin/workout/AddWorkoutPlanScreen";
import WorkoutPlanDetailsScreen from "../screens/admin/workout/WorkoutPlanDetailsScreen";
import EditWorkoutPlanScreen from "../screens/admin/workout/EditWorkoutPlanScreen";

// Attendance screens
import AttendanceScreen from "../screens/admin/attendance/AttendanceScreen";
import QRScannerScreen from "../screens/admin/qr/QRScannerScreen";

// Progress screens
import ProgressScreen from "../screens/admin/progress/ProgressScreen";
import AddProgressScreen from "../screens/admin/progress/AddProgressScreen";
import ProgressDetailsScreen from "../screens/admin/progress/ProgressDetailsScreen";
import EditProgressScreen from "../screens/admin/progress/EditProgressScreen";

// Notification screens
import NotificationsScreen from "../screens/admin/notification/NotificationsScreen";

// Report screens
import ReportsScreen from "../screens/admin/report/ReportsScreen";

// Profile screens
import AdminProfileScreen from "../screens/admin/profile/AdminProfileScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Drawer = createDrawerNavigator();

const MemberStack = createNativeStackNavigator();
const PackageStack = createNativeStackNavigator();
const MembershipStack = createNativeStackNavigator();
const TrainerStack = createNativeStackNavigator();
const WorkoutPlanStack = createNativeStackNavigator();

const MembersStack = () => {
  return (
    <MemberStack.Navigator>
      <MemberStack.Screen
        name="MembersList"
        component={MembersScreen}
        options={{ title: "Members" }}
      />

      <MemberStack.Screen
        name="MemberDetails"
        component={MemberDetailsScreen}
        options={{ title: "Member Details" }}
      />

      <MemberStack.Screen
        name="AddMember"
        component={AddMemberScreen}
        options={{ title: "Add Member" }}
      />
    </MemberStack.Navigator>
  );
};

const PackagesStack = () => {
  return (
    <PackageStack.Navigator>
      <PackageStack.Screen
        name="PackagesList"
        component={PackagesScreen}
        options={{ title: "Membership Packages" }}
      />

      <PackageStack.Screen
        name="AddPackage"
        component={AddPackageScreen}
        options={{ title: "Add Package" }}
      />

      <PackageStack.Screen
        name="EditPackage"
        component={EditPackageScreen}
        options={{ title: "Edit Package" }}
      />
    </PackageStack.Navigator>
  );
};

const MembershipsStack = () => {
  return (
    <MembershipStack.Navigator>
      <MembershipStack.Screen
        name="MembershipsList"
        component={MembershipsScreen}
        options={{ title: "Memberships" }}
      />

      <MembershipStack.Screen
        name="RenewMembership"
        component={RenewMembershipScreen}
        options={{ title: "Renew Membership" }}
      />

      <MembershipStack.Screen
        name="MembershipDetails"
        component={MembershipDetailsScreen}
        options={{ title: "Membership Details" }}
      />
    </MembershipStack.Navigator>
  );
};

const TrainersStack = () => {
  return (
    <TrainerStack.Navigator>
      <TrainerStack.Screen
        name="TrainersList"
        component={TrainersScreen}
        options={{ title: "Trainers" }}
      />

      <TrainerStack.Screen
        name="AddTrainer"
        component={AddTrainerScreen}
        options={{ title: "Add Trainer" }}
      />

      <TrainerStack.Screen
        name="TrainerDetails"
        component={TrainerDetailsScreen}
        options={{ title: "Trainer Details" }}
      />

      <TrainerStack.Screen
        name="EditTrainer"
        component={EditTrainerScreen}
        options={{ title: "Edit Trainer" }}
      />
    </TrainerStack.Navigator>
  );
};

const WorkoutPlansStack = () => {
  return (
    <WorkoutPlanStack.Navigator>
      <WorkoutPlanStack.Screen
        name="WorkoutPlansList"
        component={WorkoutPlansScreen}
        options={{ title: "Workout Plans" }}
      />

      <WorkoutPlanStack.Screen
        name="AddWorkoutPlan"
        component={AddWorkoutPlanScreen}
        options={{ title: "Add Workout Plan" }}
      />

      <WorkoutPlanStack.Screen
        name="WorkoutPlanDetails"
        component={WorkoutPlanDetailsScreen}
        options={{ title: "Workout Plan Details" }}
      />

      <WorkoutPlanStack.Screen
        name="EditWorkoutPlan"
        component={EditWorkoutPlanScreen}
        options={{ title: "Edit Workout Plan" }}
      />
    </WorkoutPlanStack.Navigator>
  );
};

const AttendanceStack = createNativeStackNavigator();

const AttendanceStackScreen = () => {
  return (
    <AttendanceStack.Navigator>
      <AttendanceStack.Screen
        name="AttendanceList"
        component={AttendanceScreen}
        options={{
          title: "Attendance",
        }}
      />

   
    </AttendanceStack.Navigator>
  );
};

const ProgressStack = createNativeStackNavigator();

const ProgressStackScreen = () => {
  return (
    <ProgressStack.Navigator>
      <ProgressStack.Screen
        name="ProgressList"
        component={ProgressScreen}
        options={{
          title: "Progress",
        }}
      />

      <ProgressStack.Screen
        name="AddProgress"
        component={AddProgressScreen}
        options={{
          title: "Add Progress",
        }}
      />
      <ProgressStack.Screen
        name="ProgressDetails"
        component={ProgressDetailsScreen}
        options={{
          title: "Progress Details",
        }}
      />

      <ProgressStack.Screen
        name="EditProgress"
        component={EditProgressScreen}
        options={{
          title: "Edit Progress",
        }}
      />
    </ProgressStack.Navigator>
  );
};

const NotificationStack = createNativeStackNavigator();

const NotificationsStack = () => {
  return (
    <NotificationStack.Navigator>
      <NotificationStack.Screen
        name="NotificationsList"
        component={NotificationsScreen}
        options={{
          title: "Notifications",
        }}
      />
    </NotificationStack.Navigator>
  );
};

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>G</Text>
        </View>

        <Text style={styles.appName}>GYM MANAGEMENT</Text>
        <Text style={styles.adminText}>Admin Panel</Text>
      </View>

      <View style={styles.menuContainer}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Gym Management System</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const AdminTabNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,

        drawerType: "slide",

        drawerStyle: {
          width: 280,
        },

        drawerActiveTintColor: "#111",
        drawerInactiveTintColor: "#666",

        drawerActiveBackgroundColor: "#f0f0f0",

        drawerLabelStyle: {
          marginLeft: -10,
          fontSize: 15,
          fontWeight: "600",
        },

        headerStyle: {
          backgroundColor: "#111",
        },

        headerTintColor: "#fff",

        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
        }}
      />

      <Drawer.Screen
        name="Members"
        component={MembersStack}
        options={{
          title: "Members",
          drawerLabel: "Members",
        }}
      />

      <Drawer.Screen
        name="Packages"
        component={PackagesStack}
        options={{
          title: "Packages",
          drawerLabel: "Membership Packages",
        }}
      />

      <Drawer.Screen
        name="Memberships"
        component={MembershipsStack}
        options={{
          title: "Memberships",
          drawerLabel: "Memberships",
        }}
      />

      <Drawer.Screen
        name="Trainers"
        component={TrainersStack}
        options={{
          title: "Trainers",
          drawerLabel: "Trainers",
        }}
      />

      <Drawer.Screen
        name="WorkoutPlans"
        component={WorkoutPlansStack}
        options={{
          title: "Workout Plans",
          drawerLabel: "Workout Plans",
        }}
      />

      <Drawer.Screen
        name="Attendance"
        component={AttendanceStackScreen}
        options={{
          title: "Attendance",
          drawerLabel: "Attendance",
        }}
      />
      <Drawer.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          title: "QR Scanner",
          drawerLabel: "QR Scanner",
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Progress"
        component={ProgressStackScreen}
        options={{
          title: "Progress",
          drawerLabel: "Progress",
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          title: "Notification",
          drawerLabel: "Notification",
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: "Reports",
          drawerLabel: "Reports",
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={AdminProfileScreen}
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
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },

  appName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },

  adminText: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },

  menuContainer: {
    paddingTop: 10,
  },

  footer: {
    marginTop: "auto",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },

  versionText: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
});

export default AdminTabNavigator;
