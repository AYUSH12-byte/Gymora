import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import api from "../../../services/api";

const TrainerDashboardScreen = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/trainers/dashboard");

      if (response.data?.success) {
        setDashboard(response.data.dashboard);
      } else {
        setError(
          response.data?.message || "Failed to load trainer dashboard"
        );
      }
    } catch (err) {
      console.log(
        "Trainer dashboard error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load trainer dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (error && !dashboard) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const trainer = dashboard?.trainer || {};
  const members = dashboard?.members || {};
  const workoutPlans = dashboard?.workoutPlans || {};
  const attendance = dashboard?.attendance || {};

  const assignedMembers = dashboard?.assignedMembers || [];
  const workoutPlansList = dashboard?.workoutPlansList || [];
  const todayAttendance = dashboard?.todayAttendance || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back</Text>

        <Text style={styles.name}>
          {trainer.name || "Trainer"}
        </Text>

        <Text style={styles.specialization}>
          {trainer.specialization || "Fitness Trainer"}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {members.total || 0}
          </Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {workoutPlans.total || 0}
          </Text>
          <Text style={styles.statLabel}>Workout Plans</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {attendance.today || 0}
          </Text>
          <Text style={styles.statLabel}>Today Attendance</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {trainer.experience || 0}
          </Text>
          <Text style={styles.statLabel}>Experience</Text>
        </View>
      </View>

      {/* Trainer Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Trainer Information
        </Text>

        <InfoRow
          label="Name"
          value={trainer.name || "N/A"}
        />

        <InfoRow
          label="Email"
          value={trainer.email || "N/A"}
        />

        <InfoRow
          label="Phone"
          value={trainer.phone || "N/A"}
        />

        <InfoRow
          label="Specialization"
          value={trainer.specialization || "N/A"}
        />

        <InfoRow
          label="Experience"
          value={`${trainer.experience || 0} years`}
        />

        <InfoRow
          label="Status"
          value={trainer.status || "N/A"}
        />
      </View>

      {/* Assigned Members */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Assigned Members
        </Text>

        {assignedMembers.length === 0 ? (
          <Text style={styles.emptyText}>
            No members assigned yet.
          </Text>
        ) : (
          assignedMembers.map((member) => (
            <View
              key={member._id}
              style={styles.listItem}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(
                    member.user?.name ||
                    "M"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>
                  {member.user?.name || "Unknown Member"}
                </Text>

                <Text style={styles.listSubtitle}>
                  {member.phone || "No phone"}
                </Text>

                <Text style={styles.listStatus}>
                  {member.status || "active"}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Workout Plans */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Workout Plans
        </Text>

        {workoutPlansList.length === 0 ? (
          <Text style={styles.emptyText}>
            No workout plans assigned.
          </Text>
        ) : (
          workoutPlansList.map((plan) => (
            <View
              key={plan._id}
              style={styles.planItem}
            >
              <Text style={styles.listTitle}>
                {plan.name || "Workout Plan"}
              </Text>

              <Text style={styles.listSubtitle}>
                Member:{" "}
                {plan.member?.user?.name ||
                  "Unknown Member"}
              </Text>

              <Text style={styles.listSubtitle}>
                Difficulty:{" "}
                {plan.difficulty || "beginner"}
              </Text>

              <Text style={styles.listSubtitle}>
                Goal:{" "}
                {plan.goal || "fitness"}
              </Text>

              <Text style={styles.listSubtitle}>
                Exercises:{" "}
                {plan.exercises?.length || 0}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Today's Attendance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Today's Attendance
        </Text>

        {todayAttendance.length === 0 ? (
          <Text style={styles.emptyText}>
            No attendance recorded today.
          </Text>
        ) : (
          todayAttendance.map((item) => (
            <View
              key={item._id}
              style={styles.attendanceItem}
            >
              <View>
                <Text style={styles.listTitle}>
                  {item.member?.user?.name ||
                    "Unknown Member"}
                </Text>

                <Text style={styles.listSubtitle}>
                  Check in:{" "}
                  {item.checkIn
                    ? new Date(
                        item.checkIn
                      ).toLocaleTimeString()
                    : "N/A"}
                </Text>

                <Text style={styles.listSubtitle}>
                  Check out:{" "}
                  {item.checkOut
                    ? new Date(
                        item.checkOut
                      ).toLocaleTimeString()
                    : "Not checked out"}
                </Text>
              </View>

              <Text style={styles.attendanceStatus}>
                {item.status || "present"}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Bio */}
      {trainer.bio ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            About Trainer
          </Text>

          <Text style={styles.bio}>
            {trainer.bio}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f7fb",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#666",
  },

  errorText: {
    color: "#d32f2f",
    fontSize: 15,
    textAlign: "center",
  },

  header: {
    marginBottom: 20,
  },

  welcome: {
    fontSize: 15,
    color: "#666",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginTop: 3,
  },

  specialization: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111",
  },

  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  infoLabel: {
    fontSize: 14,
    color: "#666",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    maxWidth: "60%",
    textAlign: "right",
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
  },

  listInfo: {
    flex: 1,
  },

  listTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },

  listSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },

  listStatus: {
    fontSize: 12,
    color: "#2e7d32",
    marginTop: 3,
    textTransform: "capitalize",
  },

  planItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  attendanceStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2e7d32",
    textTransform: "capitalize",
  },

  bio: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
  },
});

export default TrainerDashboardScreen;