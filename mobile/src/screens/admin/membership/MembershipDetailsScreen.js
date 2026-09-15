import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const MembershipDetailsScreen = ({ route, navigation }) => {
  const { membershipId } = route.params;

  const [membership, setMembership] = useState(null);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDetails = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [membershipResponse, paymentsResponse] =
        await Promise.all([
          api.get(`/memberships/${membershipId}`),
          api.get(`/payments/membership/${membershipId}`),
        ]);

      console.log(
        "MEMBERSHIP DETAILS:",
        membershipResponse.data
      );

      console.log(
        "MEMBERSHIP PAYMENTS:",
        paymentsResponse.data
      );

      const membershipData =
        membershipResponse.data.membership ||
        membershipResponse.data.data;

      const paymentData =
        paymentsResponse.data.payments ||
        paymentsResponse.data.data ||
        [];

      setMembership(membershipData);
      setPayments(
        Array.isArray(paymentData)
          ? paymentData
          : []
      );
    } catch (error) {
      console.log(
        "Membership details error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load membership details"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [membershipId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDetails(false);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "N/A";
    }

    return value.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "N/A";
    }

    return value.toLocaleString();
  };

  const memberName =
    membership?.member?.user?.name ||
    membership?.member?.name ||
    "Unknown Member";

  const memberEmail =
    membership?.member?.user?.email ||
    membership?.member?.email ||
    "No email";

  const packageName =
    membership?.package?.name ||
    "Unknown Package";

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const finalAmount = Number(
    membership?.finalAmount || 0
  );

  const remainingAmount = Math.max(
    finalAmount - totalPaid,
    0
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return styles.activeBadge;

      case "expired":
        return styles.expiredBadge;

      case "upcoming":
        return styles.upcomingBadge;

      case "cancelled":
        return styles.cancelledBadge;

      default:
        return styles.defaultBadge;
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return styles.paidBadge;

      case "partial":
        return styles.partialBadge;

      case "pending":
        return styles.pendingBadge;

      default:
        return styles.defaultBadge;
    }
  };

  const handleRenew = () => {
    navigation.navigate("RenewMembership", {
      membershipId: membership._id,
      memberId: membership.member?._id,
      memberName,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading membership details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Something went wrong
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadDetails()}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!membership) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Membership not found
        </Text>
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
          onRefresh={onRefresh}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Member */}
      <View style={styles.memberCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {memberName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {memberName}
          </Text>

          <Text style={styles.memberEmail}>
            {memberEmail}
          </Text>

          {membership.member?.phone ? (
            <Text style={styles.memberPhone}>
              {membership.member.phone}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <View>
          <Text style={styles.smallLabel}>
            Membership Status
          </Text>

          <View
            style={[
              styles.badge,
              getStatusStyle(
                membership.status
              ),
            ]}
          >
            <Text style={styles.badgeText}>
              {membership.status}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.smallLabel}>
            Payment Status
          </Text>

          <View
            style={[
              styles.badge,
              getPaymentStatusStyle(
                membership.paymentStatus
              ),
            ]}
          >
            <Text style={styles.badgeText}>
              {membership.paymentStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* Package */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Package Information
        </Text>

        <InfoRow
          label="Package"
          value={packageName}
        />

        <InfoRow
          label="Duration"
          value={
            membership.package
              ? `${membership.package.duration || ""} ${
                  membership.package.durationUnit || ""
                }`
              : "N/A"
          }
        />

        <InfoRow
          label="Start Date"
          value={formatDate(
            membership.startDate
          )}
        />

        <InfoRow
          label="End Date"
          value={formatDate(
            membership.endDate
          )}
        />
      </View>

      {/* Financial */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Payment Summary
        </Text>

        <InfoRow
          label="Original Amount"
          value={`Rs. ${Number(
            membership.originalAmount || 0
          ).toLocaleString()}`}
        />

        <InfoRow
          label="Discount"
          value={`Rs. ${Number(
            membership.discountAmount || 0
          ).toLocaleString()}`}
        />

        <View style={styles.divider} />

        <InfoRow
          label="Final Amount"
          value={`Rs. ${finalAmount.toLocaleString()}`}
          bold
        />

        <InfoRow
          label="Total Paid"
          value={`Rs. ${totalPaid.toLocaleString()}`}
          paid
        />

        <InfoRow
          label="Remaining"
          value={`Rs. ${remainingAmount.toLocaleString()}`}
          remaining={remainingAmount > 0}
        />
      </View>

      {/* Payment History */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Payment History
          </Text>

          <Text style={styles.paymentCount}>
            {payments.length} payment
            {payments.length !== 1
              ? "s"
              : ""}
          </Text>
        </View>

        {payments.length === 0 ? (
          <View style={styles.emptyPayment}>
            <Text style={styles.emptyPaymentText}>
              No payments recorded yet.
            </Text>
          </View>
        ) : (
          payments.map((payment, index) => (
            <View
              key={
                payment._id ||
                `${payment.receiptNumber}-${index}`
              }
              style={styles.paymentItem}
            >
              <View style={styles.paymentTop}>
                <Text style={styles.receiptNumber}>
                  {payment.receiptNumber ||
                    "No Receipt"}
                </Text>

                <Text style={styles.paymentAmount}>
                  Rs.{" "}
                  {Number(
                    payment.amount || 0
                  ).toLocaleString()}
                </Text>
              </View>

              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentLabel}>
                  Method
                </Text>

                <Text style={styles.paymentValue}>
                  {payment.paymentMethod ||
                    "N/A"}
                </Text>
              </View>

              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentLabel}>
                  Date
                </Text>

                <Text style={styles.paymentValue}>
                  {formatDateTime(
                    payment.paidAt ||
                      payment.createdAt
                  )}
                </Text>
              </View>

              {payment.transactionId ? (
                <View style={styles.paymentInfoRow}>
                  <Text style={styles.paymentLabel}>
                    Transaction ID
                  </Text>

                  <Text
                    style={styles.paymentValue}
                  >
                    {payment.transactionId}
                  </Text>
                </View>
              ) : null}

              {payment.notes ? (
                <Text style={styles.notes}>
                  Note: {payment.notes}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Actions */}
      {membership.status !== "cancelled" && (
        <TouchableOpacity
          style={styles.renewButton}
          onPress={handleRenew}
        >
          <Text style={styles.renewButtonText}>
            Renew Membership
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const InfoRow = ({
  label,
  value,
  bold,
  paid,
  remaining,
}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          bold && styles.boldValue,
          paid && styles.paidValue,
          remaining && styles.remainingValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  errorText: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 9,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },

  memberCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#111",
    fontSize: 24,
    fontWeight: "700",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
  },

  memberEmail: {
    color: "#ccc",
    marginTop: 4,
  },

  memberPhone: {
    color: "#aaa",
    marginTop: 3,
  },

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  smallLabel: {
    color: "#777",
    fontSize: 12,
    marginBottom: 7,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    color: "#222",
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  expiredBadge: {
    backgroundColor: "#fee2e2",
  },

  upcomingBadge: {
    backgroundColor: "#fef3c7",
  },

  cancelledBadge: {
    backgroundColor: "#e5e7eb",
  },

  paidBadge: {
    backgroundColor: "#dcfce7",
  },

  partialBadge: {
    backgroundColor: "#fef3c7",
  },

  pendingBadge: {
    backgroundColor: "#fee2e2",
  },

  defaultBadge: {
    backgroundColor: "#eee",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  paymentCount: {
    color: "#777",
    fontSize: 13,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },

  infoLabel: {
    color: "#777",
    fontSize: 14,
  },

  infoValue: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  boldValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  paidValue: {
    color: "#16a34a",
    fontWeight: "700",
  },

  remainingValue: {
    color: "#dc2626",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 7,
  },

  paymentItem: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
  },

  paymentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  receiptNumber: {
    fontWeight: "700",
    color: "#111",
  },

  paymentAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
  },

  paymentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  paymentLabel: {
    color: "#888",
    fontSize: 13,
  },

  paymentValue: {
    color: "#333",
    fontSize: 13,
    maxWidth: "65%",
    textAlign: "right",
  },

  notes: {
    marginTop: 5,
    color: "#666",
    fontSize: 13,
    fontStyle: "italic",
  },

  emptyPayment: {
    paddingVertical: 15,
    alignItems: "center",
  },

  emptyPaymentText: {
    color: "#777",
  },

  renewButton: {
    backgroundColor: "#111",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 3,
  },

  renewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default MembershipDetailsScreen;