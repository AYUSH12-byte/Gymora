import React from "react";

import { View, Text, StyleSheet, ScrollView } from "react-native";

const MemberWorkoutPlanDetailsScreen = ({ route }) => {
  const plan = route?.params?.plan;

  if (!plan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Workout plan not found</Text>

        <Text style={styles.errorText}>
          The selected workout plan could not be loaded.
        </Text>
      </View>
    );
  }

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

  const trainerName =
    plan?.trainer?.user?.name || plan?.trainer?.name || "Trainer";

  const exercises = Array.isArray(plan?.exercises) ? plan.exercises : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{plan.name || "Workout Plan"}</Text>

            <Text style={styles.trainer}>Trainer: {trainerName}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              plan.isActive !== false
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                plan.isActive !== false
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {plan.isActive !== false ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>

        {plan.description ? (
          <Text style={styles.description}>{plan.description}</Text>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>GOAL</Text>

            <Text style={styles.infoValue}>{formatGoal(plan.goal)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>DIFFICULTY</Text>

            <Text style={styles.infoValue}>
              {formatDifficulty(plan.difficulty)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>START DATE</Text>

            <Text style={styles.infoValue}>{formatDate(plan.startDate)}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>END DATE</Text>

            <Text style={styles.infoValue}>{formatDate(plan.endDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.exerciseHeader}>
        <Text style={styles.sectionTitle}>Exercises</Text>

        <Text style={styles.exerciseCount}>{exercises.length} exercises</Text>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Exercises</Text>

          <Text style={styles.emptyText}>
            No exercises have been added to this workout plan yet.
          </Text>
        </View>
      ) : (
        exercises.map((exercise, index) => (
          <View key={`${exercise.name}-${index}`} style={styles.exerciseCard}>
            <View style={styles.exerciseTop}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>

              <View style={styles.exerciseTitleContainer}>
                <Text style={styles.exerciseName}>
                  {exercise.name || "Exercise"}
                </Text>

                {exercise.notes ? (
                  <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.exerciseStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Sets</Text>

                <Text style={styles.statValue}>{exercise.sets ?? 0}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Reps</Text>

                <Text style={styles.statValue}>{exercise.reps ?? 0}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Duration</Text>

                <Text style={styles.statValue}>
                  {exercise.duration ? `${exercise.duration} min` : "—"}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Rest</Text>

                <Text style={styles.statValue}>
                  {exercise.restTime ? `${exercise.restTime}s` : "—"}
                </Text>
              </View>
            </View>
          </View>
        ))
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

  headerCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  titleContainer: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
  },

  trainer: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 6,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#e5e7eb",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#4b5563",
  },

  description: {
    color: "#d1d5db",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 18,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  infoBox: {
    width: "47%",
    backgroundColor: "#1f2937",
    borderRadius: 9,
    padding: 11,
  },

  infoLabel: {
    color: "#9ca3af",
    fontSize: 9,
    fontWeight: "700",
  },

  infoValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  exerciseCount: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },

  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  exerciseTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  numberText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "800",
  },

  exerciseTitleContainer: {
    flex: 1,
  },

  exerciseName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },

  exerciseNotes: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },

  exerciseStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 9,
    alignItems: "center",
  },

  statLabel: {
    color: "#6b7280",
    fontSize: 10,
  },

  statValue: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  errorText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },
});

export default MemberWorkoutPlanDetailsScreen;
