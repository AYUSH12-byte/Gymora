import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const TrainerWorkoutPlanDetailsScreen = ({ route }) => {
  const { plan } = route.params;

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

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString();
  };

  const memberName = plan.member?.user?.name || "Unknown Member";

  const memberEmail = plan.member?.user?.email || "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{plan.name}</Text>

          <View
            style={[
              styles.statusBadge,
              plan.isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                plan.isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {plan.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <Text style={styles.memberLabel}>Assigned Member</Text>

        <Text style={styles.memberName}>{memberName}</Text>

        {memberEmail ? <Text style={styles.email}>{memberEmail}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Plan Information</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Goal</Text>
          <Text style={styles.value}>{formatGoal(plan.goal)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Difficulty</Text>
          <Text style={styles.value}>{formatDifficulty(plan.difficulty)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>{formatDate(plan.startDate)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>End Date</Text>
          <Text style={styles.value}>{formatDate(plan.endDate)}</Text>
        </View>
      </View>

      {plan.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>

          <Text style={styles.description}>{plan.description}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          <Text style={styles.exerciseCount}>
            {plan.exercises?.length || 0}
          </Text>
        </View>

        {plan.exercises?.length ? (
          plan.exercises.map((exercise, index) => (
            <View key={`${exercise.name}-${index}`} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>
                {index + 1}. {exercise.name}
              </Text>

              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseItem}>
                  <Text style={styles.exerciseLabel}>Sets</Text>
                  <Text style={styles.exerciseValue}>{exercise.sets}</Text>
                </View>

                <View style={styles.exerciseItem}>
                  <Text style={styles.exerciseLabel}>Reps</Text>
                  <Text style={styles.exerciseValue}>{exercise.reps}</Text>
                </View>

                <View style={styles.exerciseItem}>
                  <Text style={styles.exerciseLabel}>Duration</Text>
                  <Text style={styles.exerciseValue}>
                    {exercise.duration || 0} min
                  </Text>
                </View>

                <View style={styles.exerciseItem}>
                  <Text style={styles.exerciseLabel}>Rest</Text>
                  <Text style={styles.exerciseValue}>
                    {exercise.restTime || 0} sec
                  </Text>
                </View>
              </View>

              {exercise.notes ? (
                <Text style={styles.notes}>Note: {exercise.notes}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.noExercises}>
            No exercises added to this plan.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },

  memberLabel: {
    marginTop: 18,
    fontSize: 12,
    color: "#6b7280",
  },

  memberName: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  email: {
    marginTop: 3,
    fontSize: 13,
    color: "#6b7280",
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

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  label: {
    fontSize: 14,
    color: "#6b7280",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  exerciseCount: {
    minWidth: 28,
    textAlign: "center",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "700",
  },

  exerciseCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
  },

  exerciseName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  exerciseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  exerciseItem: {
    alignItems: "center",
  },

  exerciseLabel: {
    fontSize: 11,
    color: "#6b7280",
  },

  exerciseValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  notes: {
    marginTop: 10,
    fontSize: 12,
    color: "#4b5563",
    fontStyle: "italic",
  },

  noExercises: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default TrainerWorkoutPlanDetailsScreen;
