import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const AdminDashboardScreen = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await api.get("/admin/dashboard");

      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (error) {
      console.log(
        "Dashboard error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
      </View>
    );
  }

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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>

          <Text style={styles.subtitle}>
            Welcome, {user?.name || "Admin"}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatCard
          title="Total Members"
          value={dashboard?.totalMembers ?? 0}
        />

        <StatCard
          title="Active Members"
          value={dashboard?.activeMembers ?? 0}
        />

        <StatCard
          title="Trainers"
          value={dashboard?.totalTrainers ?? 0}
        />

        <StatCard
          title="Active Memberships"
          value={dashboard?.activeMemberships ?? 0}
        />

        <StatCard
          title="Today's Attendance"
          value={dashboard?.todayAttendance ?? 0}
        />

        <StatCard
          title="Expiring Soon"
          value={dashboard?.expiringMemberships ?? 0}
        />
      </View>

      <View style={styles.revenueCard}>
        <Text style={styles.cardTitle}>Total Revenue</Text>

        <Text style={styles.revenue}>
          Rs. {Number(dashboard?.totalRevenue || 0).toLocaleString()}
        </Text>
      </View>

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
                  {payment.member?.user?.name ||
                    "Unknown Member"}
                </Text>

                <Text style={styles.itemSubtitle}>
                  {payment.paymentMethod}
                </Text>
              </View>

              <Text style={styles.amount}>
                Rs. {Number(payment.amount).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            No recent payments
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Members
        </Text>

        {dashboard?.recentMembers?.length > 0 ? (
          dashboard.recentMembers.map((member) => (
            <View
              key={member._id}
              style={styles.listItem}
            >
              <View>
                <Text style={styles.itemTitle}>
                  {member.user?.name || "Unknown Member"}
                </Text>

                <Text style={styles.itemSubtitle}>
                  {member.phone || "No phone"}
                </Text>
              </View>

              <Text style={styles.status}>
                {member.status}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            No members found
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>

      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

export default AdminDashboardScreen;

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
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 5,
    color: "#666",
    fontSize: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
  },

  statTitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "bold",
  },

  revenueCard: {
    backgroundColor: "#111",
    padding: 22,
    borderRadius: 14,
    marginTop: 5,
    marginBottom: 25,
  },

  cardTitle: {
    color: "#ccc",
    fontSize: 14,
  },

  revenue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
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
    alignItems: "center",
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

  amount: {
    fontWeight: "bold",
  },

  status: {
    color: "#555",
    textTransform: "capitalize",
  },

  empty: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 15,
  },
});