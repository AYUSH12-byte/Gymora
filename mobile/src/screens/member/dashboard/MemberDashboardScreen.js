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

import api from "../../../services/api";

const MemberDashboardScreen = ({ navigation }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/member-portal/dashboard");

      console.log(
        "MEMBER DASHBOARD RESPONSE:",
        JSON.stringify(response.data, null, 2),
      );

      const data =
        response.data?.dashboard || response.data?.data || response.data;

      setDashboard(data);
    } catch (err) {
      console.error(
        "Member dashboard error:",
        err?.response?.data || err.message,
      );

      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString();
  };

  const getMembership = () => {
    return (
      dashboard?.membership ||
      dashboard?.activeMembership ||
      dashboard?.currentMembership ||
      null
    );
  };

  const getAttendance = () => {
    return (
      dashboard?.attendance ||
      dashboard?.attendanceSummary ||
      dashboard?.attendanceStats ||
      {}
    );
  };

  const getPayments = () => {
    return (
      dashboard?.payments ||
      dashboard?.paymentSummary ||
      dashboard?.paymentStats ||
      {}
    );
  };

  const getWorkoutPlans = () => {
    return (
      dashboard?.workoutPlans ||
      dashboard?.workoutPlanSummary ||
      dashboard?.plans ||
      []
    );
  };

  const membership = getMembership();
  const attendance = getAttendance();
  const payments = getPayments();
  const workoutPlans = getWorkoutPlans();

  const membershipStatus =
    membership?.status ||
    membership?.membershipStatus ||
    (membership ? "active" : "No Membership");

  const packageName =
    membership?.package?.name ||
    membership?.packageName ||
    membership?.membershipPackage?.name ||
    "No active package";

  const startDate = membership?.startDate || membership?.membershipStartDate;

  const endDate =
    membership?.endDate ||
    membership?.expiryDate ||
    membership?.membershipEndDate;

  const daysRemaining =
    membership?.daysRemaining ?? membership?.remainingDays ?? null;

  /*
   * ATTENDANCE
   *
   * Supports multiple possible backend field names.
   */
  const attendanceCount =
    attendance?.total ??
    attendance?.count ??
    attendance?.totalAttendance ??
    attendance?.totalVisits ??
    attendance?.visits ??
    attendance?.present ??
    attendance?.completed ??
    attendance?.totalPresent ??
    dashboard?.totalAttendance ??
    dashboard?.totalVisits ??
    (Array.isArray(attendance) ? attendance.length : 0);

  /*
   * TOTAL PAID
   *
   * Supports multiple possible backend field names.
   */
  const totalPaid =
    payments?.totalPaid ??
    payments?.paid ??
    payments?.totalAmountPaid ??
    payments?.totalPaidAmount ??
    payments?.amountPaid ??
    payments?.totalPayment ??
    payments?.totalPayments ??
    payments?.total ??
    dashboard?.totalPaid ??
    dashboard?.totalAmountPaid ??
    dashboard?.amountPaid ??
    0;

  /*
   * PAYMENT BALANCE
   */
  const paymentBalance =
    payments?.balance ??
    payments?.pending ??
    payments?.pendingAmount ??
    payments?.remaining ??
    payments?.remainingBalance ??
    payments?.pendingBalance ??
    dashboard?.balance ??
    dashboard?.pendingAmount ??
    dashboard?.remainingBalance ??
    0;

  /*
   * WORKOUT PLANS
   */
  const planCount = Array.isArray(workoutPlans)
    ? workoutPlans.length
    : (workoutPlans?.total ??
      workoutPlans?.count ??
      workoutPlans?.totalPlans ??
      0);

  if (loading && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadDashboard()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          onRefresh={() => loadDashboard(true)}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>

          <Text style={styles.memberName}>
            {dashboard?.member?.name ||
              dashboard?.user?.name ||
              dashboard?.name ||
              "Member"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("MemberProfile")}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR WARNING */}
      {error ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{error}</Text>
        </View>
      ) : null}

      {/* MEMBERSHIP */}
      <View style={styles.membershipCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardLabel}>CURRENT MEMBERSHIP</Text>

            <Text style={styles.packageName}>{packageName}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              String(membershipStatus).toLowerCase() === "active"
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                String(membershipStatus).toLowerCase() === "active"
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {String(membershipStatus).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>START DATE</Text>

            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </View>

          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>EXPIRY DATE</Text>

            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </View>
        </View>

        {daysRemaining !== null ? (
          <View style={styles.remainingBox}>
            <Text style={styles.remainingNumber}>{daysRemaining}</Text>

            <Text style={styles.remainingLabel}>days remaining</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.membershipButton}
          onPress={() => navigation.navigate("MemberMembership")}
        >
          <Text style={styles.membershipButtonText}>View Membership</Text>
        </TouchableOpacity>
      </View>

      {/* OVERVIEW */}
      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.statsGrid}>
        {/* ATTENDANCE */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>

          <Text style={styles.statNumber}>
            {Number(attendanceCount || 0).toLocaleString()}
          </Text>

          <Text style={styles.statLabel}>Attendance</Text>
        </View>

        {/* WORKOUT PLANS */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💪</Text>

          <Text style={styles.statNumber}>
            {Number(planCount || 0).toLocaleString()}
          </Text>

          <Text style={styles.statLabel}>Workout Plans</Text>
        </View>

        {/* TOTAL PAID */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>

          <Text style={styles.statNumber}>
            Rs. {Number(totalPaid || 0).toLocaleString()}
          </Text>

          <Text style={styles.statLabel}>Total Paid</Text>
        </View>

        {/* BALANCE */}
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💳</Text>

          <Text style={styles.statNumber}>
            Rs. {Number(paymentBalance || 0).toLocaleString()}
          </Text>

          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>

      {/* QUICK ACCESS */}
      <Text style={styles.sectionTitle}>Quick Access</Text>

      <View style={styles.quickAccess}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("MemberWorkoutPlans")}
        >
          <Text style={styles.quickIcon}>💪</Text>

          <Text style={styles.quickTitle}>Workout Plans</Text>

          <Text style={styles.quickDescription}>
            View your assigned exercises
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("MemberAttendance")}
        >
          <Text style={styles.quickIcon}>📅</Text>

          <Text style={styles.quickTitle}>Attendance</Text>

          <Text style={styles.quickDescription}>
            View your attendance history
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("MemberPayments")}
        >
          <Text style={styles.quickIcon}>💳</Text>

          <Text style={styles.quickTitle}>Payments</Text>

          <Text style={styles.quickDescription}>View payments and balance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("MemberProgress")}
        >
          <Text style={styles.quickIcon}>📈</Text>

          <Text style={styles.quickTitle}>Progress</Text>

          <Text style={styles.quickDescription}>
            Track your fitness progress
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f3f4f6",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6b7280",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  welcomeText: {
    fontSize: 14,
    color: "#6b7280",
  },

  memberName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginTop: 3,
  },

  profileButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  profileButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  warningBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  warningText: {
    color: "#92400e",
    fontSize: 13,
  },

  membershipCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardLabel: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  packageName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#991b1b",
  },

  dateRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },

  dateBox: {
    flex: 1,
  },

  dateLabel: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "700",
  },

  dateValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },

  remainingBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#1f2937",
    borderRadius: 10,
    alignItems: "center",
  },

  remainingNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  remainingLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  membershipButton: {
    marginTop: 15,
    backgroundColor: "#2563eb",
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: "center",
  },

  membershipButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },

  statCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 7,
  },

  quickAccess: {
    gap: 12,
  },

  quickCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  quickIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  quickDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});

export default MemberDashboardScreen;
