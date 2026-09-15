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

const Tab = createBottomTabNavigator();

const MemberStack = createNativeStackNavigator();
const MembershipStack = createNativeStackNavigator();
const PackageStack = createNativeStackNavigator();

/* =========================
   MEMBER STACK
========================= */

const MembersStack = () => {
  return (
    <MemberStack.Navigator>
      <MemberStack.Screen
        name="MembersList"
        component={MembersScreen}
        options={{
          title: "Members",
        }}
      />

      <MemberStack.Screen
        name="AddMember"
        component={AddMemberScreen}
        options={{
          title: "Add Member",
        }}
      />

      <MemberStack.Screen
        name="MemberDetails"
        component={MemberDetailsScreen}
        options={{
          title: "Member Details",
        }}
      />
    </MemberStack.Navigator>
  );
};

/* =========================
   MEMBERSHIP STACK
========================= */

const MembershipsStack = () => {
  return (
    <MembershipStack.Navigator>
      <MembershipStack.Screen
        name="MembershipsList"
        component={MembershipsScreen}
        options={{
          title: "Memberships",
        }}
      />

      <MembershipStack.Screen
        name="MembershipDetails"
        component={MembershipDetailsScreen}
        options={{
          title: "Membership Details",
        }}
      />

      <MembershipStack.Screen
        name="RenewMembership"
        component={RenewMembershipScreen}
        options={{
          title: "Renew Membership",
        }}
      />
    </MembershipStack.Navigator>
  );
};

/* =========================
   PACKAGE STACK
========================= */

const PackagesStack = () => {
  return (
    <PackageStack.Navigator>
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

/* =========================
   ADMIN TAB NAVIGATOR
========================= */

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#888888",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 5,
        },
      }}
    >
      {/* Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
        }}
      />

      {/* Members */}
      <Tab.Screen
        name="Members"
        component={MembersStack}
        options={{
          title: "Members",
        }}
      />

      {/* Memberships */}
      <Tab.Screen
        name="Memberships"
        component={MembershipsStack}
        options={{
          title: "Memberships",
        }}
      />

      {/* Packages */}
      <Tab.Screen
        name="Packages"
        component={PackagesStack}
        options={{
          title: "Packages",
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;