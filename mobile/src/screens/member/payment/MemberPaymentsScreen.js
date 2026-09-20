import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import api from "../../../services/api";

const MemberPaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPayments = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          "/member-portal/payments",
        );

        const data = response.data || {};

        const paymentData =
          data.payments ||
          data.history ||
          data.data ||
          [];

        const summaryData =
          data.summary ||
          data.paymentSummary ||
          null;

        setPayments(
          Array.isArray(paymentData)
            ? paymentData
            : [],
        );

        setSummary(summaryData);
      } catch (err) {
        console.log(
          "Member payments error:",
          err.response?.data || err.message,
        );

        setError(
          err.response?.data?.message ||
            "Failed to load payment information.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

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

  const getPaymentStatus = (payment) => {
    return (
      payment.status ||
      payment.paymentStatus ||
      "paid"
    )
      .toString()
      .toLowerCase();
  };

  const getStatusStyle = (status) => {
    if (
      status === "paid" ||
      status === "completed"
    ) {
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

  const getStatusText = (status) => {
    if (status === "paid") {
      return "Paid";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "partial") {
      return "Partial";
    }

    if (status === "pending") {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const totalPaid = useMemo(() => {
    if (
      summary?.totalPaid !== undefined
    ) {
      return Number(summary.totalPaid) || 0;
    }

    if (
      summary?.paid !== undefined
    ) {
      return Number(summary.paid) || 0;
    }

    return payments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0,
    );
  }, [summary, payments]);

  const pendingAmount = useMemo(() => {
    if (
      summary?.pendingAmount !== undefined
    ) {
      return Number(summary.pendingAmount) || 0;
    }

    if (
      summary?.pendingBalance !== undefined
    ) {
      return Number(summary.pendingBalance) || 0;
    }

    if (
      summary?.remainingAmount !== undefined
    ) {
      return Number(summary.remainingAmount) || 0;
    }

    if (
      summary?.balance !== undefined
    ) {
      return Number(summary.balance) || 0;
    }

    return 0;
  }, [summary]);

  const paymentStatus = useMemo(() => {
    if (
      summary?.paymentStatus
    ) {
      return summary.paymentStatus
        .toString()
        .toLowerCase();
    }

    if (pendingAmount <= 0) {
      return "paid";
    }

    if (totalPaid > 0) {
      return "partial";
    }

    return "pending";
  }, [
    summary,
    pendingAmount,
    totalPaid,
  ]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading payments...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadPayments(true)
          }
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Payments
        </Text>

        <Text style={styles.subtitle}>
          View your payment information
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>
              Total Payments
            </Text>

            <Text style={styles.summaryCount}>
              {payments.length}
            </Text>
          </View>

          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>
              Total Paid
            </Text>

            <Text style={styles.summaryAmount}>
              Rs.{" "}
              {totalPaid.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.pendingRow}>
          <View>
            <Text style={styles.pendingLabel}>
              Pending Amount
            </Text>

            <Text
              style={[
                styles.pendingAmount,
                pendingAmount <= 0 &&
                  styles.noPendingAmount,
              ]}
            >
              Rs.{" "}
              {pendingAmount.toLocaleString()}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              getStatusStyle(
                paymentStatus,
              ),
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(
                paymentStatus,
              )}
            </Text>
          </View>
        </View>
      </View>

      {pendingAmount > 0 ? (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingTitle}>
            Pending Payment
          </Text>

          <Text style={styles.pendingMessage}>
            You have a pending membership
            payment of{" "}
            <Text style={styles.pendingMessageAmount}>
              Rs.{" "}
              {pendingAmount.toLocaleString()}
            </Text>
            .
          </Text>

          <Text style={styles.pendingNote}>
            Please contact the gym administrator
            to complete the payment.
          </Text>
        </View>
      ) : (
        <View style={styles.paidBox}>
          <Text style={styles.paidTitle}>
            Payment Complete
          </Text>

          <Text style={styles.paidMessage}>
            You currently have no pending
            payment.
          </Text>
        </View>
      )}

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          Payment History
        </Text>

        {payments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              No Payments Found
            </Text>

            <Text style={styles.emptyText}>
              Your payment history will appear
              here after the administrator
              records a payment.
            </Text>
          </View>
        ) : (
          payments.map(
            (payment, index) => {
              const status =
                getPaymentStatus(payment);

              return (
                <View
                  key={
                    payment._id ||
                    payment.id ||
                    `payment-${index}`
                  }
                  style={styles.paymentCard}
                >
                  <View
                    style={
                      styles.paymentTopRow
                    }
                  >
                    <View
                      style={
                        styles.amountContainer
                      }
                    >
                      <Text
                        style={
                          styles.paymentAmount
                        }
                      >
                        Rs.{" "}
                        {Number(
                          payment.amount || 0,
                        ).toLocaleString()}
                      </Text>

                      <Text
                        style={
                          styles.paymentDate
                        }
                      >
                        {formatDateTime(
                          payment.paidAt ||
                            payment.paymentDate ||
                            payment.createdAt ||
                            payment.date,
                        )}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        getStatusStyle(status),
                      ]}
                    >
                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {getStatusText(
                          status,
                        )}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.divider}
                  />

                  <View
                    style={
                      styles.paymentInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.infoLabel
                      }
                    >
                      Receipt
                    </Text>

                    <Text
                      style={
                        styles.infoValue
                      }
                    >
                      {payment.receiptNumber ||
                        payment.receipt
                          ?.receiptNumber ||
                        "N/A"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.paymentInfoRow
                    }
                  >
                    <Text
                      style={
                        styles.infoLabel
                      }
                    >
                      Payment Method
                    </Text>

                    <Text
                      style={
                        styles.infoValue
                      }
                    >
                      {payment.paymentMethod ||
                        payment.method ||
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
                          styles.infoLabel
                        }
                      >
                        Transaction ID
                      </Text>

                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {payment.transactionId}
                      </Text>
                    </View>
                  ) : null}

                  {payment.notes ? (
                    <View
                      style={
                        styles.notesContainer
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Notes
                      </Text>

                      <Text
                        style={
                          styles.notesText
                        }
                      >
                        {payment.notes}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            },
          )
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
    fontSize: 14,
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

  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 14,
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryRight: {
    alignItems: "flex-end",
  },

  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 5,
  },

  summaryCount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  summaryAmount: {
    fontSize: 21,
    fontWeight: "700",
    color: "#16a34a",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },

  pendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pendingLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },

  pendingAmount: {
    fontSize: 23,
    fontWeight: "700",
    color: "#dc2626",
  },

  noPendingAmount: {
    color: "#16a34a",
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 11,
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

  pendingBox: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },

  pendingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#c2410c",
    marginBottom: 7,
  },

  pendingMessage: {
    fontSize: 14,
    color: "#9a3412",
    lineHeight: 21,
  },

  pendingMessageAmount: {
    fontWeight: "700",
    color: "#dc2626",
  },

  pendingNote: {
    marginTop: 8,
    fontSize: 13,
    color: "#9a3412",
    lineHeight: 19,
  },

  paidBox: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
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

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
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

  amountContainer: {
    flex: 1,
  },

  paymentAmount: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  paymentDate: {
    marginTop: 5,
    fontSize: 12,
    color: "#6b7280",
  },

  paymentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
    marginLeft: 15,
  },

  notesContainer: {
    marginTop: 3,
  },

  notesText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
    lineHeight: 19,
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
    elevation: 2,
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
    lineHeight: 20,
  },
});

export default MemberPaymentsScreen;