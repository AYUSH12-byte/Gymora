import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const MemberMembershipScreen = () => {
  const [membership, setMembership] = useState(null);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const [error, setError] = useState("");

  // Payment modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const loadMembershipData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [membershipResponse, packagesResponse] = await Promise.all([
        api.get("/member-portal/membership"),
        api.get("/member-portal/packages"),
      ]);

      const membershipData =
        membershipResponse.data?.membership ||
        membershipResponse.data?.data ||
        null;

      const packageData =
        packagesResponse.data?.packages ||
        packagesResponse.data?.data ||
        [];

      setMembership(membershipData);

      setPackages(Array.isArray(packageData) ? packageData : []);
    } catch (err) {
      console.error(
        "Member membership error:",
        err?.response?.data || err.message,
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load membership information",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembershipData();
    }, []),
  );

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString();
  };

  const getPackageName = () => {
    return (
      membership?.package?.name ||
      membership?.packageName ||
      membership?.membershipPackage?.name ||
      "Membership"
    );
  };

  const getPrice = (pkg) => {
    return pkg?.price ?? pkg?.amount ?? pkg?.fee ?? 0;
  };

  const getDiscount = (pkg) => {
    return Number(pkg?.discount || 0);
  };

  const getFinalPrice = (pkg) => {
    const price = Number(getPrice(pkg));
    const discount = getDiscount(pkg);

    return price - (price * discount) / 100;
  };

  const getDuration = (pkg) => {
    return pkg?.duration ?? pkg?.durationInDays ?? pkg?.days ?? 0;
  };

  const getDurationLabel = (pkg) => {
    if (pkg?.durationType) {
      return `${getDuration(pkg)} ${pkg.durationType}`;
    }

    if (pkg?.durationUnit) {
      return `${getDuration(pkg)} ${pkg.durationUnit}`;
    }

    if (getDuration(pkg) === 30) {
      return "1 month";
    }

    if (getDuration(pkg) === 90) {
      return "3 months";
    }

    if (getDuration(pkg) === 180) {
      return "6 months";
    }

    if (getDuration(pkg) === 365) {
      return "1 year";
    }

    return `${getDuration(pkg)} days`;
  };

  const getStatus = () => {
    return membership?.status || membership?.membershipStatus || "inactive";
  };

  const isActive = String(getStatus()).toLowerCase() === "active";

  const daysRemaining =
    membership?.daysRemaining ?? membership?.remainingDays ?? null;

  // Open payment modal
  const openPaymentModal = (pkg) => {
    const finalPrice = getFinalPrice(pkg);

    setSelectedPackage(pkg);
    setPaymentAmount(String(finalPrice));
    setPaymentMethod("cash");
    setPaymentModalVisible(true);
  };

  // Validate and confirm payment
  const handleConfirmPayment = () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a membership package.");
      return;
    }

    const finalPrice = getFinalPrice(selectedPackage);
    const amount = Number(paymentAmount);

    if (!paymentAmount || Number.isNaN(amount) || amount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid payment amount.",
      );
      return;
    }

    if (amount > finalPrice) {
      Alert.alert(
        "Invalid Amount",
        `Payment cannot exceed Rs. ${finalPrice.toLocaleString()}.`,
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Package: ${selectedPackage.name}\nPayment: Rs. ${amount.toLocaleString()}\nMethod: ${getPaymentMethodLabel(
        paymentMethod,
      )}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: purchaseMembership,
        },
      ],
    );
  };

  // Purchase membership
  const purchaseMembership = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);

      const amount = Number(paymentAmount);

      const response = await api.post("/member-purchase/purchase", {
        packageId: selectedPackage._id,
        paymentAmount: amount,
        paymentMethod,
      });

      setPaymentModalVisible(false);

      Alert.alert(
        "Success",
        response.data?.message ||
          "Membership purchased successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setSelectedPackage(null);
              setPaymentAmount("");
              loadMembershipData(true);
            },
          },
        ],
      );
    } catch (err) {
      console.error(
        "Purchase membership error:",
        err?.response?.data || err.message,
      );

      Alert.alert(
        "Purchase Failed",
        err?.response?.data?.message ||
          "Unable to purchase membership",
      );
    } finally {
      setPurchasing(false);
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "cash":
        return "Cash";

      case "card":
        return "Card";

      case "online":
        return "Online";

      case "bank_transfer":
        return "Bank Transfer";

      default:
        return method;
    }
  };

  if (loading && !membership) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text style={styles.loadingText}>
          Loading membership...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMembershipData(true)}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>My Membership</Text>

        <Text style={styles.pageSubtitle}>
          Manage your membership and choose a package
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity onPress={() => loadMembershipData()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* CURRENT MEMBERSHIP */}

        <Text style={styles.sectionTitle}>
          Current Membership
        </Text>

        {membership ? (
          <View style={styles.membershipCard}>
            <View style={styles.membershipTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>
                  PACKAGE
                </Text>

                <Text style={styles.packageName}>
                  {getPackageName()}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isActive
                    ? styles.activeBadge
                    : styles.expiredBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isActive
                      ? styles.activeText
                      : styles.expiredText,
                  ]}
                >
                  {String(getStatus()).toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  Start Date
                </Text>

                <Text style={styles.infoValue}>
                  {formatDate(membership.startDate)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  Expiry Date
                </Text>

                <Text style={styles.infoValue}>
                  {formatDate(
                    membership.endDate ||
                      membership.expiryDate,
                  )}
                </Text>
              </View>
            </View>

            {daysRemaining !== null ? (
              <View style={styles.remainingContainer}>
                <Text style={styles.remainingNumber}>
                  {daysRemaining}
                </Text>

                <Text style={styles.remainingText}>
                  days remaining
                </Text>
              </View>
            ) : null}

            {!isActive ? (
              <View style={styles.expiredNotice}>
                <Text style={styles.expiredNoticeTitle}>
                  Membership expired
                </Text>

                <Text style={styles.expiredNoticeText}>
                  Choose a new package below to continue
                  your membership.
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.emptyMembership}>
            <Text style={styles.emptyTitle}>
              No Active Membership
            </Text>

            <Text style={styles.emptyText}>
              You do not have an active membership. Choose
              a package below to get started.
            </Text>
          </View>
        )}

        {/* AVAILABLE PACKAGES */}

        <Text style={styles.sectionTitle}>
          Available Packages
        </Text>

        {packages.length === 0 ? (
          <View style={styles.emptyMembership}>
            <Text style={styles.emptyTitle}>
              No Packages Available
            </Text>

            <Text style={styles.emptyText}>
              There are currently no membership packages
              available.
            </Text>
          </View>
        ) : (
          packages.map((pkg) => {
            const price = getPrice(pkg);
            const discount = getDiscount(pkg);
            const finalPrice = getFinalPrice(pkg);
            const packageDuration = getDurationLabel(pkg);

            return (
              <View
                key={pkg._id}
                style={styles.packageCard}
              >
                <View style={styles.packageHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.packageCardName}>
                      {pkg.name}
                    </Text>

                    {pkg.description ? (
                      <Text
                        style={styles.packageDescription}
                      >
                        {pkg.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.priceContainer}>
                    {discount > 0 ? (
                      <Text style={styles.originalPrice}>
                        Rs.{" "}
                        {Number(price).toLocaleString()}
                      </Text>
                    ) : null}

                    <Text style={styles.packagePrice}>
                      Rs.{" "}
                      {Number(finalPrice).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.packageDetails}>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>
                      Duration
                    </Text>

                    <Text style={styles.detailValue}>
                      {packageDuration}
                    </Text>
                  </View>

                  {pkg.discount !== undefined ? (
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>
                        Discount
                      </Text>

                      <Text style={styles.detailValue}>
                        {discount}%
                      </Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    purchasing &&
                      styles.disabledButton,
                  ]}
                  disabled={purchasing}
                  onPress={() => openPaymentModal(pkg)}
                >
                  <Text style={styles.actionButtonText}>
                    {isActive
                      ? "Choose & Renew"
                      : "Purchase Membership"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* PAYMENT MODAL */}

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!purchasing) {
            setPaymentModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Membership Payment
                </Text>

                <TouchableOpacity
                  disabled={purchasing}
                  onPress={() =>
                    setPaymentModalVisible(false)
                  }
                >
                  <Text style={styles.closeText}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedPackage ? (
                <>
                  <View style={styles.selectedPackageBox}>
                    <Text style={styles.modalLabel}>
                      PACKAGE
                    </Text>

                    <Text
                      style={styles.selectedPackageName}
                    >
                      {selectedPackage.name}
                    </Text>

                    <Text style={styles.modalPrice}>
                      Final Price: Rs.{" "}
                      {Number(
                        getFinalPrice(selectedPackage),
                      ).toLocaleString()}
                    </Text>
                  </View>

                  {/* PAYMENT AMOUNT */}

                  <Text style={styles.modalSectionTitle}>
                    Payment Amount
                  </Text>

                  <TextInput
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholder="Enter payment amount"
                    keyboardType="numeric"
                    style={styles.paymentInput}
                  />

                  <Text style={styles.paymentHint}>
                    You can pay the full amount or make a
                    partial payment.
                  </Text>

                  {/* PAYMENT METHOD */}

                  <Text style={styles.modalSectionTitle}>
                    Payment Method
                  </Text>

                  <View style={styles.methodContainer}>
                    {[
                      {
                        value: "cash",
                        label: "Cash",
                      },
                      {
                        value: "card",
                        label: "Card",
                      },
                      {
                        value: "online",
                        label: "Online",
                      },
                      {
                        value: "bank_transfer",
                        label: "Bank Transfer",
                      },
                    ].map((method) => {
                      const selected =
                        paymentMethod === method.value;

                      return (
                        <TouchableOpacity
                          key={method.value}
                          style={[
                            styles.methodButton,
                            selected &&
                              styles.selectedMethodButton,
                          ]}
                          onPress={() =>
                            setPaymentMethod(
                              method.value,
                            )
                          }
                          disabled={purchasing}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              selected &&
                                styles.selectedRadioCircle,
                            ]}
                          >
                            {selected ? (
                              <View
                                style={
                                  styles.radioDot
                                }
                              />
                            ) : null}
                          </View>

                          <Text
                            style={[
                              styles.methodText,
                              selected &&
                                styles.selectedMethodText,
                            ]}
                          >
                            {method.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* CONFIRM */}

                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      purchasing &&
                        styles.disabledButton,
                    ]}
                    onPress={handleConfirmPayment}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        style={
                          styles.confirmButtonText
                        }
                      >
                        Confirm Purchase
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() =>
                      setPaymentModalVisible(false)
                    }
                    disabled={purchasing}
                  >
                    <Text style={styles.cancelButtonText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
    backgroundColor: "#f3f4f6",
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 5,
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    marginTop: 4,
  },

  membershipCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },

  membershipTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  smallLabel: {
    color: "#9ca3af",
    fontSize: 10,
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

  expiredBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeText: {
    color: "#166534",
  },

  expiredText: {
    color: "#991b1b",
  },

  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 18,
  },

  infoRow: {
    flexDirection: "row",
    gap: 15,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    color: "#9ca3af",
    fontSize: 11,
  },

  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },

  remainingContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 18,
  },

  remainingNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  remainingText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  expiredNotice: {
    backgroundColor: "#3f1d1d",
    borderRadius: 9,
    padding: 12,
    marginTop: 15,
  },

  expiredNoticeTitle: {
    color: "#fca5a5",
    fontWeight: "800",
    fontSize: 13,
  },

  expiredNoticeText: {
    color: "#fecaca",
    fontSize: 12,
    marginTop: 4,
  },

  emptyMembership: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 22,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 19,
  },

  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 17,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  packageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  packageCardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  packageDescription: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 5,
    lineHeight: 18,
  },

  priceContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  originalPrice: {
    color: "#9ca3af",
    fontSize: 12,
    textDecorationLine: "line-through",
  },

  packagePrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2563eb",
    marginTop: 2,
  },

  packageDetails: {
    flexDirection: "row",
    marginTop: 17,
    gap: 10,
  },

  detailBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
    minWidth: 100,
  },

  detailLabel: {
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "700",
  },

  detailValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  actionButton: {
    backgroundColor: "#2563eb",
    borderRadius: 9,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },

  disabledButton: {
    opacity: 0.7,
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 13,
    marginBottom: 18,
  },

  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },

  retryText: {
    color: "#2563eb",
    fontWeight: "800",
    marginTop: 7,
  },

  /* PAYMENT MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
  },

  closeText: {
    fontSize: 22,
    color: "#6b7280",
    padding: 4,
  },

  selectedPackageBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  modalLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6b7280",
    letterSpacing: 1,
  },

  selectedPackageName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 5,
  },

  modalPrice: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "700",
    marginTop: 6,
  },

  modalSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 9,
  },

  paymentInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 7,
  },

  paymentHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 18,
    lineHeight: 17,
  },

  methodContainer: {
    marginBottom: 20,
  },

  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
  },

  selectedMethodButton: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  selectedRadioCircle: {
    borderColor: "#2563eb",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },

  methodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  selectedMethodText: {
    color: "#2563eb",
    fontWeight: "700",
  },

  confirmButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 14,
  },

  cancelButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default MemberMembershipScreen;