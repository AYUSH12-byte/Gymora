import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const MembershipsScreen = ({ navigation }) => {
  const [memberships, setMemberships] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMemberships = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/memberships");

      console.log("MEMBERSHIPS API RESPONSE:", response.data);

      const data = response.data.memberships || response.data.data || [];

      setMemberships(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Memberships API error:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Failed to load memberships");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMemberships();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMemberships(false);
  };

  const filteredMemberships = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return memberships;
    }

    return memberships.filter((item) => {
      const memberName = item.member?.user?.name || item.member?.name || "";

      const memberEmail = item.member?.user?.email || item.member?.email || "";

      const packageName = item.package?.name || "";

      const status = item.status || "";
      const paymentStatus = item.paymentStatus || "";

      return (
        memberName.toLowerCase().includes(keyword) ||
        memberEmail.toLowerCase().includes(keyword) ||
        packageName.toLowerCase().includes(keyword) ||
        status.toLowerCase().includes(keyword) ||
        paymentStatus.toLowerCase().includes(keyword)
      );
    });
  }, [memberships, search]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return "N/A";
    }

    return formattedDate.toLocaleDateString();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return styles.activeStatus;

      case "expired":
        return styles.expiredStatus;

      case "upcoming":
        return styles.upcomingStatus;

      case "cancelled":
        return styles.cancelledStatus;

      default:
        return styles.defaultStatus;
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return styles.paidStatus;

      case "partial":
        return styles.partialStatus;

      case "pending":
        return styles.pendingStatus;

      default:
        return styles.defaultStatus;
    }
  };

  const handleRenew = (membership) => {
    navigation.navigate("RenewMembership", {
      membershipId: membership._id,
      memberId: membership.member?._id,
      memberName:
        membership.member?.user?.name ||
        membership.member?.name ||
        "Unknown Member",
    });
  };

  const renderMembership = ({ item }) => {
    const memberName =
      item.member?.user?.name || item.member?.name || "Unknown Member";

    const memberEmail =
      item.member?.user?.email || item.member?.email || "No email";

    const packageName = item.package?.name || "Unknown Package";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.memberInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {memberName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.memberText}>
              <Text style={styles.memberName}>{memberName}</Text>

              <Text style={styles.memberEmail}>{memberEmail}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status || "unknown"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Package</Text>
          <Text style={styles.value}>{packageName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>{formatDate(item.startDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>End Date</Text>
          <Text style={styles.value}>{formatDate(item.endDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Final Amount</Text>
          <Text style={styles.amount}>
            Rs. {Number(item.finalAmount || 0).toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Payment</Text>

          <View
            style={[
              styles.paymentBadge,
              getPaymentStatusStyle(item.paymentStatus),
            ]}
          >
            <Text style={styles.paymentText}>
              {item.paymentStatus || "pending"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {item.status !== "cancelled" && (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={() => handleRenew(item)}
            >
              <Text style={styles.renewButtonText}>Renew</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate("MembershipDetails", {
                membershipId: item._id,
              })
            }
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>Loading memberships...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Memberships</Text>

          <Text style={styles.subtitle}>Manage member subscriptions</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{memberships.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search member or package..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadMemberships()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredMemberships}
        keyExtractor={(item) => item._id}
        renderItem={renderMembership}
        contentContainerStyle={
          filteredMemberships.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No Memberships Found</Text>

            <Text style={styles.emptyText}>
              {search
                ? "No memberships match your search."
                : "There are no memberships available yet."}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 14,
  },

  countBadge: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  searchContainer: {
    marginBottom: 15,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111",
  },

  listContent: {
    paddingBottom: 30,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyBox: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: "#777",
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  memberText: {
    flex: 1,
  },

  memberName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  memberEmail: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  activeStatus: {
    backgroundColor: "#dcfce7",
  },

  expiredStatus: {
    backgroundColor: "#fee2e2",
  },

  upcomingStatus: {
    backgroundColor: "#fef3c7",
  },

  cancelledStatus: {
    backgroundColor: "#e5e7eb",
  },

  defaultStatus: {
    backgroundColor: "#eee",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  label: {
    color: "#777",
    fontSize: 14,
  },

  value: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  amount: {
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },

  paymentBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  paymentText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  paidStatus: {
    backgroundColor: "#dcfce7",
  },

  partialStatus: {
    backgroundColor: "#fef3c7",
  },

  pendingStatus: {
    backgroundColor: "#fee2e2",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  renewButton: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
  },

  renewButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  detailsButton: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
  },

  detailsButtonText: {
    color: "#111",
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 7,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default MembershipsScreen;
