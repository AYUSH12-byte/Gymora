import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import api from "../../../services/api";

const RenewMembershipScreen = ({ route, navigation }) => {
  const { membershipId, memberName } = route.params;

  const [membership, setMembership] = useState(null);
  const [packages, setPackages] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [membershipResponse, packagesResponse] = await Promise.all([
        api.get(`/memberships/${membershipId}`),
        api.get("/packages/active"),
      ]);

      const membershipData =
        membershipResponse.data.membership || membershipResponse.data.data;

      const packageData =
        packagesResponse.data.packages || packagesResponse.data.data || [];

      setMembership(membershipData);
      setPackages(Array.isArray(packageData) ? packageData : []);

      if (packageData.length > 0) {
        setSelectedPackage(packageData[0]);
      }
    } catch (error) {
      console.log("Renew data error:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load renewal information",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateDiscount = () => {
    if (!selectedPackage) return 0;

    const price = Number(selectedPackage.price || 0);
    const discount = Number(selectedPackage.discount || 0);

    return (price * discount) / 100;
  };

  const calculateFinalAmount = () => {
    if (!selectedPackage) return 0;

    const price = Number(selectedPackage.price || 0);
    const discountAmount = calculateDiscount();

    return Math.max(price - discountAmount, 0);
  };

  const finalAmount = calculateFinalAmount();

  const handleRenew = async () => {
    if (!selectedPackage) {
      Alert.alert("Validation", "Please select a package.");
      return;
    }

    const amount = Number(paymentAmount);

    if (!paymentAmount || Number.isNaN(amount) || amount <= 0) {
      Alert.alert("Validation", "Please enter a valid payment amount.");
      return;
    }

    if (amount > finalAmount) {
      Alert.alert(
        "Invalid Amount",
        `Payment cannot be greater than Rs. ${finalAmount.toLocaleString()}.`,
      );
      return;
    }

    try {
      setRenewing(true);

      const response = await api.post("/memberships/renew", {
        membershipId,
        packageId: selectedPackage._id,
        paymentAmount: amount,
        paymentMethod,
      });

      if (response.data.success) {
        Alert.alert("Success", "Membership renewed successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Renewal failed.");
      }
    } catch (error) {
      console.log(
        "Renew membership error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Renewal Failed",
        error.response?.data?.message || "Failed to renew membership.",
      );
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>Loading renewal information...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.memberCard}>
        <Text style={styles.sectionTitle}>Member</Text>

        <Text style={styles.memberName}>{memberName || "Unknown Member"}</Text>

        {membership?.package?.name ? (
          <Text style={styles.currentPackage}>
            Current Package: {membership.package.name}
          </Text>
        ) : null}

        <Text style={styles.currentEndDate}>
          Current End Date:{" "}
          {membership?.endDate
            ? new Date(membership.endDate).toLocaleDateString()
            : "N/A"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Package</Text>

        {packages.map((item) => {
          const discountAmount =
            (Number(item.price || 0) * Number(item.discount || 0)) / 100;

          const finalPrice = Math.max(
            Number(item.price || 0) - discountAmount,
            0,
          );

          const selected = selectedPackage?._id === item._id;

          return (
            <TouchableOpacity
              key={item._id}
              style={[styles.packageCard, selected && styles.selectedPackage]}
              onPress={() => setSelectedPackage(item)}
            >
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{item.name}</Text>

                {selected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>Selected</Text>
                  </View>
                )}
              </View>

              <Text style={styles.packageDuration}>
                Duration: {item.duration} {item.durationUnit}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.packagePrice}>
                  Rs. {finalPrice.toLocaleString()}
                </Text>

                {Number(item.discount || 0) > 0 && (
                  <Text style={styles.discountText}>{item.discount}% OFF</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {packages.length === 0 && (
          <Text style={styles.noPackages}>No active packages available.</Text>
        )}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Package Price</Text>

          <Text style={styles.summaryValue}>
            Rs. {Number(selectedPackage?.price || 0).toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>

          <Text style={styles.discountValue}>
            - Rs. {calculateDiscount().toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Final Amount</Text>

          <Text style={styles.totalValue}>
            Rs. {finalAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>Payment Amount</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter payment amount"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={paymentAmount}
          onChangeText={setPaymentAmount}
        />

        {paymentAmount && Number(paymentAmount) < finalAmount && (
          <Text style={styles.remainingText}>
            Remaining: Rs.{" "}
            {Math.max(finalAmount - Number(paymentAmount), 0).toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>Payment Method</Text>

        <View style={styles.methods}>
          {["cash", "card", "online", "bank_transfer"].map((method) => {
            const selected = paymentMethod === method;

            return (
              <TouchableOpacity
                key={method}
                style={[styles.methodButton, selected && styles.selectedMethod]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text
                  style={[
                    styles.methodText,
                    selected && styles.selectedMethodText,
                  ]}
                >
                  {method
                    .replace("_", " ")
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.renewButton, renewing && styles.disabledButton]}
        onPress={handleRenew}
        disabled={renewing}
      >
        {renewing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.renewButtonText}>Renew Membership</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  memberCard: {
    backgroundColor: "#111",
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },


  memberName: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
  },

  currentPackage: {
    color: "#ddd",
    marginTop: 7,
  },

  currentEndDate: {
    color: "#aaa",
    marginTop: 5,
  },

  packageCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  selectedPackage: {
    borderColor: "#111",
    borderWidth: 2,
  },

  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  packageName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  selectedBadge: {
    backgroundColor: "#111",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },

  selectedText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  packageDuration: {
    color: "#777",
    marginTop: 7,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  packagePrice: {
    fontSize: 17,
    fontWeight: "700",
  },

  discountText: {
    color: "#16a34a",
    fontWeight: "700",
  },

  noPackages: {
    color: "#777",
  },

  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#777",
  },

  summaryValue: {
    fontWeight: "600",
  },

  discountValue: {
    color: "#dc2626",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  inputLabel: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111",
  },

  remainingText: {
    marginTop: 7,
    color: "#dc2626",
    fontWeight: "600",
  },

  methods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  methodButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  selectedMethod: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  methodText: {
    color: "#333",
    textTransform: "capitalize",
  },

  selectedMethodText: {
    color: "#fff",
  },

  renewButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.6,
  },

  renewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default RenewMembershipScreen;
