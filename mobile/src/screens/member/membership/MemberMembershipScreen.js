import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const MemberMembershipScreen = () => {
  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadMembershipData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [membershipResponse, packagesResponse] =
        await Promise.all([
          api.get("/member-portal/membership"),
          api.get("/member-portal/packages"),
        ]);

      console.log(
        "MEMBERSHIP API RESPONSE:",
        JSON.stringify(
          membershipResponse.data,
          null,
          2
        )
      );

      console.log(
        "PACKAGES API RESPONSE:",
        JSON.stringify(
          packagesResponse.data,
          null,
          2
        )
      );

      const membershipList =
        membershipResponse.data?.memberships || [];

      const packageData =
        packagesResponse.data?.packages ||
        packagesResponse.data?.data ||
        [];

      setMemberships(
        Array.isArray(membershipList)
          ? membershipList
          : []
      );

      setPackages(
        Array.isArray(packageData)
          ? packageData
          : []
      );
    } catch (err) {
      console.error(
        "Member membership error:",
        err?.response?.data || err.message
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load membership information"
      );

      setMemberships([]);
      setPackages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembershipData();
    }, [])
  );

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString();
  };

  const getPackageName = (membership) => {
    return (
      membership?.package?.name ||
      membership?.packageName ||
      membership?.membershipPackage?.name ||
      "Membership"
    );
  };

  const getStatus = (membership) => {
    return (
      membership?.status ||
      membership?.membershipStatus ||
      "inactive"
    );
  };

  const getDaysRemaining = (membership) => {
    if (
      membership?.daysRemaining !== undefined &&
      membership?.daysRemaining !== null
    ) {
      return membership.daysRemaining;
    }

    if (
      membership?.remainingDays !== undefined &&
      membership?.remainingDays !== null
    ) {
      return membership.remainingDays;
    }

    const expiryDate = new Date(
      membership?.endDate ||
        membership?.expiryDate
    );

    if (Number.isNaN(expiryDate.getTime())) {
      return null;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    return Math.max(
      0,
      Math.ceil(
        (expiryDate.getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  const getAmount = (membership) => {
    const amount =
      membership?.finalAmount ??
      membership?.amount ??
      membership?.price ??
      membership?.originalAmount ??
      0;

    return `Rs. ${Number(
      amount
    ).toLocaleString()}`;
  };

  const getPaymentStatus = (membership) => {
    return (
      membership?.paymentStatus ||
      "pending"
    );
  };

  const getPrice = (pkg) => {
    return Number(
      pkg?.price ??
        pkg?.amount ??
        pkg?.fee ??
        0
    );
  };

  const getDiscount = (pkg) => {
    return Number(pkg?.discount || 0);
  };

  const getFinalPrice = (pkg) => {
    const price = getPrice(pkg);
    const discount = getDiscount(pkg);

    return (
      price -
      (price * discount) / 100
    );
  };

  const getDuration = (pkg) => {
    return (
      pkg?.duration ??
      pkg?.durationInDays ??
      pkg?.days ??
      0
    );
  };

  const getDurationLabel = (pkg) => {
    if (pkg?.durationType) {
      return `${getDuration(pkg)} ${
        pkg.durationType
      }`;
    }

    if (pkg?.durationUnit) {
      return `${getDuration(pkg)} ${
        pkg.durationUnit
      }`;
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

  const renderStatusBadge = (membership) => {
    const status = String(
      getStatus(membership)
    ).toLowerCase();

    let badgeStyle = styles.expiredBadge;
    let textStyle = styles.expiredText;

    if (status === "active") {
      badgeStyle = styles.activeBadge;
      textStyle = styles.activeText;
    } else if (status === "upcoming") {
      badgeStyle = styles.upcomingBadge;
      textStyle = styles.upcomingText;
    } else if (status === "cancelled") {
      badgeStyle = styles.cancelledBadge;
      textStyle = styles.cancelledText;
    }

    return (
      <View
        style={[
          styles.statusBadge,
          badgeStyle,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            textStyle,
          ]}
        >
          {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderMembershipCard = (
    membership,
    isActive = false
  ) => {
    const daysRemaining =
      getDaysRemaining(membership);

    const paymentStatus = String(
      getPaymentStatus(membership)
    ).toLowerCase();

    return (
      <View
        style={[
          styles.membershipCard,
          isActive &&
            styles.activeMembershipCard,
        ]}
      >
        <View style={styles.membershipTop}>
          <View style={styles.packageContainer}>
            <Text style={styles.smallLabel}>
              PACKAGE
            </Text>

            <Text style={styles.packageName}>
              {getPackageName(membership)}
            </Text>
          </View>

          {renderStatusBadge(membership)}
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Start Date
            </Text>

            <Text style={styles.infoValue}>
              {formatDate(
                membership.startDate
              )}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Expiry Date
            </Text>

            <Text style={styles.infoValue}>
              {formatDate(
                membership.endDate ||
                  membership.expiryDate
              )}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Amount
            </Text>

            <Text style={styles.infoValue}>
              {getAmount(membership)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>
              Payment
            </Text>

            <Text
              style={[
                styles.infoValue,
                paymentStatus === "paid"
                  ? styles.paidText
                  : paymentStatus ===
                    "partial"
                  ? styles.partialText
                  : styles.pendingText,
              ]}
            >
              {paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {isActive &&
        daysRemaining !== null ? (
          <View
            style={styles.remainingContainer}
          >
            <Text
              style={styles.remainingNumber}
            >
              {daysRemaining}
            </Text>

            <Text
              style={styles.remainingText}
            >
              days remaining
            </Text>
          </View>
        ) : null}

        {isActive ? (
          <View style={styles.activeNotice}>
            <Text
              style={styles.activeNoticeTitle}
            >
              Current Membership
            </Text>

            <Text
              style={styles.activeNoticeText}
            >
              This is your currently active
              membership.
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const activeMembership =
    memberships.find(
      (item) =>
        String(
          getStatus(item)
        ).toLowerCase() === "active"
    ) || null;

  const membershipHistory =
    memberships.filter(
      (item) =>
        String(
          getStatus(item)
        ).toLowerCase() !== "active"
    );

  if (loading && memberships.length === 0) {
    return (
      <View
        style={styles.centerContainer}
      >
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

        <Text style={styles.loadingText}>
          Loading memberships...
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
          onRefresh={() =>
            loadMembershipData(true)
          }
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>
        My Memberships
      </Text>

      <Text style={styles.pageSubtitle}>
        View your current membership,
        membership history and available
        packages
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        Active Membership
      </Text>

      {activeMembership ? (
        renderMembershipCard(
          activeMembership,
          true
        )
      ) : (
        <View
          style={styles.emptyMembership}
        >
          <Text style={styles.emptyTitle}>
            No Active Membership
          </Text>

          <Text style={styles.emptyText}>
            You currently do not have an
            active membership. Please contact
            the gym admin for membership
            assignment or renewal.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Membership History
      </Text>

      {membershipHistory.length > 0 ? (
        membershipHistory.map(
          (membership, index) => (
            <View
              key={
                membership._id ||
                index
              }
            >
              {renderMembershipCard(
                membership
              )}
            </View>
          )
        )
      ) : (
        <View
          style={styles.emptyHistory}
        >
          <Text
            style={styles.emptyHistoryTitle}
          >
            No Membership History
          </Text>

          <Text
            style={styles.emptyHistoryText}
          >
            Previous memberships will appear
            here.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Available Packages
      </Text>

      {packages.length === 0 ? (
        <View
          style={styles.emptyMembership}
        >
          <Text style={styles.emptyTitle}>
            No Packages Available
          </Text>

          <Text style={styles.emptyText}>
            There are currently no active
            membership packages.
          </Text>
        </View>
      ) : (
        packages.map((pkg) => {
          const price = getPrice(pkg);
          const discount = getDiscount(pkg);
          const finalPrice =
            getFinalPrice(pkg);
          const packageDuration =
            getDurationLabel(pkg);

          return (
            <View
              key={pkg._id}
              style={styles.packageCard}
            >
              <View
                style={styles.packageHeader}
              >
                <View
                  style={
                    styles.packageInfo
                  }
                >
                  <Text
                    style={
                      styles.packageCardName
                    }
                  >
                    {pkg.name}
                  </Text>

                  {pkg.description ? (
                    <Text
                      style={
                        styles.packageDescription
                      }
                    >
                      {pkg.description}
                    </Text>
                  ) : null}
                </View>

                <View
                  style={
                    styles.priceContainer
                  }
                >
                  {discount > 0 ? (
                    <Text
                      style={
                        styles.originalPrice
                      }
                    >
                      Rs.{" "}
                      {Number(
                        price
                      ).toLocaleString()}
                    </Text>
                  ) : null}

                  <Text
                    style={
                      styles.packagePrice
                    }
                  >
                    Rs.{" "}
                    {Number(
                      finalPrice
                    ).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.packageDetails
                }
              >
                <View
                  style={styles.detailBox}
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Duration
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {packageDuration}
                  </Text>
                </View>

                <View
                  style={styles.detailBox}
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Discount
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {discount}%
                  </Text>
                </View>
              </View>

              <View
                style={styles.adminOnlyNotice}
              >
                <Text
                  style={
                    styles.adminOnlyText
                  }
                >
                  Contact admin to get this
                  package
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Membership assignment and payment
          are managed by the gym admin.
        </Text>
      </View>
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
    paddingBottom: 35,
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
    marginBottom: 24,
    lineHeight: 20,
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
    marginBottom: 22,
  },

  activeMembershipCard: {
    borderWidth: 1,
    borderColor: "#2563eb",
  },

  membershipTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  packageContainer: {
    flex: 1,
    paddingRight: 10,
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

  upcomingBadge: {
    backgroundColor: "#dbeafe",
  },

  cancelledBadge: {
    backgroundColor: "#e5e7eb",
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

  upcomingText: {
    color: "#1d4ed8",
  },

  cancelledText: {
    color: "#374151",
  },

  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 18,
  },

  infoRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 16,
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

  paidText: {
    color: "#86efac",
  },

  partialText: {
    color: "#fde68a",
  },

  pendingText: {
    color: "#fca5a5",
  },

  remainingContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 2,
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

  activeNotice: {
    backgroundColor: "#172554",
    borderRadius: 9,
    padding: 12,
    marginTop: 15,
  },

  activeNoticeTitle: {
    color: "#93c5fd",
    fontWeight: "800",
    fontSize: 13,
  },

  activeNoticeText: {
    color: "#bfdbfe",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
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

  emptyHistory: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 22,
    alignItems: "center",
  },

  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  emptyHistoryText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
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

  packageInfo: {
    flex: 1,
    paddingRight: 10,
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

  adminOnlyNotice: {
    backgroundColor: "#f3f4f6",
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 16,
    alignItems: "center",
  },

  adminOnlyText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
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

  footer: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 5,
  },

  footerText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default MemberMembershipScreen;