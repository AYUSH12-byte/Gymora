import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MemberDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Member Dashboard</Text>
      <Text>Welcome, Member</Text>
    </View>
  );
};

export default MemberDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
});