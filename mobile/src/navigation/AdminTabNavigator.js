import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Admin Dashboard
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";

// Members
import MembersScreen from "../screens/admin/MembersScreen";
import MemberDetailsScreen from "../screens/admin/MemberDetailsScreen";
import AddMemberScreen from "../screens/admin/AddMemberScreen";

// Packages
import PackagesScreen from "../screens/admin/PackagesScreen";
import AddPackageScreen from "../screens/admin/AddPackageScreen";
import EditPackageScreen from "../screens/admin/EditPackageScreen";

// Memberships
import MembershipsScreen from "../screens/admin/MembershipsScreen";
import RenewMembershipScreen from "../screens/admin/RenewMembershipScreen";

const Tab = createBottomTabNavigator();

const MemberStack = createNativeStackNavigator();
const PackageStack = createNativeStackNavigator();
const MembershipStack = createNativeStackNavigator();

/*MEMBERS STACK*/

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

/* PACKAGES STACK*/

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

/* MEMBERSHIP STACK*/

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
        name="RenewMembership"
        component={RenewMembershipScreen}
        options={{
          title: "Renew Membership",
        }}
      />
    </MembershipStack.Navigator>
  );
};

/*  ADMIN TAB NAVIGATOR= */

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
          fontSize: 12,
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

      {/* Packages */}
      <Tab.Screen
        name="Packages"
        component={PackagesStack}
        options={{
          title: "Packages",
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
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;
