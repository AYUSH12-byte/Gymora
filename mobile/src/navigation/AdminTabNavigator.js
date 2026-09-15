import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";

// Dashboard
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";

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

const Drawer = createDrawerNavigator();

const MemberStack = createNativeStackNavigator();
const PackageStack = createNativeStackNavigator();
const MembershipStack = createNativeStackNavigator();
const TrainerStack = createNativeStackNavigator();
const WorkoutPlanStack = createNativeStackNavigator();

/*
|--------------------------------------------------------------------------
| Members Stack
|--------------------------------------------------------------------------
*/

const MembersStack = () => {
  return (
    <MemberStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <MemberStack.Screen
        name="MembersList"
        component={MembersScreen}
        options={{
          title: "Members",
        }}
      />

      <MemberStack.Screen
        name="MemberDetails"
        component={MemberDetailsScreen}
        options={{
          title: "Member Details",
        }}
      />

      <MemberStack.Screen
        name="AddMember"
        component={AddMemberScreen}
        options={{
          title: "Add Member",
        }}
      />
    </MemberStack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| Packages Stack
|--------------------------------------------------------------------------
*/

const PackagesStack = () => {
  return (
    <PackageStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <PackageStack.Screen
        name="PackagesList"
        component={PackagesScreen}
        options={{
          title: "Membership Packages",
        }}
      />

      <PackageStack.Screen
        name="AddPackage"
        component={AddPackageScreen}
        options={{
          title: "Add Package",
        }}
      />

      <PackageStack.Screen
        name="EditPackage"
        component={EditPackageScreen}
        options={{
          title: "Edit Package",
        }}
      />
    </PackageStack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| Membership Stack
|--------------------------------------------------------------------------
*/

const MembershipsStack = () => {
  return (
    <MembershipStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <MembershipStack.Screen
        name="MembershipsList"
        component={MembershipsScreen}
        options={{
          title: "Memberships",
        }}
      />

      <MembershipStack.Screen
        name="RenewMembership"
        component={RenewMembershipScreen}
        options={{
          title: "Renew Membership",
        }}
      />

      <MembershipStack.Screen
        name="MembershipDetails"
        component={MembershipDetailsScreen}
        options={{
          title: "Membership Details",
        }}
      />
    </MembershipStack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| Trainers Stack
|--------------------------------------------------------------------------
*/

const TrainersStack = () => {
  return (
    <TrainerStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <TrainerStack.Screen
        name="TrainersList"
        component={TrainersScreen}
        options={{
          title: "Trainers",
        }}
      />

      <TrainerStack.Screen
        name="AddTrainer"
        component={AddTrainerScreen}
        options={{
          title: "Add Trainer",
        }}
      />

      <TrainerStack.Screen
        name="TrainerDetails"
        component={TrainerDetailsScreen}
        options={{
          title: "Trainer Details",
        }}
      />

      <TrainerStack.Screen
        name="EditTrainer"
        component={EditTrainerScreen}
        options={{
          title: "Edit Trainer",
        }}
      />
    </TrainerStack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| Workout Plans Stack
|--------------------------------------------------------------------------
*/

const WorkoutPlansStack = () => {
  return (
    <WorkoutPlanStack.Navigator>
      <WorkoutPlanStack.Screen
        name="WorkoutPlansList"
        component={WorkoutPlansScreen}
        options={{
          title: "Workout Plans",
        }}
      />

      <WorkoutPlanStack.Screen
        name="AddWorkoutPlan"
        component={AddWorkoutPlanScreen}
        options={{
          title: "Add Workout Plan",
        }}
      />

      <WorkoutPlanStack.Screen
        name="WorkoutPlanDetails"
        component={WorkoutPlanDetailsScreen}
        options={{
          title: "Workout Plan Details",
        }}
      />

      <WorkoutPlanStack.Screen
        name="EditWorkoutPlan"
        component={EditWorkoutPlanScreen}
        options={{
          title: "Edit Workout Plan",
        }}
      />
    </WorkoutPlanStack.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| Custom Drawer
|--------------------------------------------------------------------------
*/

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>G</Text>
        </View>

        <Text style={styles.appName}>GYM MANAGEMENT</Text>

        <Text style={styles.adminText}>Admin Panel</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gym Management System</Text>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

/*
|--------------------------------------------------------------------------
| Admin Drawer Navigator
|--------------------------------------------------------------------------
*/

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
      {/* Dashboard */}
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
        }}
      />

      {/* Members */}
      <Drawer.Screen
        name="Members"
        component={MembersStack}
        options={{
          title: "Members",
          drawerLabel: "Members",
          headerShown: false,
        }}
      />

      {/* Packages */}
      <Drawer.Screen
        name="Packages"
        component={PackagesStack}
        options={{
          title: "Membership Packages",
          drawerLabel: "Membership Packages",
          headerShown: false,
        }}
      />

      {/* Memberships */}
      <Drawer.Screen
        name="Memberships"
        component={MembershipsStack}
        options={{
          title: "Memberships",
          drawerLabel: "Memberships",
          headerShown: false,
        }}
      />

      {/* Trainers */}
      <Drawer.Screen
        name="Trainers"
        component={TrainersStack}
        options={{
          title: "Trainers",
          drawerLabel: "Trainers",
          headerShown: false,
        }}
      />

      {/* Workout Plans */}
      <Drawer.Screen
        name="WorkoutPlans"
        component={WorkoutPlansStack}
        options={{
          title: "Workout Plans",
          drawerLabel: "Workout Plans",
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
};

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

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
