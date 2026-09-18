import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import api from "../../../services/api";

const MemberPaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);

  const [amount, setAmount] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      setError("");

      const [paymentsResponse, summaryResponse] = await Promise.all([
        api.get("/member-portal/payments"),
        api.get("/member-payments/summary"),
      ]);

      const paymentData =
        paymentsResponse.data?.payments ||
        paymentsResponse.data?.history ||
        paymentsResponse.data?.data ||
        [];

      const summaryData =
        summaryResponse.data?.summary ||
        summaryResponse.data?.data ||
        summaryResponse.data ||
        null;

      setPayments(Array.isArray(paymentData) ? paymentData : []);
      setSummary(summaryData);

      const membershipId =
        summaryData?.membership?._id ||
        summaryData?.membership?.id ||
        summaryData?.membershipId ||
        summaryData?.currentMembership?._id ||
        summaryData?.currentMembership?.id ||
        null;

      setSelectedMembershipId(membershipId);

      const balance =
        Number(summaryData?.balance) ||
        Number(summaryData?.pendingBalance) ||
        Number(summaryData?.remainingBalance) ||
        0;

      if (balance > 0) {
        setAmount(String(balance));
      }
    } catch (err) {
      console.log("Member payments error:", err.response?.data || err.message);

      setError(
        err.response?.data?.message || "Failed to load payment information.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const totalPaid = useMemo(() => {
    if (summary?.totalPaid !== undefined) {
      return Number(summary.totalPaid) || 0;
    }

    if (summary?.paid !== undefined) {
      return Number(summary.paid) || 0;
    }

    return payments.reduce(
      (total, payment) => total + (Number(payment.amount) || 0),
      0,
    );
  }, [summary, payments]);

  const pendingBalance = useMemo(() => {
    if (summary?.balance !== undefined) {
      return Number(summary.balance) || 0;
    }

    if (summary?.pendingBalance !== undefined) {
      return Number(summary.pendingBalance) || 0;
    }

    if (summary?.remainingBalance !== undefined) {
      return Number(summary.remainingBalance) || 0;
    }

    return 0;
  }, [summary]);

  const membershipAmount = useMemo(() => {
    return (
      Number(summary?.totalAmount) ||
      Number(summary?.membershipAmount) ||
      Number(summary?.amount) ||
      0
    );
  }, [summary]);

  const handlePayBalance = () => {
    if (!selectedMembershipId) {
      Alert.alert(
        "Membership Required",
        "No active membership was found for payment.",
      );
      return;
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }

    if (pendingBalance > 0 && paymentAmount > pendingBalance) {
      Alert.alert(
        "Invalid Amount",
        `You cannot pay more than the pending balance of Rs. ${pendingBalance.toLocaleString()}.`,
      );
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Pay Rs. ${paymentAmount.toLocaleString()} towards your membership balance?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay",
          onPress: processPayment,
        },
      ],
    );
  };

  const processPayment = async () => {
    try {
      setPaying(true);

      await api.post("/member-payments/pay-balance", {
        membershipId: selectedMembershipId,
        amount: Number(amount),
      });

      Alert.alert(
        "Payment Successful",
        "Your payment has been recorded successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              setAmount("");
              loadPayments();
            },
          },
        ],
      );
    } catch (err) {
      console.log("Balance payment error:", err.response?.data || err.message);

      Alert.alert(
        "Payment Failed",
        err.response?.data?.message || "Unable to process the payment.",
      );
    } finally {
      setPaying(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString();
  };

  const getPaymentStatus = (payment) => {
    return (payment.status || payment.paymentStatus || "paid")
      .toString()
      .toLowerCase();
  };

  const getStatusStyle = (status) => {
    if (status === "paid" || status === "completed") {
      return styles.statusPaid;
    }

    if (status === "partial") {
      return styles.statusPartial;
    }

    if (status === "pending") {
      return styles.statusPending;
    }

    return styles.statusDefault;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>Manage your membership payments</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadPayments}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Payment Summary */}

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Membership</Text>

          <Text style={styles.summaryValue}>
            Rs. {membershipAmount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Paid</Text>

          <Text style={styles.summaryValue}>
            Rs. {totalPaid.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Balance</Text>

          <Text
            style={[
              styles.summaryValue,
              pendingBalance > 0 ? styles.balanceValue : styles.paidValue,
            ]}
          >
            Rs. {pendingBalance.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Pay Balance */}

      {pendingBalance > 0 ? (
        <View style={styles.paymentBox}>
          <Text style={styles.sectionTitle}>Pay Membership Balance</Text>

          <Text style={styles.balanceInfo}>
            Pending Balance: Rs. {pendingBalance.toLocaleString()}
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.payButton, paying && styles.disabledButton]}
            onPress={handlePayBalance}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay Balance</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.paidBox}>
          <Text style={styles.paidTitle}>Payment Complete</Text>

          <Text style={styles.paidMessage}>
            You have no pending membership balance.
          </Text>
        </View>
      )}

      {/* Payment History */}

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Payment History</Text>

        {payments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No Payments Found</Text>

            <Text style={styles.emptyText}>
              Your payment history will appear here.
            </Text>
          </View>
        ) : (
          payments.map((payment, index) => {
            const status = getPaymentStatus(payment);

            return (
              <View
                key={payment._id || payment.id || `payment-${index}`}
                style={styles.paymentCard}
              >
                <View style={styles.paymentTopRow}>
                  <View>
                    <Text style={styles.paymentAmount}>
                      Rs. {Number(payment.amount || 0).toLocaleString()}
                    </Text>

                    <Text style={styles.paymentDate}>
                      {formatDate(
                        payment.paymentDate ||
                          payment.createdAt ||
                          payment.date,
                      )}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, getStatusStyle(status)]}>
                    <Text style={styles.statusText}>
                      {status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.paymentInfoRow}>
                  <Text style={styles.infoLabel}>Receipt</Text>

                  <Text style={styles.infoValue}>
                    {payment.receiptNumber ||
                      payment.receipt?.receiptNumber ||
                      "N/A"}
                  </Text>
                </View>

                <View style={styles.paymentInfoRow}>
                  <Text style={styles.infoLabel}>Method</Text>

                  <Text style={styles.infoValue}>
                    {payment.paymentMethod || payment.method || "N/A"}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6b7280",
  },

  summaryGrid: {
    gap: 12,
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    elevation: 2,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 7,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  balanceValue: {
    color: "#dc2626",
  },

  paidValue: {
    color: "#16a34a",
  },

  paymentBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  balanceInfo: {
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 12,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  payButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  paidBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  paidTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#15803d",
    marginBottom: 5,
  },

  paidMessage: {
    fontSize: 14,
    color: "#166534",
  },

  historySection: {
    marginTop: 2,
  },

  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  paymentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  paymentAmount: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  paymentDate: {
    marginTop: 5,
    fontSize: 13,
    color: "#6b7280",
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusPaid: {
    backgroundColor: "#dcfce7",
  },

  statusPartial: {
    backgroundColor: "#fef3c7",
  },

  statusPending: {
    backgroundColor: "#fee2e2",
  },

  statusDefault: {
    backgroundColor: "#e5e7eb",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },

  paymentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    marginBottom: 10,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#b91c1c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default MemberPaymentsScreen;
