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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import api from "../../../services/api";

const MembershipDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { membershipId } = route.params || {};

  const [membership, setMembership] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMembershipDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [membershipResponse, paymentResponse] =
        await Promise.all([
          api.get(`/memberships/${membershipId}`),
          api.get(`/payments/membership/${membershipId}`),
        ]);

      const membershipData =
        membershipResponse.data?.membership ||
        membershipResponse.data;

      const paymentData = paymentResponse.data || {};

      const paymentList =
        paymentData.payments ||
        paymentData.data ||
        [];

      setMembership(membershipData);
      setPayments(
        Array.isArray(paymentList)
          ? paymentList
          : []
      );
    } catch (err) {
      console.log(
        "Membership details error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to load membership details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (membershipId) {
        fetchMembershipDetails();
      }
    }, [membershipId])
  );

  const handleRefresh = () => {
    fetchMembershipDetails(true);
  };

  const handleRenew = () => {
    navigation.navigate("RenewMembership", {
      membershipId,
      memberName:
        membership?.member?.user?.name ||
        membership?.member?.name ||
        "Member",
    });
  };

  const handlePayPending = () => {
    navigation.navigate("PayPendingPayment", {
      membershipId,
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString();
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading membership details...
        </Text>
      </View>
    );
  }

  if (error && !membership) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Unable to load
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchMembershipDetails()}
        >
          <Text style={styles.retryButtonText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!membership) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Membership not found
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memberName =
    membership.member?.user?.name ||
    membership.member?.name ||
    "Unknown Member";

  const memberEmail =
    membership.member?.user?.email ||
    membership.member?.email ||
    "N/A";

  const memberPhone =
    membership.member?.phone ||
    "N/A";

  const packageName =
    membership.package?.name ||
    "Membership Package";

  const duration =
    membership.package?.duration || 0;

  const durationUnit =
    membership.package?.durationUnit || "months";

  const originalAmount = Number(
    membership.originalAmount || 0
  );

  const discountPercentage = Number(
    membership.discountPercentage || 0
  );

  const discountAmount = Number(
    membership.discountAmount || 0
  );

  const finalAmount = Number(
    membership.finalAmount || 0
  );

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const remainingAmount = Math.max(
    finalAmount - totalPaid,
    0
  );

  const membershipStatus =
    membership.status || "unknown";

  const paymentStatus =
    remainingAmount <= 0
      ? "paid"
      : totalPaid > 0
        ? "partial"
        : "pending";

  const isCancelled =
    membershipStatus === "cancelled";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Membership Details
        </Text>

        <Text style={styles.subtitle}>
          View membership and payment information
        </Text>
      </View>

      <View style={styles.memberCard}>
        <Text style={styles.sectionTitle}>
          Member Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Name
          </Text>

          <Text style={styles.infoValue}>
            {memberName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Email
          </Text>

          <Text style={styles.infoValue}>
            {memberEmail}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Phone
          </Text>

          <Text style={styles.infoValue}>
            {memberPhone}
          </Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>
            Membership Status
          </Text>

          <View
            style={[
              styles.statusBadge,
              membershipStatus === "active" &&
                styles.activeBadge,
              membershipStatus === "expired" &&
                styles.expiredBadge,
              membershipStatus === "upcoming" &&
                styles.upcomingBadge,
              membershipStatus === "cancelled" &&
                styles.cancelledBadge,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                membershipStatus === "active" &&
                  styles.activeBadgeText,
                membershipStatus === "expired" &&
                  styles.expiredBadgeText,
                membershipStatus === "upcoming" &&
                  styles.upcomingBadgeText,
                membershipStatus === "cancelled" &&
                  styles.cancelledBadgeText,
              ]}
            >
              {getStatusLabel(
                membershipStatus
              )}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>
            Payment Status
          </Text>

          <View
            style={[
              styles.statusBadge,
              paymentStatus === "paid" &&
                styles.paidBadge,
              paymentStatus === "partial" &&
                styles.partialBadge,
              paymentStatus === "pending" &&
                styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                paymentStatus === "paid" &&
                  styles.paidBadgeText,
                paymentStatus === "partial" &&
                  styles.partialBadgeText,
                paymentStatus === "pending" &&
                  styles.pendingBadgeText,
              ]}
            >
              {getStatusLabel(paymentStatus)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.packageCard}>
        <Text style={styles.sectionTitle}>
          Package Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Package
          </Text>

          <Text style={styles.infoValue}>
            {packageName}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Duration
          </Text>

          <Text style={styles.infoValue}>
            {duration} {durationUnit}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Start Date
          </Text>

          <Text style={styles.infoValue}>
            {formatDate(
              membership.startDate
            )}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            End Date
          </Text>

          <Text style={styles.infoValue}>
            {formatDate(
              membership.endDate
            )}
          </Text>
        </View>
      </View>

      <View style={styles.paymentSummaryCard}>
        <Text style={styles.sectionTitle}>
          Payment Summary
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Original Amount
          </Text>

          <Text style={styles.infoValue}>
            Rs.{" "}
            {originalAmount.toLocaleString()}
          </Text>
        </View>

        {discountPercentage > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Discount ({discountPercentage}%)
            </Text>

            <Text style={styles.discountValue}>
              - Rs.{" "}
              {discountAmount.toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Final Amount
          </Text>

          <Text style={styles.finalAmount}>
            Rs.{" "}
            {finalAmount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Total Paid
          </Text>

          <Text style={styles.paidAmount}>
            Rs.{" "}
            {totalPaid.toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Remaining Amount
          </Text>

          <Text
            style={[
              styles.remainingAmount,
              remainingAmount <= 0 &&
                styles.remainingPaid,
            ]}
          >
            Rs.{" "}
            {remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {remainingAmount > 0 &&
        !isCancelled && (
          <TouchableOpacity
            style={
              styles.pendingPaymentButton
            }
            onPress={handlePayPending}
          >
            <Text
              style={
                styles.pendingPaymentButtonText
              }
            >
              Pay Pending Amount
            </Text>
          </TouchableOpacity>
        )}

      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>
          Payment History
        </Text>

        {payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No payment records found.
            </Text>
          </View>
        ) : (
          payments.map((payment, index) => (
            <View
              key={
                payment._id || index
              }
              style={styles.paymentItem}
            >
              <View
                style={styles.paymentHeader}
              >
                <Text
                  style={
                    styles.paymentAmount
                  }
                >
                  Rs.{" "}
                  {Number(
                    payment.amount || 0
                  ).toLocaleString()}
                </Text>

                <Text
                  style={
                    styles.paymentMethod
                  }
                >
                  {getStatusLabel(
                    payment.paymentMethod
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.paymentInfoRow
                }
              >
                <Text
                  style={
                    styles.paymentLabel
                  }
                >
                  Receipt
                </Text>

                <Text
                  style={
                    styles.paymentValue
                  }
                >
                  {payment.receiptNumber ||
                    "N/A"}
                </Text>
              </View>

              {payment.transactionId ? (
                <View
                  style={
                    styles.paymentInfoRow
                  }
                >
                  <Text
                    style={
                      styles.paymentLabel
                    }
                  >
                    Transaction ID
                  </Text>

                  <Text
                    style={
                      styles.paymentValue
                    }
                  >
                    {payment.transactionId}
                  </Text>
                </View>
              ) : null}

              <View
                style={
                  styles.paymentInfoRow
                }
              >
                <Text
                  style={
                    styles.paymentLabel
                  }
                >
                  Paid At
                </Text>

                <Text
                  style={
                    styles.paymentValue
                  }
                >
                  {formatDateTime(
                    payment.paidAt
                  )}
                </Text>
              </View>

              {payment.notes ? (
                <View
                  style={
                    styles.notesContainer
                  }
                >
                  <Text
                    style={
                      styles.paymentLabel
                    }
                  >
                    Notes
                  </Text>

                  <Text
                    style={styles.notesText}
                  >
                    {payment.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>

      {!isCancelled && (
        <TouchableOpacity
          style={styles.renewButton}
          onPress={handleRenew}
        >
          <Text
            style={styles.renewButtonText}
          >
            Renew Membership
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  memberCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  statusCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  packageCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  paymentSummaryCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  historyCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: "#777",
  },

  infoValue: {
    flex: 1.4,
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
    textAlign: "right",
  },

  discountValue: {
    flex: 1.4,
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
    textAlign: "right",
  },

  finalAmount: {
    flex: 1.4,
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
    textAlign: "right",
  },

  paidAmount: {
    flex: 1.4,
    fontSize: 15,
    color: "#333",
    fontWeight: "700",
    textAlign: "right",
  },

  remainingAmount: {
    flex: 1.4,
    fontSize: 16,
    color: "#d97706",
    fontWeight: "700",
    textAlign: "right",
  },

  remainingPaid: {
    color: "#15803d",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 8,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  statusLabel: {
    fontSize: 14,
    color: "#666",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  activeBadgeText: {
    color: "#15803d",
  },

  expiredBadge: {
    backgroundColor: "#fee2e2",
  },

  expiredBadgeText: {
    color: "#b91c1c",
  },

  upcomingBadge: {
    backgroundColor: "#fef3c7",
  },

  upcomingBadgeText: {
    color: "#a16207",
  },

  cancelledBadge: {
    backgroundColor: "#e5e7eb",
  },

  cancelledBadgeText: {
    color: "#374151",
  },

  paidBadge: {
    backgroundColor: "#dcfce7",
  },

  paidBadgeText: {
    color: "#15803d",
  },

  partialBadge: {
    backgroundColor: "#fef3c7",
  },

  partialBadgeText: {
    color: "#a16207",
  },

  pendingBadge: {
    backgroundColor: "#fee2e2",
  },

  pendingBadgeText: {
    color: "#b91c1c",
  },

  pendingPaymentButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },

  pendingPaymentButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  paymentItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 14,
  },

  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  paymentAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  paymentMethod: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },

  paymentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  paymentLabel: {
    fontSize: 12,
    color: "#888",
  },

  paymentValue: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    textAlign: "right",
    marginLeft: 10,
  },

  notesContainer: {
    marginTop: 8,
  },

  notesText: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
    lineHeight: 18,
  },

  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#888",
  },

  renewButton: {
    marginTop: 15,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  renewButtonText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default MembershipDetailsScreen;