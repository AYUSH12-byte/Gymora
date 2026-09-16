import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const TrainerDashboardScreen = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      /*
       * Trainer-specific dashboard endpoint.
       * We will add this backend endpoint next.
       */
      const response = await api.get("/trainer/dashboard");

      const data =
        response.data?.dashboard ||
        response.data?.data ||
        response.data;

      setDashboard(data || {});
    } catch (err) {
      console.log(
        "Trainer dashboard error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load trainer dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading trainer dashboard...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Text style={styles.error}>{error}</Text>
      </ScrollView>
    );
  }

  const members =
    dashboard?.members?.total ??
    dashboard?.assignedMembers ??
    dashboard?.membersCount ??
    0;

  const activeMembers =
    dashboard?.members?.active ??
    dashboard?.activeMembers ??
    0;

  const todayAttendance =
    dashboard?.attendance?.today ??
    dashboard?.todayAttendance ??
    0;

  const workoutPlans =
    dashboard?.workoutPlans?.total ??
    dashboard?.workoutPlansCount ??
    0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Trainer Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Manage your training activities
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>
            {members}
          </Text>

          <Text style={styles.cardLabel}>
            My Members
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>
            {activeMembers}
          </Text>

          <Text style={styles.cardLabel}>
            Active Members
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>
            {todayAttendance}
          </Text>

          <Text style={styles.cardLabel}>
            Today's Attendance
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>
            {workoutPlans}
          </Text>

          <Text style={styles.cardLabel}>
            Workout Plans
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Trainer Activities
        </Text>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>
            Member Training
          </Text>

          <Text style={styles.activityText}>
            View and manage members assigned to you.
          </Text>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>
            Workout Plans
          </Text>

          <Text style={styles.activityText}>
            Review workout plans and assigned exercises.
          </Text>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>
            Progress Tracking
          </Text>

          <Text style={styles.activityText}>
            Monitor member workout and fitness progress.
          </Text>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>
            Attendance
          </Text>

          <Text style={styles.activityText}>
            Check today's attendance and attendance history.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  center: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f6fa",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  error: {
    color: "#d32f2f",
    textAlign: "center",
    fontSize: 15,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },

  cardLabel: {
    marginTop: 6,
    color: "#777",
    fontSize: 14,
  },

  section: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#222",
  },

  activityCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  activityText: {
    marginTop: 5,
    color: "#666",
    lineHeight: 20,
  },
});

export default TrainerDashboardScreen;