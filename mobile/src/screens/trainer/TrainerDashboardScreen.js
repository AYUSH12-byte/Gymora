import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TrainerDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trainer Dashboard</Text>
      <Text>Welcome, Trainer</Text>
    </View>
  );
};

export default TrainerDashboardScreen;

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