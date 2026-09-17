import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

const TrainerWorkoutPlansScreen = ({ navigation }) => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkoutPlans = async () => {
    try {
      setError("");

      const response = await api.get("/trainers/my-workout-plans");

      const data = response.data.workoutPlans || response.data.data || [];

      setWorkoutPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Trainer workout plans error:",
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Failed to load workout plans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWorkoutPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return workoutPlans;
    }

    return workoutPlans.filter((plan) => {
      const memberName = plan.member?.user?.name?.toLowerCase() || "";

      const memberEmail = plan.member?.user?.email?.toLowerCase() || "";

      const planName = plan.name?.toLowerCase() || "";

      const goal = plan.goal?.toLowerCase() || "";

      const difficulty = plan.difficulty?.toLowerCase() || "";

      return (
        memberName.includes(keyword) ||
        memberEmail.includes(keyword) ||
        planName.includes(keyword) ||
        goal.includes(keyword) ||
        difficulty.includes(keyword)
      );
    });
  }, [workoutPlans, search]);

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString();
  };

  const formatGoal = (goal) => {
    if (!goal) return "Fitness";

    return goal
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDifficulty = (difficulty) => {
    if (!difficulty) return "Beginner";

    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  const renderPlan = ({ item }) => {
    const memberName = item.member?.user?.name || "Unknown Member";

    const memberEmail = item.member?.user?.email || "";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("TrainerWorkoutPlanDetails", {
            plan: item,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.planName} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={styles.memberName}>{memberName}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {memberEmail ? <Text style={styles.email}>{memberEmail}</Text> : null}

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Goal</Text>
            <Text style={styles.infoValue}>{formatGoal(item.goal)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Difficulty</Text>
            <Text style={styles.infoValue}>
              {formatDifficulty(item.difficulty)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Exercises</Text>
            <Text style={styles.infoValue}>{item.exercises?.length || 0}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            Start: {formatDate(item.startDate)}
          </Text>

          <Text style={styles.dateText}>End: {formatDate(item.endDate)}</Text>
        </View>

        <Text style={styles.viewText}>View workout details →</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading workout plans...</Text>
      </View>
    );
  }

  if (error && workoutPlans.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchWorkoutPlans}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Workout Plans</Text>

        <Text style={styles.subHeading}>
          {workoutPlans.length} assigned plan
          {workoutPlans.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search plans or members..."
        value={search}
        onChangeText={setSearch}
      />

      {error ? <Text style={styles.smallError}>{error}</Text> : null}

      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item._id}
        renderItem={renderPlan}
        contentContainerStyle={
          filteredPlans.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No workout plans found</Text>

            <Text style={styles.emptyText}>
              {search
                ? "Try a different search."
                : "No workout plans have been assigned to you yet."}
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
    backgroundColor: "#f5f7fb",
    padding: 16,
  },

  header: {
    marginBottom: 14,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  subHeading: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  searchInput: {
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  listContainer: {
    paddingBottom: 20,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  titleContainer: {
    flex: 1,
    marginRight: 10,
  },

  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  memberName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  email: {
    marginTop: 3,
    fontSize: 12,
    color: "#6b7280",
  },

  description: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#4b5563",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#f3f4f6",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#6b7280",
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 15,
    gap: 8,
  },

  infoBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 9,
  },

  infoLabel: {
    fontSize: 11,
    color: "#6b7280",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  dateText: {
    fontSize: 12,
    color: "#6b7280",
  },

  viewText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  errorText: {
    textAlign: "center",
    color: "#dc2626",
    fontSize: 15,
    marginBottom: 15,
  },

  smallError: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
  },

  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  emptyBox: {
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
});

export default TrainerWorkoutPlansScreen;
