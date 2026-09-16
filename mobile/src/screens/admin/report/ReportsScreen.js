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

  // ============================================================
  // LOAD REPORTS
  // ============================================================

  const loadReports = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

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

      console.log("========== REPORT API RESPONSE ==========");

      console.log(
        "REVENUE:",
        JSON.stringify(revenueResponse.data, null, 2)
      );

      console.log(
        "MEMBERSHIPS:",
        JSON.stringify(membershipResponse.data, null, 2)
      );

      console.log(
        "ATTENDANCE:",
        JSON.stringify(attendanceResponse.data, null, 2)
      );

      console.log(
        "MEMBERS:",
        JSON.stringify(memberResponse.data, null, 2)
      );

      console.log("========================================");

      setRevenueReport(revenueResponse.data);
      setMembershipReport(membershipResponse.data);
      setAttendanceReport(attendanceResponse.data);
      setMemberReport(memberResponse.data);
    } catch (error) {
      console.log(
        "Reports error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load reports. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // LOAD WHEN SCREEN OPENS
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports(false);
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (amount) => {
    const value = Number(amount || 0);

    return `Rs. ${value.toLocaleString("en-IN")}`;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  // ============================================================
  // GET NESTED VALUE
  // ============================================================

  const getNestedValue = (object, paths) => {
    if (!object) {
      return undefined;
    }

    for (const path of paths) {
      const keys = path.split(".");

      let value = object;

      for (const key of keys) {
        if (value === null || value === undefined) {
          value = undefined;
          break;
        }

        value = value[key];
      }

      if (value !== undefined && value !== null) {
        return value;
      }
    }

    return undefined;
  };

  // ============================================================
  // GET NUMBER
  // ============================================================

  const getNumber = (object, paths) => {
    const value = getNestedValue(object, paths);

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return 0;
    }

    const number = Number(value);

    return Number.isNaN(number) ? 0 : number;
  };

  // ============================================================
  // GET ARRAY
  // ============================================================

  const getArray = (object, paths) => {
    const value = getNestedValue(object, paths);

    return Array.isArray(value) ? value : [];
  };

  // ============================================================
  // REVENUE REPORT
  // ============================================================

  const renderRevenueReport = () => {
    const totalRevenue = getNumber(revenueReport, [
      "totalRevenue",
      "revenue",
      "total",
      "report.totalRevenue",
      "report.revenue",
      "report.total",
      "data.totalRevenue",
      "data.revenue",
      "data.total",
    ]);

    const totalPayments = getNumber(revenueReport, [
      "totalPayments",
      "paymentCount",
      "count",
      "report.totalPayments",
      "report.paymentCount",
      "report.count",
      "data.totalPayments",
      "data.paymentCount",
      "data.count",
    ]);

    const payments = getArray(revenueReport, [
      "payments",
      "records",
      "paymentRecords",
      "transactions",
      "report.payments",
      "report.records",
      "report.paymentRecords",
      "report.transactions",
      "data.payments",
      "data.records",
      "data.paymentRecords",
      "data.transactions",
    ]);

    return (
      <View>
        {/* Revenue Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Total Revenue
          </Text>

          <Text style={styles.summaryValue}>
            {formatCurrency(totalRevenue)}
          </Text>

          <Text style={styles.summarySubtext}>
            {totalPayments} payment
            {totalPayments !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Payment Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment Records
          </Text>

          {payments.length === 0 ? (
            <EmptyState text="No payment records found." />
          ) : (
            payments.map((payment, index) => {
              const memberName =
                payment.member?.user?.name ||
                payment.member?.name ||
                payment.user?.name ||
                payment.name ||
                "Unknown Member";

              const amount =
                payment.amount ||
                payment.paidAmount ||
                payment.paymentAmount ||
                0;

              const method =
                payment.paymentMethod ||
                payment.method ||
                "Unknown method";

              const date =
                payment.paidAt ||
                payment.paymentDate ||
                payment.createdAt;

              return (
                <View
                  style={styles.recordCard}
                  key={
                    payment._id ||
                    payment.id ||
                    String(index)
                  }
                >
                  <View style={styles.rowBetween}>
                    <Text
                      style={styles.recordTitle}
                      numberOfLines={1}
                    >
                      {memberName}
                    </Text>

                    <Text style={styles.amount}>
                      {formatCurrency(amount)}
                    </Text>
                  </View>

                  <Text style={styles.recordText}>
                    Payment Method: {method}
                  </Text>

                  {payment.receiptNumber ? (
                    <Text style={styles.recordText}>
                      Receipt: {payment.receiptNumber}
                    </Text>
                  ) : null}

                  {payment.transactionId ? (
                    <Text style={styles.recordText}>
                      Transaction ID: {payment.transactionId}
                    </Text>
                  ) : null}

                  <Text style={styles.date}>
                    {formatDate(date)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  };

  // ============================================================
  // MEMBERSHIP REPORT
  // ============================================================

  const renderMembershipReport = () => {
    const total = getNumber(membershipReport, [
      "total",
      "totalMemberships",
      "report.total",
      "report.totalMemberships",
      "data.total",
      "data.totalMemberships",
    ]);

    const active = getNumber(membershipReport, [
      "active",
      "activeMemberships",
      "report.active",
      "report.activeMemberships",
      "data.active",
      "data.activeMemberships",
    ]);

    const expired = getNumber(membershipReport, [
      "expired",
      "expiredMemberships",
      "report.expired",
      "report.expiredMemberships",
      "data.expired",
      "data.expiredMemberships",
    ]);

    const upcoming = getNumber(membershipReport, [
      "upcoming",
      "upcomingMemberships",
      "report.upcoming",
      "report.upcomingMemberships",
      "data.upcoming",
      "data.upcomingMemberships",
    ]);

    const pending = getNumber(membershipReport, [
      "pending",
      "pendingPayments",
      "report.pending",
      "report.pendingPayments",
      "data.pending",
      "data.pendingPayments",
    ]);

    const partial = getNumber(membershipReport, [
      "partial",
      "partialPayments",
      "report.partial",
      "report.partialPayments",
      "data.partial",
      "data.partialPayments",
    ]);

    const paid = getNumber(membershipReport, [
      "paid",
      "paidMemberships",
      "report.paid",
      "report.paidMemberships",
      "data.paid",
      "data.paidMemberships",
    ]);

    return (
      <View>
        {/* Membership Summary */}
        <View style={styles.grid}>
          <SummaryBox
            title="Total"
            value={total}
          />

          <SummaryBox
            title="Active"
            value={active}
          />

          <SummaryBox
            title="Expired"
            value={expired}
          />

          <SummaryBox
            title="Upcoming"
            value={upcoming}
          />
        </View>

        {/* Payment Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Payment Status
          </Text>

          <View style={styles.statusCard}>
            <StatusRow
              label="Paid"
              value={paid}
            />

            <StatusRow
              label="Partial"
              value={partial}
            />

            <StatusRow
              label="Pending"
              value={pending}
              last
            />
          </View>
        </View>
      </View>
    );
  };

  // ============================================================
  // ATTENDANCE REPORT
  // ============================================================

  const renderAttendanceReport = () => {
    const total = getNumber(attendanceReport, [
      "total",
      "totalAttendance",
      "totalRecords",
      "report.total",
      "report.totalAttendance",
      "report.totalRecords",
      "data.total",
      "data.totalAttendance",
      "data.totalRecords",
    ]);

    const present = getNumber(attendanceReport, [
      "present",
      "presentCount",
      "report.present",
      "report.presentCount",
      "data.present",
      "data.presentCount",
    ]);

    const completed = getNumber(attendanceReport, [
      "completed",
      "completedCount",
      "report.completed",
      "report.completedCount",
      "data.completed",
      "data.completedCount",
    ]);

    return (
      <View>
        {/* Attendance Summary */}
        <View style={styles.grid}>
          <SummaryBox
            title="Total Visits"
            value={total}
          />

          <SummaryBox
            title="Present"
            value={present}
          />

          <SummaryBox
            title="Completed"
            value={completed}
          />
        </View>

        {/* Attendance Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Attendance Information
          </Text>

          <View style={styles.statusCard}>
            <StatusRow
              label="Total Visits"
              value={total}
            />

            <StatusRow
              label="Present"
              value={present}
            />

            <StatusRow
              label="Completed"
              value={completed}
              last
            />
          </View>
        </View>
      </View>
    );
  };

  // ============================================================
  // MEMBER REPORT
  // ============================================================

  const renderMemberReport = () => {
    const total = getNumber(memberReport, [
      "total",
      "totalMembers",
      "report.total",
      "report.totalMembers",
      "data.total",
      "data.totalMembers",
    ]);

    const active = getNumber(memberReport, [
      "active",
      "activeMembers",
      "report.active",
      "report.activeMembers",
      "data.active",
      "data.activeMembers",
    ]);

    const inactive = getNumber(memberReport, [
      "inactive",
      "inactiveMembers",
      "report.inactive",
      "report.inactiveMembers",
      "data.inactive",
      "data.inactiveMembers",
    ]);

    const members = getArray(memberReport, [
      "members",
      "records",
      "memberRecords",
      "report.members",
      "report.records",
      "report.memberRecords",
      "data.members",
      "data.records",
      "data.memberRecords",
    ]);

    return (
      <View>
        {/* Member Summary */}
        <View style={styles.grid}>
          <SummaryBox
            title="Total Members"
            value={total}
          />

          <SummaryBox
            title="Active"
            value={active}
          />

          <SummaryBox
            title="Inactive"
            value={inactive}
          />
        </View>

        {/* Member Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Member Records
          </Text>

          {members.length === 0 ? (
            <EmptyState text="No member records found." />
          ) : (
            members.map((member, index) => {
              const name =
                member.user?.name ||
                member.name ||
                member.fullName ||
                "Unknown Member";

              const email =
                member.user?.email ||
                member.email ||
                "No email";

              const status =
                member.status ||
                member.user?.status ||
                "Unknown";

              const phone =
                member.phone ||
                member.user?.phone ||
                "";

              const joinDate =
                member.joinDate ||
                member.createdAt ||
                member.user?.createdAt;

              const normalizedStatus =
                String(status).toLowerCase();

              const isActive =
                normalizedStatus === "active";

              return (
                <View
                  style={styles.recordCard}
                  key={
                    member._id ||
                    member.id ||
                    String(index)
                  }
                >
                  <View style={styles.rowBetween}>
                    <Text
                      style={styles.recordTitle}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        isActive
                          ? styles.activeBadge
                          : styles.inactiveBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isActive
                            ? styles.activeBadgeText
                            : styles.inactiveBadgeText,
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recordText}>
                    {email}
                  </Text>

                  {phone ? (
                    <Text style={styles.recordText}>
                      Phone: {phone}
                    </Text>
                  ) : null}

                  <Text style={styles.date}>
                    Joined: {formatDate(joinDate)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  };

  // ============================================================
  // ACTIVE REPORT
  // ============================================================

  const renderReport = () => {
    switch (activeReport) {
      case "revenue":
        return renderRevenueReport();

      case "memberships":
        return renderMembershipReport();

      case "attendance":
        return renderAttendanceReport();

      case "members":
        return renderMemberReport();

      default:
        return null;
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading reports...
        </Text>
      </View>
    );
  }

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Unable to Load Reports
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadReports()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================================
  // MAIN SCREEN
  // ============================================================

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.heading}>
            Reports
          </Text>

          <Text style={styles.subHeading}>
            Gym performance overview
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => loadReports()}
          activeOpacity={0.7}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <ReportTab
          title="Revenue"
          active={activeReport === "revenue"}
          onPress={() => setActiveReport("revenue")}
        />

        <ReportTab
          title="Memberships"
          active={activeReport === "memberships"}
          onPress={() =>
            setActiveReport("memberships")
          }
        />

        <ReportTab
          title="Attendance"
          active={activeReport === "attendance"}
          onPress={() =>
            setActiveReport("attendance")
          }
        />

        <ReportTab
          title="Members"
          active={activeReport === "members"}
          onPress={() => setActiveReport("members")}
        />
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#111"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderReport()}
      </ScrollView>
    </View>
  );
};

// ============================================================
// REPORT TAB
// ============================================================

const ReportTab = ({
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.tab,
        active && styles.activeTab,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.activeTabText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================
// SUMMARY BOX
// ============================================================

const SummaryBox = ({
  title,
  value,
}) => {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryBoxTitle}>
        {title}
      </Text>

      <Text style={styles.summaryBoxValue}>
        {value}
      </Text>
    </View>
  );
};

// ============================================================
// STATUS ROW
// ============================================================

const StatusRow = ({
  label,
  value,
  last = false,
}) => {
  return (
    <View
      style={[
        styles.statusRow,
        last && styles.lastStatusRow,
      ]}
    >
      <Text style={styles.statusLabel}>
        {label}
      </Text>

      <Text style={styles.statusValue}>
        {value}
      </Text>
    </View>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({
  text,
}) => {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>
        —
      </Text>

      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  subHeading: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },

  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },

  refreshText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 13,
  },

  // ----------------------------------------------------------
  // TABS
  // ----------------------------------------------------------

  tabs: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginHorizontal: 2,
  },

  activeTab: {
    backgroundColor: "#111",
  },

  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  // ----------------------------------------------------------
  // CONTENT
  // ----------------------------------------------------------

  content: {
    padding: 15,
    paddingBottom: 40,
  },

  // ----------------------------------------------------------
  // REVENUE SUMMARY
  // ----------------------------------------------------------

  summaryCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 20,
    marginBottom: 15,
  },

  summaryLabel: {
    color: "#ccc",
    fontSize: 13,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 5,
  },

  summarySubtext: {
    color: "#aaa",
    marginTop: 5,
    fontSize: 13,
  },

  // ----------------------------------------------------------
  // GRID
  // ----------------------------------------------------------

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  summaryBox: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  summaryBoxTitle: {
    color: "#666",
    fontSize: 12,
  },

  summaryBoxValue: {
    marginTop: 8,
    color: "#111",
    fontSize: 24,
    fontWeight: "700",
  },

  // ----------------------------------------------------------
  // SECTION
  // ----------------------------------------------------------

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },

  // ----------------------------------------------------------
  // STATUS CARD
  // ----------------------------------------------------------

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  lastStatusRow: {
    borderBottomWidth: 0,
  },

  statusLabel: {
    color: "#555",
    fontSize: 14,
  },

  statusValue: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },

  // ----------------------------------------------------------
  // RECORD CARD
  // ----------------------------------------------------------

  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  recordTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    flex: 1,
  },

  recordText: {
    marginTop: 5,
    color: "#666",
    fontSize: 13,
  },

  amount: {
    color: "#111",
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 14,
  },

  date: {
    marginTop: 6,
    color: "#888",
    fontSize: 11,
  },

  // ----------------------------------------------------------
  // STATUS BADGE
  // ----------------------------------------------------------

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeBadgeText: {
    color: "#166534",
  },

  inactiveBadgeText: {
    color: "#991b1b",
  },

  // ----------------------------------------------------------
  // EMPTY STATE
  // ----------------------------------------------------------

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  emptyIcon: {
    color: "#aaa",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 5,
  },

  emptyText: {
    color: "#777",
    fontSize: 13,
    textAlign: "center",
  },

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  errorTitle: {
    color: "#111",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 13,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ReportsScreen;