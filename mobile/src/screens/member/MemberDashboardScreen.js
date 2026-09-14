import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const MemberDashboardScreen = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await api.get("/member-portal/dashboard");

      console.log(
        "MEMBER DASHBOARD RESPONSE:",
        response.data
      );

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      } else {
        setError(
          response.data.message || "Failed to load dashboard"
        );
      }
    } catch (error) {
      console.log(
        "Member dashboard error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load member dashboard"
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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadDashboard}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const member = dashboard?.member;
  const membership = dashboard?.membership;

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
        <Text style={styles.title}>
          Welcome, {member?.name || user?.name || "Member"} 👋
        </Text>

        <Text style={styles.email}>
          {member?.email || user?.email || ""}
        </Text>
      </View>

      {/* Membership */}
      <View style={styles.membershipCard}>
        <Text style={styles.cardLabel}>
          Current Membership
        </Text>

        {membership ? (
          <>
            <Text style={styles.packageName}>
              {membership.package?.name || "Membership"}
            </Text>

            <View style={styles.membershipRow}>
              <View>
                <Text style={styles.smallLabel}>
                  Status
                </Text>

                <Text style={styles.status}>
                  {membership.status}
                </Text>
              </View>

              <View>
                <Text style={styles.smallLabel}>
                  Expires
                </Text>

                <Text style={styles.date}>
                  {membership.endDate
                    ? new Date(
                        membership.endDate
                      ).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.membershipRow}>
              <View>
                <Text style={styles.smallLabel}>
                  Amount
                </Text>

                <Text style={styles.amount}>
                  Rs.{" "}
                  {Number(
                    membership.finalAmount || 0
                  ).toLocaleString()}
                </Text>
              </View>

              <View>
                <Text style={styles.smallLabel}>
                  Payment
                </Text>

                <Text style={styles.paymentStatus}>
                  {membership.paymentStatus}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.empty}>
            No active membership
          </Text>
        )}
      </View>

      {/* Statistics */}
      <View style={styles.grid}>
        <StatCard
          title="Total Visits"
          value={
            dashboard?.attendance?.totalVisits ?? 0
          }
        />

        <StatCard
          title="Workout Plans"
          value={
            dashboard?.workoutPlans?.length ?? 0
          }
        />

        <StatCard
          title="Progress Records"
          value={
            dashboard?.recentProgress?.length ?? 0
          }
        />

        <StatCard
          title="Notifications"
          value={
            dashboard?.notifications?.unread ?? 0
          }
        />
      </View>

      {/* Workout Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          My Workout Plans
        </Text>

        {dashboard?.workoutPlans?.length > 0 ? (
          dashboard.workoutPlans.map((plan) => (
            <View
              key={plan._id}
              style={styles.listItem}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>
                  {plan.name}
                </Text>

                <Text style={styles.itemSubtitle}>
                  {plan.difficulty || "General"} •{" "}
                  {plan.goal || "Fitness"}
                </Text>

                <Text style={styles.trainer}>
                  Trainer:{" "}
                  {plan.trainer?.user?.name ||
                    "Not assigned"}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            No workout plans assigned
          </Text>
        )}
      </View>

      {/* Recent Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Progress
        </Text>

        {dashboard?.recentProgress?.length > 0 ? (
          dashboard.recentProgress.map((item) => (
            <View
              key={item._id}
              style={styles.listItem}
            >
              <View>
                <Text style={styles.itemTitle}>
                  Weight: {item.weight} kg
                </Text>

                <Text style={styles.itemSubtitle}>
                  {item.recordedAt
                    ? new Date(
                        item.recordedAt
                      ).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View>

              {item.bodyFat !== undefined &&
                item.bodyFat !== null && (
                  <Text style={styles.value}>
                    Body Fat: {item.bodyFat}%
                  </Text>
                )}
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            No progress records
          </Text>
        )}
      </View>

      {/* Recent Payments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Payments
        </Text>

        {dashboard?.recentPayments?.length > 0 ? (
          dashboard.recentPayments.map((payment) => (
            <View
              key={payment._id}
              style={styles.listItem}
            >
              <View>
                <Text style={styles.itemTitle}>
                  {payment.receiptNumber}
                </Text>

                <Text style={styles.itemSubtitle}>
                  {payment.paymentMethod}
                </Text>
              </View>

              <Text style={styles.amount}>
                Rs.{" "}
                {Number(
                  payment.amount || 0
                ).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            No payment history
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>
        {title}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
};

export default MemberDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  error: {
    color: "#d00",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
  },

  email: {
    color: "#777",
    marginTop: 5,
    fontSize: 14,
  },

  membershipCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  cardLabel: {
    color: "#aaa",
    fontSize: 13,
  },

  packageName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 20,
  },

  membershipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  smallLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 4,
  },

  status: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  date: {
    color: "#fff",
    fontWeight: "600",
  },

  amount: {
    fontWeight: "bold",
  },

  paymentStatus: {
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
  },

  statTitle: {
    color: "#777",
    fontSize: 13,
    marginBottom: 8,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "bold",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 15,
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  itemSubtitle: {
    color: "#777",
    marginTop: 4,
    fontSize: 13,
  },

  trainer: {
    color: "#555",
    marginTop: 5,
    fontSize: 13,
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
  },

  empty: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 15,
  },
});