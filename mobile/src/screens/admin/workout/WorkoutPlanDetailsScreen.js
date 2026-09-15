import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const WorkoutPlanDetailsScreen = ({
  route,
  navigation,
}) => {
  const { planId } = route.params;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPlan = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/workout-plans/${planId}`
      );

      console.log(
        "WORKOUT PLAN DETAILS:",
        response.data
      );

      const data =
        response.data.workoutPlan ||
        response.data.plan ||
        response.data.data;

      setPlan(data || null);
    } catch (error) {
      console.log(
        "Workout plan details error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load workout plan"
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [planId])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text>
          Workout plan not found.
        </Text>
      </View>
    );
  }

  const memberName =
    plan.member?.user?.name ||
    plan.member?.name ||
    "Unassigned";

  const trainerName =
    plan.trainer?.user?.name ||
    plan.trainer?.name ||
    "Unassigned";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerCard}>
        <Text style={styles.title}>
          {plan.name}
        </Text>

        <Text style={styles.description}>
          {plan.description ||
            "No description"}
        </Text>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {plan.difficulty}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {plan.goal}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              plan.isActive
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                plan.isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {plan.isActive
                ? "ACTIVE"
                : "INACTIVE"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Assignment
        </Text>

        <InfoRow
          label="Member"
          value={memberName}
        />

        <InfoRow
          label="Trainer"
          value={trainerName}
        />

        <InfoRow
          label="Start Date"
          value={
            plan.startDate
              ? new Date(
                  plan.startDate
                ).toLocaleDateString()
              : "N/A"
          }
        />

        <InfoRow
          label="End Date"
          value={
            plan.endDate
              ? new Date(
                  plan.endDate
                ).toLocaleDateString()
              : "N/A"
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Exercises (
          {plan.exercises?.length || 0})
        </Text>

        {plan.exercises?.length ? (
          plan.exercises.map(
            (exercise, index) => (
              <View
                key={
                  exercise._id ||
                  `${exercise.name}-${index}`
                }
                style={styles.exercise}
              >
                <Text style={styles.exerciseName}>
                  {index + 1}.{" "}
                  {exercise.name}
                </Text>

                <Text style={styles.exerciseInfo}>
                  {exercise.sets} sets ×{" "}
                  {exercise.reps} reps
                </Text>

                <Text style={styles.exerciseInfo}>
                  Rest:{" "}
                  {exercise.restTime || 0}
                  seconds
                </Text>

                {exercise.duration > 0 && (
                  <Text style={styles.exerciseInfo}>
                    Duration:{" "}
                    {exercise.duration} minutes
                  </Text>
                )}

                {exercise.notes ? (
                  <Text style={styles.notes}>
                    {exercise.notes}
                  </Text>
                ) : null}
              </View>
            )
          )
        ) : (
          <Text style={styles.empty}>
            No exercises added.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate(
            "EditWorkoutPlan",
            {
              planId: plan._id,
            }
          )
        }
      >
        <Text style={styles.editText}>
          Edit Workout Plan
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>
      {label}
    </Text>

    <Text style={styles.value}>
      {value}
    </Text>
  </View>
);

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
  },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  description: {
    color: "#777",
    marginTop: 6,
    lineHeight: 20,
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

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#dc2626",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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

  exercise: {
    backgroundColor: "#f8f8f8",
    borderRadius: 9,
    padding: 13,
    marginBottom: 9,
  },

  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  exerciseInfo: {
    color: "#666",
    marginTop: 5,
  },

  notes: {
    color: "#555",
    marginTop: 7,
    fontStyle: "italic",
  },

  empty: {
    color: "#777",
  },

  editButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 15,
  },

  editText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default WorkoutPlanDetailsScreen;