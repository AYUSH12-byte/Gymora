import React, { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const MemberWorkoutPlansScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadWorkoutPlans = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/member-portal/workout-plans");

      const data =
        response.data?.workoutPlans ||
        response.data?.plans ||
        response.data?.data ||
        [];

      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Member workout plans error:",
        err?.response?.data || err.message,
      );

      setError(err?.response?.data?.message || "Failed to load workout plans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkoutPlans();
    }, []),
  );

  const filteredPlans = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return plans;
    }

    return plans.filter((plan) => {
      const planName = plan?.name?.toLowerCase() || "";

      const goal = plan?.goal?.toLowerCase() || "";

      const difficulty = plan?.difficulty?.toLowerCase() || "";

      const trainerName =
        plan?.trainer?.user?.name?.toLowerCase() ||
        plan?.trainer?.name?.toLowerCase() ||
        "";

      return (
        planName.includes(value) ||
        goal.includes(value) ||
        difficulty.includes(value) ||
        trainerName.includes(value)
      );
    });
  }, [plans, search]);

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

  const formatGoal = (goal) => {
    if (!goal) {
      return "Fitness";
    }

    return goal
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDifficulty = (difficulty) => {
    if (!difficulty) {
      return "Beginner";
    }

    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const getTrainerName = (plan) => {
    return plan?.trainer?.user?.name || plan?.trainer?.name || "Trainer";
  };

  const renderPlan = ({ item }) => {
    const isActive = item?.isActive !== false;

    const exerciseCount = item?.exercises?.length || 0;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.planCard}
        onPress={() =>
          navigation.navigate("MemberWorkoutPlanDetails", {
            plan: item,
          })
        }
      >
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planName} numberOfLines={1}>
              {item?.name || "Workout Plan"}
            </Text>

            <Text style={styles.trainerText}>
              Trainer: {getTrainerName(item)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>

        {item?.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Goal</Text>

            <Text style={styles.infoValue}>{formatGoal(item?.goal)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Difficulty</Text>

            <Text style={styles.infoValue}>
              {formatDifficulty(item?.difficulty)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Exercises</Text>

            <Text style={styles.infoValue}>{exerciseCount}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            Start: {formatDate(item?.startDate)}
          </Text>

          <Text style={styles.dateText}>End: {formatDate(item?.endDate)}</Text>
        </View>

        <View style={styles.viewDetailsRow}>
          <Text style={styles.viewDetailsText}>View Workout Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && plans.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text style={styles.loadingText}>Loading workout plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workout Plans</Text>

        <Text style={styles.subtitle}>
          Follow the workout plans assigned by your trainer
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search workout plans..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={() => loadWorkoutPlans()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredPlans}
        keyExtractor={(item, index) => item?._id || `plan-${index}`}
        renderItem={renderPlan}
        contentContainerStyle={[
          styles.listContent,
          filteredPlans.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadWorkoutPlans(true)}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💪</Text>

            <Text style={styles.emptyTitle}>No Workout Plans</Text>

            <Text style={styles.emptyText}>
              {search
                ? "No workout plans match your search."
                : "Your trainer has not assigned a workout plan yet."}
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
    backgroundColor: "#f3f4f6",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 5,
    lineHeight: 19,
  },

  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
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
    paddingTop: 8,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  planCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
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

  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  planTitleContainer: {
    flex: 1,
    marginRight: 10,
  },

  planName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  trainerText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#f3f4f6",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#6b7280",
  },

  description: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },

  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },

  infoBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 9,
  },

  infoLabel: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "700",
  },

  infoValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "700",
    marginTop: 4,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  dateText: {
    fontSize: 11,
    color: "#6b7280",
  },

  viewDetailsRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 14,
    paddingTop: 12,
  },

  viewDetailsText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "800",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 10,
    fontSize: 14,
  },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
  },

  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },

  retryText: {
    color: "#2563eb",
    fontWeight: "800",
    marginTop: 6,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 19,
  },
});

export default MemberWorkoutPlansScreen;
