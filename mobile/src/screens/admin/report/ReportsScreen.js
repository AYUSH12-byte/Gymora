import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const ReportsScreen = () => {
  const [activeReport, setActiveReport] = useState("revenue");

  const [revenueReport, setRevenueReport] = useState(null);
  const [membershipReport, setMembershipReport] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [memberReport, setMemberReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD REPORTS
  // =========================

  const loadReports = async () => {
    try {
      setError("");

      const [
        revenueResponse,
        membershipResponse,
        attendanceResponse,
        memberResponse,
      ] = await Promise.all([
        api.get("/reports/revenue"),
        api.get("/reports/memberships"),
        api.get("/reports/attendance"),
        api.get("/reports/members"),
      ]);

      console.log("Revenue:", revenueResponse.data);
      console.log("Memberships:", membershipResponse.data);
      console.log("Attendance:", attendanceResponse.data);
      console.log("Members:", memberResponse.data);

      setRevenueReport(revenueResponse.data);
      setMembershipReport(membershipResponse.data);
      setAttendanceReport(attendanceResponse.data);
      setMemberReport(memberResponse.data);
    } catch (err) {
      console.log(
        "Reports Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================
  // SCREEN FOCUS
  // =========================

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  // =========================
  // MEMBER HELPERS
  // =========================

  const getMemberName = (member) => {
    if (!member) {
      return "";
    }

    return (
      member?.user?.name ||
      member?.name ||
      member?.fullName ||
      member?.user?.username ||
      member?.username ||
      ""
    );
  };

  const getMemberEmail = (member) => {
    if (!member) {
      return "";
    }

    return (
      member?.user?.email ||
      member?.email ||
      ""
    );
  };

  // =========================
  // DATE HELPERS
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  // =========================
  // CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  // =========================
  // REVENUE DATA
  // =========================

  const totalRevenue =
    Number(revenueReport?.totalRevenue) || 0;

  const totalPayments =
    Number(revenueReport?.totalPayments) || 0;

  const revenuePayments = Array.isArray(
    revenueReport?.payments
  )
    ? revenueReport.payments
    : [];

  // =========================
  // MEMBERSHIP DATA
  // =========================

  const memberships =
    membershipReport?.memberships || {};

  const membershipPayments =
    membershipReport?.payments || {};

  const totalMemberships =
    Number(memberships.total) || 0;

  const activeMemberships =
    Number(memberships.active) || 0;

  const upcomingMemberships =
    Number(memberships.upcoming) || 0;

  const expiredMemberships =
    Number(memberships.expired) || 0;

  const cancelledMemberships =
    Number(memberships.cancelled) || 0;

  const paidMemberships =
    Number(membershipPayments.paid) || 0;

  const partialMemberships =
    Number(membershipPayments.partial) || 0;

  const pendingMemberships =
    Number(membershipPayments.pending) || 0;

  // =========================
  // ATTENDANCE DATA
  // =========================

  const attendanceSummary =
    attendanceReport?.summary || {};

  const totalAttendance =
    Number(attendanceSummary.totalAttendance) || 0;

  const completedAttendance =
    Number(attendanceSummary.completed) || 0;

  const currentlyPresent =
    Number(attendanceSummary.currentlyPresent) || 0;

  const attendanceRecords = Array.isArray(
    attendanceReport?.attendance
  )
    ? attendanceReport.attendance
    : [];

  // =========================
  // MEMBER DATA
  // =========================

  const memberSummary =
    memberReport?.summary || {};

  const totalMembers =
    Number(memberSummary.totalMembers) || 0;

  const activeMembers =
    Number(memberSummary.activeMembers) || 0;

  const inactiveMembers =
    Number(memberSummary.inactiveMembers) || 0;

  const members = Array.isArray(
    memberReport?.members
  )
    ? memberReport.members
    : [];

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading reports...
        </Text>
      </View>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadReports}
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =========================
  // REVENUE REPORT
  // =========================

  const renderRevenueReport = () => {
    return (
      <View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Total Revenue
          </Text>

          <Text style={styles.bigValue}>
            {formatCurrency(totalRevenue)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Total Payments
          </Text>

          <Text style={styles.bigValue}>
            {totalPayments}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Payment Records
        </Text>

        {revenuePayments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No payment records found.
            </Text>
          </View>
        ) : (
          revenuePayments.map((payment, index) => {
            const memberName = getMemberName(
              payment?.member
            );

            const memberEmail = getMemberEmail(
              payment?.member
            );

            return (
              <View
                key={
                  payment?._id ||
                  payment?.id ||
                  `payment-${index}`
                }
                style={styles.recordCard}
              >
                {memberName ? (
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>
                      {memberName}
                    </Text>

                    <Text style={styles.amountText}>
                      {formatCurrency(
                        payment?.amount
                      )}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.recordHeader}>
                    <Text style={styles.amountText}>
                      {formatCurrency(
                        payment?.amount
                      )}
                    </Text>
                  </View>
                )}

                {memberEmail ? (
                  <Text style={styles.recordSubText}>
                    {memberEmail}
                  </Text>
                ) : null}

                {payment?.paidAt ? (
                  <Text style={styles.recordText}>
                    Payment Date:{" "}
                    {formatDate(payment.paidAt)}
                  </Text>
                ) : null}

                {payment?.paymentMethod ? (
                  <Text style={styles.recordText}>
                    Payment Method:{" "}
                    {payment.paymentMethod}
                  </Text>
                ) : null}

                {payment?.receiptNumber ? (
                  <Text style={styles.recordText}>
                    Receipt:{" "}
                    {payment.receiptNumber}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    );
  };

  // =========================
  // MEMBERSHIP REPORT
  // =========================

  const renderMembershipReport = () => {
    return (
      <View>
        <Text style={styles.sectionTitle}>
          Membership Overview
        </Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Total
            </Text>

            <Text style={styles.statValue}>
              {totalMemberships}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Active
            </Text>

            <Text style={styles.statValue}>
              {activeMemberships}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Upcoming
            </Text>

            <Text style={styles.statValue}>
              {upcomingMemberships}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Expired
            </Text>

            <Text style={styles.statValue}>
              {expiredMemberships}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Cancelled
            </Text>

            <Text style={styles.statValue}>
              {cancelledMemberships}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Payment Status
        </Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Paid
            </Text>

            <Text style={styles.statValue}>
              {paidMemberships}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Partial
            </Text>

            <Text style={styles.statValue}>
              {partialMemberships}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Pending
            </Text>

            <Text style={styles.statValue}>
              {pendingMemberships}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // =========================
  // ATTENDANCE REPORT
  // =========================

  const renderAttendanceReport = () => {
    return (
      <View>
        <Text style={styles.sectionTitle}>
          Attendance Overview
        </Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Total Attendance
            </Text>

            <Text style={styles.statValue}>
              {totalAttendance}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Completed
            </Text>

            <Text style={styles.statValue}>
              {completedAttendance}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Currently Present
            </Text>

            <Text style={styles.statValue}>
              {currentlyPresent}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Attendance Records
        </Text>

        {attendanceRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No attendance records found.
            </Text>
          </View>
        ) : (
          attendanceRecords.map(
            (attendance, index) => {
              const memberName = getMemberName(
                attendance?.member
              );

              const memberEmail = getMemberEmail(
                attendance?.member
              );

              return (
                <View
                  key={
                    attendance?._id ||
                    attendance?.id ||
                    `attendance-${index}`
                  }
                  style={styles.recordCard}
                >
                  {memberName ? (
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordName}>
                        {memberName}
                      </Text>

                      {attendance?.status ? (
                        <Text style={styles.statusText}>
                          {attendance.status}
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.recordHeader}>
                      {attendance?.status ? (
                        <Text style={styles.statusText}>
                          {attendance.status}
                        </Text>
                      ) : null}
                    </View>
                  )}

                  {memberEmail ? (
                    <Text style={styles.recordSubText}>
                      {memberEmail}
                    </Text>
                  ) : null}

                  {attendance?.date ? (
                    <Text style={styles.recordText}>
                      Date:{" "}
                      {formatDate(
                        attendance.date
                      )}
                    </Text>
                  ) : null}

                  {attendance?.checkIn ? (
                    <Text style={styles.recordText}>
                      Check In:{" "}
                      {formatDateTime(
                        attendance.checkIn
                      )}
                    </Text>
                  ) : null}

                  {attendance?.checkOut ? (
                    <Text style={styles.recordText}>
                      Check Out:{" "}
                      {formatDateTime(
                        attendance.checkOut
                      )}
                    </Text>
                  ) : null}
                </View>
              );
            }
          )
        )}
      </View>
    );
  };

  // =========================
  // MEMBER REPORT
  // =========================

  const renderMemberReport = () => {
    return (
      <View>
        <Text style={styles.sectionTitle}>
          Member Overview
        </Text>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Total Members
            </Text>

            <Text style={styles.statValue}>
              {totalMembers}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Active Members
            </Text>

            <Text style={styles.statValue}>
              {activeMembers}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              Inactive Members
            </Text>

            <Text style={styles.statValue}>
              {inactiveMembers}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Member Records
        </Text>

        {members.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No member records found.
            </Text>
          </View>
        ) : (
          members.map((member, index) => {
            const memberName =
              getMemberName(member);

            const memberEmail =
              getMemberEmail(member);

            return (
              <View
                key={
                  member?._id ||
                  member?.id ||
                  `member-${index}`
                }
                style={styles.recordCard}
              >
                {memberName ? (
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordName}>
                      {memberName}
                    </Text>

                    {member?.status ? (
                      <Text style={styles.statusText}>
                        {member.status}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.recordHeader}>
                    {member?.status ? (
                      <Text style={styles.statusText}>
                        {member.status}
                      </Text>
                    ) : null}
                  </View>
                )}

                {memberEmail ? (
                  <Text style={styles.recordSubText}>
                    {memberEmail}
                  </Text>
                ) : null}

                {member?.phone ? (
                  <Text style={styles.recordText}>
                    Phone: {member.phone}
                  </Text>
                ) : null}

                {member?.createdAt ? (
                  <Text style={styles.recordText}>
                    Joined:{" "}
                    {formatDate(
                      member.createdAt
                    )}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    );
  };

  // =========================
  // MAIN UI
  // =========================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <Text style={styles.title}>
          Reports
        </Text>

        {/* TABS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.tabContainer
          }
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeReport === "revenue" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveReport("revenue")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeReport === "revenue" &&
                  styles.activeTabText,
              ]}
            >
              Revenue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeReport === "memberships" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveReport("memberships")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeReport === "memberships" &&
                  styles.activeTabText,
              ]}
            >
              Memberships
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeReport === "attendance" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveReport("attendance")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeReport === "attendance" &&
                  styles.activeTabText,
              ]}
            >
              Attendance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeReport === "members" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setActiveReport("members")
            }
          >
            <Text
              style={[
                styles.tabText,
                activeReport === "members" &&
                  styles.activeTabText,
              ]}
            >
              Members
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CONTENT */}

        {activeReport === "revenue" &&
          renderRevenueReport()}

        {activeReport === "memberships" &&
          renderMembershipReport()}

        {activeReport === "attendance" &&
          renderAttendanceReport()}

        {activeReport === "members" &&
          renderMemberReport()}
      </ScrollView>
    </View>
  );
};

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },

  tabContainer: {
    paddingBottom: 16,
    gap: 8,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },

  activeTab: {
    backgroundColor: "#111827",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  activeTabText: {
    color: "#ffffff",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },

  bigValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginTop: 18,
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },

  statValue: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111827",
  },

  recordCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  recordName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },

  recordSubText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },

  recordText: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 5,
  },

  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "capitalize",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default ReportsScreen;