import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const AdminDashboardScreen = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // GET MEMBER NAME

  const getMemberName = (member) => {
    if (!member) return "";

    return (
      member?.user?.name ||
      member?.user?.fullName ||
      member?.name ||
      member?.fullName ||
      member?.memberName ||
      ""
    );
  };

  // GET MEMBER EMAIL

  const getMemberEmail = (member) => {
    if (!member) return "";

    return (
      member?.user?.email ||
      member?.email ||
      ""
    );
  };

  // GET PAYMENT MEMBER

  const getPaymentMember = (payment) => {
    if (!payment) return null;

    return (
      payment?.member ||
      payment?.membership?.member ||
      payment?.user ||
      null
    );
  };
  // GET PAYMENT MEMBER NAME

  const getPaymentMemberName = (payment) => {
    const member = getPaymentMember(payment);

    if (!member) {
      return "";
    }

    return getMemberName(member);
  };

  // LOAD DASHBOARD

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/admin/dashboard");

      console.log(
        "===================================="
      );

      console.log(
        "ADMIN DASHBOARD RESPONSE:"
      );

      console.log(
        JSON.stringify(response.data, null, 2)
      );

      console.log(
        "===================================="
      );

      if (response?.data?.success) {
        const dashboardData =
          response?.data?.dashboard || {};

        setDashboard(dashboardData);
      } else {
        setError(
          response?.data?.message ||
            "Failed to load dashboard"
        );
      }
    } catch (err) {
      console.log(
        "ADMIN DASHBOARD ERROR:"
      );

      console.log(
        err?.response?.data || err?.message
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // INITIAL LOAD

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // REFRESH
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  // RETRY

  const handleRetry = () => {
    setLoading(true);
    setError("");
    loadDashboard();
  };

  // LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  // ERROR
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.error}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SAFE DATA

  const totalMembers =
    dashboard?.members?.total ?? 0;

  const activeMembers =
    dashboard?.members?.active ?? 0;

  const totalTrainers =
    dashboard?.trainers?.total ?? 0;

  const activeTrainers =
    dashboard?.trainers?.active ?? 0;

  const activeMemberships =
    dashboard?.memberships?.active ?? 0;

  const expiredMemberships =
    dashboard?.memberships?.expired ?? 0;

  const upcomingMemberships =
    dashboard?.memberships?.upcoming ?? 0;

  const todayAttendance =
    dashboard?.attendance?.today ?? 0;

  const totalRevenue =
    Number(
      dashboard?.revenue?.total ?? 0
    );

  const recentPayments =
    Array.isArray(
      dashboard?.recentPayments
    )
      ? dashboard.recentPayments
      : [];

  const recentMembers =
    Array.isArray(
      dashboard?.recentMembers
    )
      ? dashboard.recentMembers
      : [];

  // DASHBOARD
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
      showsVerticalScrollIndicator={false}
    >
      {/*HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Admin Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Welcome, {user?.name || "Admin"}
        </Text>
      </View>

      {/*STATISTICS*/}

      <View style={styles.grid}>
        <StatCard
          title="Total Members"
          value={totalMembers}
        />

        <StatCard
          title="Active Members"
          value={activeMembers}
        />

        <StatCard
          title="Trainers"
          value={totalTrainers}
        />

        <StatCard
          title="Active Trainers"
          value={activeTrainers}
        />

        <StatCard
          title="Active Memberships"
          value={activeMemberships}
        />

        <StatCard
          title="Expired Memberships"
          value={expiredMemberships}
        />

        <StatCard
          title="Upcoming Memberships"
          value={upcomingMemberships}
        />

        <StatCard
          title="Today's Attendance"
          value={todayAttendance}
        />
      </View>

      {/*REVENUE */}

      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>
          Total Revenue
        </Text>

        <Text style={styles.revenue}>
          Rs.{" "}
          {totalRevenue.toLocaleString()}
        </Text>
      </View>

      {/*RECENT PAYMENTS*/}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Payments
        </Text>

        {recentPayments.length > 0 ? (
          recentPayments.map(
            (payment, index) => {
              const memberName =
                getPaymentMemberName(
                  payment
                );

              const amount =
                Number(
                  payment?.amount ?? 0
                );

              const paymentMethod =
                payment?.paymentMethod ||
                payment?.method ||
                "Payment";

              /*
               * If payment has no member
               * information, don't display it.
               */
              if (!memberName) {
                return null;
              }

              return (
                <View
                  key={
                    payment?._id ||
                    payment?.id ||
                    `payment-${index}`
                  }
                  style={styles.listItem}
                >
                  <View
                    style={styles.itemInfo}
                  >
                    <Text
                      style={
                        styles.itemTitle
                      }
                    >
                      {memberName}
                    </Text>

                    <Text
                      style={
                        styles.itemSubtitle
                      }
                    >
                      {paymentMethod}
                    </Text>
                  </View>

                  <Text
                    style={styles.amount}
                  >
                    Rs.{" "}
                    {amount.toLocaleString()}
                  </Text>
                </View>
              );
            }
          )
        ) : (
          <Text style={styles.empty}>
            No recent payments
          </Text>
        )}
      </View>

      {/*RECENT MEMBERS */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recent Members
        </Text>

        {recentMembers.length > 0 ? (
          recentMembers.map(
            (member, index) => {
              const memberName =
                getMemberName(member);

              const memberEmail =
                getMemberEmail(member);

              /*
               * Don't display an empty/unknown
               * member record.
               */
              if (!memberName) {
                return null;
              }

              return (
                <View
                  key={
                    member?._id ||
                    member?.id ||
                    `member-${index}`
                  }
                  style={styles.listItem}
                >
                  <View
                    style={styles.itemInfo}
                  >
                    <Text
                      style={
                        styles.itemTitle
                      }
                    >
                      {memberName}
                    </Text>

                    {memberEmail ? (
                      <Text
                        style={
                          styles.itemSubtitle
                        }
                      >
                        {memberEmail}
                      </Text>
                    ) : null}
                  </View>

                  <Text
                    style={styles.status}
                  >
                    {member?.status ||
                      "Active"}
                  </Text>
                </View>
              );
            }
          )
        ) : (
          <Text style={styles.empty}>
            No members found
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

// STAT CARD

const StatCard = ({
  title,
  value,
}) => {
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

// STYLES

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
    backgroundColor: "#f5f6f8",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  error: {
    color: "#d00",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },

  // HEADER

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
  },

  subtitle: {
    marginTop: 5,
    color: "#666",
    fontSize: 15,
  },

  // STATISTICS

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

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  statTitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },

  statValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },

  // REVENUE
  revenueCard: {
    backgroundColor: "#111",
    padding: 22,
    borderRadius: 14,
    marginTop: 5,
    marginBottom: 25,
  },

  revenueLabel: {
    color: "#ccc",
    fontSize: 14,
  },

  revenue: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
  },

  // SECTION

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,

    elevation: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111",
  },

  // LIST

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 13,

    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  itemSubtitle: {
    color: "#777",
    marginTop: 4,
    fontSize: 13,
  },

  amount: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#111",
  },

  status: {
    color: "#555",
    textTransform: "capitalize",
    fontSize: 13,
    fontWeight: "500",
  },

  empty: {
    color: "#888",
    textAlign: "center",
    paddingVertical: 15,
  },
});

export default AdminDashboardScreen;