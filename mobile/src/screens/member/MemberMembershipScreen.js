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
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const MemberMembershipScreen = () => {
  const [membership, setMembership] = useState(null);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const [error, setError] = useState("");

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
        packagesResponse.data?.packages || packagesResponse.data?.data || [];

      setMembership(membershipData);

      setPackages(Array.isArray(packageData) ? packageData : []);
    } catch (err) {
      console.error(
        "Member membership error:",
        err?.response?.data || err.message,
      );

      setError(
        err?.response?.data?.message || "Failed to load membership information",
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

  const getDuration = (pkg) => {
    return pkg?.duration ?? pkg?.durationInDays ?? pkg?.days ?? 0;
  };

  const getDurationLabel = (pkg) => {
    if (pkg?.durationType) {
      return `${getDuration(pkg)} ${pkg.durationType}`;
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

  const handlePurchase = (pkg) => {
    Alert.alert("Purchase Membership", `Do you want to purchase ${pkg.name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Continue",
        onPress: () => purchaseMembership(pkg),
      },
    ]);
  };

  const purchaseMembership = async (pkg) => {
    try {
      setPurchasing(true);

      const response = await api.post("/member-purchase/purchase", {
        packageId: pkg._id,
      });

      Alert.alert(
        "Success",
        response.data?.message || "Membership purchased successfully",
        [
          {
            text: "OK",
            onPress: () => loadMembershipData(true),
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
        err?.response?.data?.message || "Unable to purchase membership",
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRenew = (pkg) => {
    Alert.alert(
      "Renew Membership",
      `Do you want to purchase ${pkg.name} as your new membership?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Renew",
          onPress: () => purchaseMembership(pkg),
        },
      ],
    );
  };

  if (loading && !membership) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text style={styles.loadingText}>Loading membership...</Text>
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

      <Text style={styles.sectionTitle}>Current Membership</Text>

      {membership ? (
        <View style={styles.membershipCard}>
          <View style={styles.membershipTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.smallLabel}>PACKAGE</Text>

              <Text style={styles.packageName}>{getPackageName()}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isActive ? styles.activeBadge : styles.expiredBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isActive ? styles.activeText : styles.expiredText,
                ]}
              >
                {String(getStatus()).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Start Date</Text>

              <Text style={styles.infoValue}>
                {formatDate(membership.startDate)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Expiry Date</Text>

              <Text style={styles.infoValue}>
                {formatDate(membership.endDate || membership.expiryDate)}
              </Text>
            </View>
          </View>

          {daysRemaining !== null ? (
            <View style={styles.remainingContainer}>
              <Text style={styles.remainingNumber}>{daysRemaining}</Text>

              <Text style={styles.remainingText}>days remaining</Text>
            </View>
          ) : null}

          {!isActive ? (
            <View style={styles.expiredNotice}>
              <Text style={styles.expiredNoticeTitle}>Membership expired</Text>

              <Text style={styles.expiredNoticeText}>
                Choose a new package below to continue your membership.
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyMembership}>
          <Text style={styles.emptyTitle}>No Active Membership</Text>

          <Text style={styles.emptyText}>
            You do not have an active membership. Choose a package below to get
            started.
          </Text>
        </View>
      )}

      {/* AVAILABLE PACKAGES */}

      <Text style={styles.sectionTitle}>Available Packages</Text>

      {packages.length === 0 ? (
        <View style={styles.emptyMembership}>
          <Text style={styles.emptyTitle}>No Packages Available</Text>

          <Text style={styles.emptyText}>
            There are currently no membership packages available.
          </Text>
        </View>
      ) : (
        packages.map((pkg) => {
          const price = getPrice(pkg);

          const packageDuration = getDurationLabel(pkg);

          return (
            <View key={pkg._id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.packageCardName}>{pkg.name}</Text>

                  {pkg.description ? (
                    <Text style={styles.packageDescription}>
                      {pkg.description}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.packagePrice}>
                  Rs. {Number(price).toLocaleString()}
                </Text>
              </View>

              <View style={styles.packageDetails}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Duration</Text>

                  <Text style={styles.detailValue}>{packageDuration}</Text>
                </View>

                {pkg.discount !== undefined ? (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>Discount</Text>

                    <Text style={styles.detailValue}>{pkg.discount}%</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  purchasing && styles.disabledButton,
                ]}
                disabled={purchasing}
                onPress={() => {
                  if (isActive) {
                    handleRenew(pkg);
                  } else {
                    handlePurchase(pkg);
                  }
                }}
              >
                {purchasing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {isActive ? "Choose & Renew" : "Purchase Membership"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })
      )}
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

  packagePrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2563eb",
    marginLeft: 10,
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
});

export default MemberMembershipScreen;
