import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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

const Tab = createBottomTabNavigator();

const MemberStack = createNativeStackNavigator();
const PackageStack = createNativeStackNavigator();
const MembershipStack = createNativeStackNavigator();
const TrainerStack = createNativeStackNavigator();
const WorkoutPlanStack = createNativeStackNavigator();

/* =========================
   MEMBERS STACK
========================= */

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

/* =========================
   PACKAGES STACK
========================= */

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

/* =========================
   MEMBERSHIPS STACK
========================= */

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

/* =========================
   TRAINERS STACK
========================= */

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

/* =========================
   WORKOUT PLAN STACK
========================= */

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

/* =========================
   ADMIN TABS
========================= */

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
        component={MembersStack}
      />

      <Tab.Screen
        name="Packages"
        component={PackagesStack}
      />

      <Tab.Screen
        name="Memberships"
        component={MembershipsStack}
      />

      <Tab.Screen
        name="Trainers"
        component={TrainersStack}
      />

      <Tab.Screen
        name="Workout Plans"
        component={WorkoutPlansStack}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;