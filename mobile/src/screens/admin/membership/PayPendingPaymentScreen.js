import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../../services/api";

const PayPendingPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { membershipId } = route.params || {};

  const [membership, setMembership] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);

      const [membershipResponse, paymentResponse] = await Promise.all([
        api.get(`/memberships/${membershipId}`),
        api.get(`/payments/membership/${membershipId}`),
      ]);

      const membershipData =
        membershipResponse.data?.membership ||
        membershipResponse.data;

      const paymentData =
        paymentResponse.data?.summary ||
        paymentResponse.data?.paymentSummary ||
        {};

      const remaining = Number(
        paymentData.remainingAmount ||
          paymentResponse.data?.remainingAmount ||
          0
      );

      setMembership(membershipData);
      setRemainingAmount(Math.max(remaining, 0));
      setAmount(remaining > 0 ? String(remaining) : "");
    } catch (error) {
      console.log(
        "Fetch pending payment error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load pending payment details."
      );

      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value) => {
    const numericValue = value.replace(/[^0-9.]/g, "");

    if (numericValue === "") {
      setAmount("");
      return;
    }

    const enteredAmount = Number(numericValue);

    if (enteredAmount > remainingAmount) {
      setAmount(String(remainingAmount));
      return;
    }

    setAmount(numericValue);
  };

  const handlePayment = async () => {
    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }

    if (paymentAmount > remainingAmount) {
      Alert.alert(
        "Invalid Amount",
        `Payment cannot be greater than Rs. ${remainingAmount.toLocaleString()}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/payments", {
        membershipId,
        amount: paymentAmount,
        paymentMethod,
        transactionId: transactionId.trim(),
        notes: notes.trim(),
      });

      const summary = response.data?.paymentSummary;

      Alert.alert(
        "Payment Successful",
        `Rs. ${paymentAmount.toLocaleString()} payment recorded successfully.\n\nRemaining: Rs. ${Number(
          summary?.remainingAmount || 0
        ).toLocaleString()}`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log(
        "Pending payment error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Payment Failed",
        error.response?.data?.message ||
          "Failed to record payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (!membership) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Membership not found.</Text>
      </View>
    );
  }

  if (remainingAmount <= 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.successTitle}>Payment Completed</Text>
        <Text style={styles.successText}>
          This membership has no pending amount.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memberName =
    membership.member?.user?.name ||
    membership.member?.name ||
    "Member";

  const packageName =
    membership.package?.name ||
    "Membership";

  const finalAmount = Number(membership.finalAmount || 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Pay Pending Amount</Text>
      <Text style={styles.subtitle}>
        Record the remaining payment for this membership.
      </Text>

      <View style={styles.memberCard}>
        <Text style={styles.label}>Member</Text>
        <Text style={styles.memberName}>{memberName}</Text>

        <Text style={styles.label}>Package</Text>
        <Text style={styles.value}>{packageName}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Membership Amount</Text>
          <Text style={styles.summaryValue}>
            Rs. {finalAmount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pending Amount</Text>
          <Text style={styles.pendingValue}>
            Rs. {remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.inputLabel}>Payment Amount</Text>

      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={handleAmountChange}
        placeholder="Enter payment amount"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
      />

      <Text style={styles.helperText}>
        Maximum payment: Rs. {remainingAmount.toLocaleString()}
      </Text>

      <Text style={styles.inputLabel}>Payment Method</Text>

      <View style={styles.methodContainer}>
        {[
          { label: "Cash", value: "cash" },
          { label: "Card", value: "card" },
          { label: "Online", value: "online" },
          {
            label: "Bank Transfer",
            value: "bank_transfer",
          },
        ].map((method) => (
          <TouchableOpacity
            key={method.value}
            style={[
              styles.methodButton,
              paymentMethod === method.value &&
                styles.methodButtonActive,
            ]}
            onPress={() => setPaymentMethod(method.value)}
          >
            <Text
              style={[
                styles.methodText,
                paymentMethod === method.value &&
                  styles.methodTextActive,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Transaction ID</Text>

      <TextInput
        style={styles.input}
        value={transactionId}
        onChangeText={setTransactionId}
        placeholder="Optional"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>Notes</Text>

      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional payment notes"
        placeholderTextColor="#999"
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.payButton,
          submitting && styles.disabledButton,
        ]}
        onPress={handlePayment}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>
            Record Payment
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  errorText: {
    fontSize: 16,
    color: "#d00",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },

  memberCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },

  memberName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  summaryCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  pendingValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d97706",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 7,
    marginTop: 5,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fff",
  },

  notesInput: {
    height: 100,
    paddingTop: 14,
  },

  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    marginBottom: 12,
  },

  methodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },

  methodButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },

  methodButtonActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  methodText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },

  methodTextActive: {
    color: "#fff",
  },

  payButton: {
    marginTop: 25,
    backgroundColor: "#111",
    borderRadius: 10,
    minHeight: 52,
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

  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },

  successText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },

  backButton: {
    marginTop: 20,
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 8,
  },

  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PayPendingPaymentScreen;