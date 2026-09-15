import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";

import api from "../../../services/api";

const EditWorkoutPlanScreen = ({ route, navigation }) => {
  const { planId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [goal, setGoal] = useState("fitness");

  const [memberId, setMemberId] = useState("");
  const [trainerId, setTrainerId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    loadWorkoutPlan();
  }, [planId]);

  const loadWorkoutPlan = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/workout-plans/${planId}`);

      const plan =
        response.data.workoutPlan ||
        response.data.plan ||
        response.data.data;

      if (!plan) {
        throw new Error("Workout plan not found");
      }

      setName(plan.name || "");
      setDescription(plan.description || "");
      setDifficulty(plan.difficulty || "beginner");
      setGoal(plan.goal || "fitness");

      setMemberId(plan.member?._id || plan.member || "");
      setTrainerId(plan.trainer?._id || plan.trainer || "");

      setStartDate(formatDateForInput(plan.startDate));
      setEndDate(formatDateForInput(plan.endDate));

      setIsActive(plan.isActive !== false);

      setExercises(
        Array.isArray(plan.exercises)
          ? plan.exercises.map((exercise) => ({
              name: exercise.name || "",
              sets: String(exercise.sets || ""),
              reps: String(exercise.reps || ""),
              duration: String(exercise.duration || ""),
              restTime: String(exercise.restTime || ""),
              notes: exercise.notes || "",
            }))
          : []
      );
    } catch (error) {
      console.log(
        "Load workout plan error:",
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

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const addExercise = () => {
    setExercises((current) => [
      ...current,
      {
        name: "",
        sets: "",
        reps: "",
        duration: "",
        restTime: "60",
        notes: "",
      },
    ]);
  };

  const removeExercise = (index) => {
    setExercises((current) =>
      current.filter((_, exerciseIndex) => exerciseIndex !== index)
    );
  };

  const updateExercise = (index, field, value) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) =>
        exerciseIndex === index
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise
      )
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Workout plan name is required");
      return false;
    }

    if (!memberId.trim()) {
      Alert.alert("Validation", "Member ID is required");
      return false;
    }

    if (!trainerId.trim()) {
      Alert.alert("Validation", "Trainer ID is required");
      return false;
    }

    if (!startDate.trim()) {
      Alert.alert("Validation", "Start date is required");
      return false;
    }

    if (!endDate.trim()) {
      Alert.alert("Validation", "End date is required");
      return false;
    }

    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert(
        "Validation",
        "End date cannot be before start date"
      );
      return false;
    }

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];

      if (!exercise.name.trim()) {
        Alert.alert(
          "Validation",
          `Exercise ${i + 1} name is required`
        );
        return false;
      }

      if (!exercise.sets || Number(exercise.sets) < 1) {
        Alert.alert(
          "Validation",
          `Exercise ${i + 1} must have at least 1 set`
        );
        return false;
      }

      if (!exercise.reps || Number(exercise.reps) < 1) {
        Alert.alert(
          "Validation",
          `Exercise ${i + 1} must have at least 1 rep`
        );
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const formattedExercises = exercises.map((exercise) => ({
        name: exercise.name.trim(),
        sets: Number(exercise.sets),
        reps: Number(exercise.reps),
        duration: exercise.duration
          ? Number(exercise.duration)
          : 0,
        restTime: exercise.restTime
          ? Number(exercise.restTime)
          : 60,
        notes: exercise.notes.trim(),
      }));

      const response = await api.put(`/workout-plans/${planId}`, {
        name: name.trim(),
        description: description.trim(),
        difficulty,
        goal,
        member: memberId.trim(),
        trainer: trainerId.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        exercises: formattedExercises,
        isActive,
      });

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Workout plan updated successfully",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          response.data.message ||
            "Failed to update workout plan"
        );
      }
    } catch (error) {
      console.log(
        "Update workout plan error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update workout plan"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>
          Loading workout plan...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Workout Plan</Text>

      <Text style={styles.label}>Plan Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter workout plan name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Difficulty</Text>

      <View style={styles.optionRow}>
        {["beginner", "intermediate", "advanced"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionButton,
                difficulty === item &&
                  styles.selectedOption,
              ]}
              onPress={() => setDifficulty(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  difficulty === item &&
                    styles.selectedOptionText,
                ]}
              >
                {item.charAt(0).toUpperCase() +
                  item.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <Text style={styles.label}>Goal</Text>

      <View style={styles.optionWrap}>
        {[
          "weight_loss",
          "muscle_gain",
          "strength",
          "fitness",
          "endurance",
        ].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.goalButton,
              goal === item && styles.selectedOption,
            ]}
            onPress={() => setGoal(item)}
          >
            <Text
              style={[
                styles.optionText,
                goal === item &&
                  styles.selectedOptionText,
              ]}
            >
              {item
                .split("_")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
                )
                .join(" ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Member ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Member MongoDB ID"
        value={memberId}
        onChangeText={setMemberId}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Trainer ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Trainer MongoDB ID"
        value={trainerId}
        onChangeText={setTrainerId}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Start Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={startDate}
        onChangeText={setStartDate}
        autoCapitalize="none"
      />

      <Text style={styles.label}>End Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={endDate}
        onChangeText={setEndDate}
        autoCapitalize="none"
      />

      <View style={styles.activeRow}>
        <View>
          <Text style={styles.activeTitle}>
            Plan Active
          </Text>
          <Text style={styles.activeSubtitle}>
            Allow this workout plan to remain active
          </Text>
        </View>

        <Switch
          value={isActive}
          onValueChange={setIsActive}
        />
      </View>

      <View style={styles.exerciseHeader}>
        <Text style={styles.sectionTitle}>
          Exercises
        </Text>

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={addExercise}
        >
          <Text style={styles.addExerciseText}>
            + Add Exercise
          </Text>
        </TouchableOpacity>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyExercise}>
          <Text style={styles.emptyExerciseText}>
            No exercises added
          </Text>
        </View>
      ) : (
        exercises.map((exercise, index) => (
          <View
            key={index}
            style={styles.exerciseCard}
          >
            <View style={styles.exerciseTopRow}>
              <Text style={styles.exerciseTitle}>
                Exercise {index + 1}
              </Text>

              <TouchableOpacity
                onPress={() => removeExercise(index)}
              >
                <Text style={styles.removeText}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.smallLabel}>
              Exercise Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Bench Press"
              value={exercise.name}
              onChangeText={(value) =>
                updateExercise(
                  index,
                  "name",
                  value
                )
              }
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.smallLabel}>
                  Sets
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="3"
                  value={exercise.sets}
                  onChangeText={(value) =>
                    updateExercise(
                      index,
                      "sets",
                      value
                    )
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.smallLabel}>
                  Reps
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="12"
                  value={exercise.reps}
                  onChangeText={(value) =>
                    updateExercise(
                      index,
                      "reps",
                      value
                    )
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.smallLabel}>
                  Duration
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Minutes"
                  value={exercise.duration}
                  onChangeText={(value) =>
                    updateExercise(
                      index,
                      "duration",
                      value
                    )
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.smallLabel}>
                  Rest Time
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="60"
                  value={exercise.restTime}
                  onChangeText={(value) =>
                    updateExercise(
                      index,
                      "restTime",
                      value
                    )
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.smallLabel}>
              Notes
            </Text>

            <TextInput
              style={[styles.input, styles.textAreaSmall]}
              placeholder="Exercise instructions"
              value={exercise.notes}
              onChangeText={(value) =>
                updateExercise(
                  index,
                  "notes",
                  value
                )
              }
              multiline
            />
          </View>
        ))
      )}

      <TouchableOpacity
        style={[
          styles.updateButton,
          saving && styles.disabledButton,
        ]}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>
            Update Workout Plan
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
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

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 14,
  },

  smallLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    marginTop: 5,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  textAreaSmall: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
  },

  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionButton: {
    flex: 1,
    minWidth: 95,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: "center",
  },

  goalButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },

  selectedOption: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  optionText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 13,
  },

  selectedOptionText: {
    color: "#fff",
  },

  activeRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },

  activeSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  addExerciseButton: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },

  addExerciseText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  emptyExercise: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  emptyExerciseText: {
    color: "#777",
  },

  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  exerciseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  exerciseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  removeText: {
    color: "#dc2626",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  updateButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default EditWorkoutPlanScreen;