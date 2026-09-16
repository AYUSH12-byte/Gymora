import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import api from "../../services/api";

const TrainerMembersScreen = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/trainers/my-members");

      if (response.data?.success) {
        setMembers(response.data.members || []);
      } else {
        setError(
          response.data?.message || "Failed to load members"
        );
      }
    } catch (err) {
      console.log(
        "Trainer members error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load assigned members"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const filteredMembers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return members;
    }

    return members.filter((member) => {
      const name = member.user?.name || "";
      const email = member.user?.email || "";
      const phone = member.phone || "";

      return (
        name.toLowerCase().includes(value) ||
        email.toLowerCase().includes(value) ||
        phone.toLowerCase().includes(value)
      );
    });
  }, [members, search]);

  const renderMember = ({ item }) => {
    const name = item.user?.name || "Unknown Member";
    const email = item.user?.email || "-";
    const plans = item.workoutPlans || [];

    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitial(name)}
            </Text>
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.name}>{name}</Text>

            <Text style={styles.email}>{email}</Text>

            <Text style={styles.phone}>
              {item.phone || "-"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.status === "active"
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "active"
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.status || "inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <Text style={styles.detailLabel}>
            Workout Plans
          </Text>

          <Text style={styles.detailValue}>
            {plans.length}
          </Text>
        </View>

        {plans.length > 0 ? (
          <View style={styles.planSection}>
            <Text style={styles.planTitle}>
              Assigned Plans
            </Text>

            {plans.slice(0, 3).map((plan) => (
              <View
                key={plan._id}
                style={styles.planCard}
              >
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>
                    {plan.name}
                  </Text>

                  <Text style={styles.planMeta}>
                    {formatGoal(plan.goal)} •{" "}
                    {capitalize(plan.difficulty)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.planStatus,
                    plan.isActive
                      ? styles.planActive
                      : styles.planInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.planStatusText,
                      plan.isActive
                        ? styles.planActiveText
                        : styles.planInactiveText,
                    ]}
                  >
                    {plan.isActive
                      ? "Active"
                      : "Inactive"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noPlan}>
            No workout plan assigned.
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading members...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Members</Text>

        <Text style={styles.subtitle}>
          {members.length} assigned member
          {members.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search member..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        contentContainerStyle={[
          styles.listContent,
          filteredMembers.length === 0 &&
            styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {search
                ? "No members found"
                : "No assigned members"}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? "Try another search."
                : "Members assigned through workout plans will appear here."}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const getInitial = (name) => {
  if (!name) return "M";

  return name.trim().charAt(0).toUpperCase();
};

const capitalize = (value) => {
  if (!value) return "-";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatGoal = (goal) => {
  if (!goal) return "-";

  return goal
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#374151",
  },

  memberInfo: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  email: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },

  phone: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#991b1b",
  },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 14,
  },

  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  planSection: {
    marginTop: 12,
  },

  planTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },

  planCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  planInfo: {
    flex: 1,
  },

  planName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  planMeta: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 3,
  },

  planStatus: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
  },

  planActive: {
    backgroundColor: "#dcfce7",
  },

  planInactive: {
    backgroundColor: "#fee2e2",
  },

  planStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  planActiveText: {
    color: "#166534",
  },

  planInactiveText: {
    color: "#991b1b",
  },

  noPlan: {
    marginTop: 12,
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
  },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 10,
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    marginTop: 7,
    lineHeight: 19,
  },
});

export default TrainerMembersScreen;