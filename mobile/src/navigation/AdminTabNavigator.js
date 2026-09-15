import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";

import MembersScreen from "../screens/admin/MembersScreen";
import MemberDetailsScreen from "../screens/admin/MemberDetailsScreen";
import AddMemberScreen from "../screens/admin/AddMemberScreen";

import PackagesScreen from "../screens/admin/PackagesScreen";
import AddPackageScreen from "../screens/admin/AddPackageScreen";

const Tab = createBottomTabNavigator();
const MemberStack = createNativeStackNavigator();
const PackageStack = createNativeStackNavigator();

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
    </PackageStack.Navigator>
  );
};

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
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;