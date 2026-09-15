import React, { useCallback, useState } from "react";
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

import api from "../../../services/api";

const WorkoutPlansScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPlans = async () => {
    try {
      setError("");

      const response = await api.get("/workout-plans");

      console.log("WORKOUT PLANS RESPONSE:", response.data);

      const data =
        response.data.workoutPlans ||
        response.data.plans ||
        response.data.data ||
        [];

      const planList = Array.isArray(data) ? data : [];

      setPlans(planList);
      setFilteredPlans(planList);
    } catch (error) {
      console.log(
        "Load workout plans error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load workout plans"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  const handleSearch = (text) => {
    setSearch(text);

    const query = text.toLowerCase().trim();

    if (!query) {
      setFilteredPlans(plans);
      return;
    }

    const filtered = plans.filter((item) => {
      const planName = item.name || "";
      const description = item.description || "";
      const difficulty = item.difficulty || "";
      const goal = item.goal || "";

      const memberName =
        item.member?.user?.name ||
        item.member?.name ||
        "";

      const trainerName =
        item.trainer?.user?.name ||
        item.trainer?.name ||
        "";

      return (
        planName.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        difficulty.toLowerCase().includes(query) ||
        goal.toLowerCase().includes(query) ||
        memberName.toLowerCase().includes(query) ||
        trainerName.toLowerCase().includes(query)
      );
    });

    setFilteredPlans(filtered);
  };

  const handleDelete = (planId) => {
    Alert.alert(
      "Delete Workout Plan",
      "Are you sure you want to delete this workout plan?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete(
                `/workout-plans/${planId}`
              );

              if (response.data.success) {
                Alert.alert(
                  "Success",
                  "Workout plan deleted successfully."
                );

                loadPlans();
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete workout plan"
              );
            }
          },
        },
      ]
    );
  };

  const renderPlan = ({ item }) => {
    const memberName =
      item.member?.user?.name ||
      item.member?.name ||
      "Unassigned";

    const trainerName =
      item.trainer?.user?.name ||
      item.trainer?.name ||
      "Unassigned";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>
              W
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.planName}>
              {item.name || "Unnamed Plan"}
            </Text>

            <Text style={styles.description}>
              {item.description ||
                "No description"}
            </Text>
          </View>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.difficulty || "N/A"}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.goal || "N/A"}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              item.isActive
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                item.isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.isActive
                ? "ACTIVE"
                : "INACTIVE"}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Member
            </Text>

            <Text style={styles.value}>
              {memberName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Trainer
            </Text>

            <Text style={styles.value}>
              {trainerName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Exercises
            </Text>

            <Text style={styles.value}>
              {item.exercises?.length || 0}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Start Date
            </Text>

            <Text style={styles.value}>
              {item.startDate
                ? new Date(
                    item.startDate
                  ).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              End Date
            </Text>

            <Text style={styles.value}>
              {item.endDate
                ? new Date(
                    item.endDate
                  ).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate(
                "WorkoutPlanDetails",
                {
                  planId: item._id,
                }
              )
            }
          >
            <Text style={styles.detailsText}>
              Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(
                "EditWorkoutPlan",
                {
                  planId: item._id,
                }
              )
            }
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDelete(item._id)
            }
          >
            <Text style={styles.deleteText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading workout plans...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Workout Plans
          </Text>

          <Text style={styles.subtitle}>
            {plans.length} plan
            {plans.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate(
              "AddWorkoutPlan"
            )
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search plans, members, trainers..."
        value={search}
        onChangeText={handleSearch}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadPlans}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item._id}
        renderItem={renderPlan}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          filteredPlans.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No Workout Plans Found
            </Text>

            <Text style={styles.emptyText}>
              Create a workout plan to assign
              exercises to a member.
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
    marginBottom: 15,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    color: "#777",
    marginTop: 3,
  },

  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 15,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  iconText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  headerInfo: {
    flex: 1,
  },

  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  description: {
    marginTop: 3,
    color: "#777",
  },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },

  badge: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#dc2626",
  },

  infoSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 14,
    paddingTop: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#777",
  },

  value: {
    color: "#111",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  detailsText: {
    color: "#111",
    fontWeight: "600",
  },

  editButton: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteText: {
    color: "#dc2626",
    fontWeight: "600",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  emptyText: {
    marginTop: 7,
    color: "#777",
    textAlign: "center",
  },
});

export default WorkoutPlansScreen;