import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import api from "../../../services/api";

const AddWorkoutPlanScreen = ({
  navigation,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [difficulty, setDifficulty] =
    useState("beginner");
  const [goal, setGoal] =
    useState("fitness");

  const [memberId, setMemberId] =
    useState("");
  const [trainerId, setTrainerId] =
    useState("");

  const [startDate, setStartDate] =
    useState("");
  const [endDate, setEndDate] =
    useState("");

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [exercises, setExercises] =
    useState([]);

  const [exerciseName, setExerciseName] =
    useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] =
    useState("");
  const [restTime, setRestTime] =
    useState("60");
  const [exerciseNotes, setExerciseNotes] =
    useState("");

  const [loadingData, setLoadingData] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [membersResponse, trainersResponse] =
        await Promise.all([
          api.get("/members"),
          api.get("/trainers"),
        ]);

      const membersData =
        membersResponse.data.members ||
        membersResponse.data.data ||
        [];

      const trainersData =
        trainersResponse.data.trainers ||
        trainersResponse.data.data ||
        [];

      setMembers(
        Array.isArray(membersData)
          ? membersData
          : []
      );

      setTrainers(
        Array.isArray(trainersData)
          ? trainersData
          : []
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load members and trainers"
      );
    } finally {
      setLoadingData(false);
    }
  };

  const addExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert(
        "Validation",
        "Exercise name is required."
      );
      return;
    }

    if (!sets || Number(sets) < 1) {
      Alert.alert(
        "Validation",
        "Sets must be at least 1."
      );
      return;
    }

    if (!reps || Number(reps) < 1) {
      Alert.alert(
        "Validation",
        "Reps must be at least 1."
      );
      return;
    }

    const newExercise = {
      name: exerciseName.trim(),
      sets: Number(sets),
      reps: Number(reps),
      duration: duration
        ? Number(duration)
        : 0,
      restTime: restTime
        ? Number(restTime)
        : 60,
      notes: exerciseNotes.trim(),
    };

    setExercises([
      ...exercises,
      newExercise,
    ]);

    setExerciseName("");
    setSets("");
    setReps("");
    setDuration("");
    setRestTime("60");
    setExerciseNotes("");
  };

  const removeExercise = (index) => {
    setExercises(
      exercises.filter(
        (_, exerciseIndex) =>
          exerciseIndex !== index
      )
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Validation",
        "Workout plan name is required."
      );
      return;
    }

    if (!memberId) {
      Alert.alert(
        "Validation",
        "Please enter a member ID."
      );
      return;
    }

    if (!trainerId) {
      Alert.alert(
        "Validation",
        "Please enter a trainer ID."
      );
      return;
    }

    if (exercises.length === 0) {
      Alert.alert(
        "Validation",
        "Add at least one exercise."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post(
        "/workout-plans",
        {
          name: name.trim(),
          description:
            description.trim(),
          difficulty,
          goal,
          member: memberId.trim(),
          trainer: trainerId.trim(),
          exercises,
          startDate:
            startDate.trim() || undefined,
          endDate:
            endDate.trim() || undefined,
          isActive: true,
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Workout plan created successfully.",
          [
            {
              text: "OK",
              onPress: () =>
                navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.log(
        "Create workout plan error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create workout plan"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading form...
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
      <Text style={styles.title}>
        Add Workout Plan
      </Text>

      <Text style={styles.label}>
        Plan Name *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Weight Loss Plan"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Plan description..."
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>
        Difficulty
      </Text>

      <View style={styles.optionRow}>
        {[
          "beginner",
          "intermediate",
          "advanced",
        ].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.option,
              difficulty === item &&
                styles.selectedOption,
            ]}
            onPress={() =>
              setDifficulty(item)
            }
          >
            <Text
              style={[
                styles.optionText,
                difficulty === item &&
                  styles.selectedOptionText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Goal
      </Text>

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
              styles.option,
              goal === item &&
                styles.selectedOption,
            ]}
            onPress={() =>
              setGoal(item)
            }
          >
            <Text
              style={[
                styles.optionText,
                goal === item &&
                  styles.selectedOptionText,
              ]}
            >
              {item.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>
        Assignment
      </Text>

      <Text style={styles.label}>
        Member ID *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Paste Member ObjectId"
        value={memberId}
        onChangeText={setMemberId}
      />

      <Text style={styles.helper}>
        You can copy the member ID from the
        member details screen.
      </Text>

      <Text style={styles.label}>
        Trainer ID *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Paste Trainer ObjectId"
        value={trainerId}
        onChangeText={setTrainerId}
      />

      <Text style={styles.helper}>
        You can copy the trainer ID from the
        trainer details screen.
      </Text>

      <Text style={styles.label}>
        Start Date
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={startDate}
        onChangeText={setStartDate}
      />

      <Text style={styles.label}>
        End Date
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={endDate}
        onChangeText={setEndDate}
      />

      <Text style={styles.sectionTitle}>
        Exercises
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Exercise name"
        value={exerciseName}
        onChangeText={setExerciseName}
      />

      <View style={styles.twoColumns}>
        <TextInput
          style={[
            styles.input,
            styles.columnInput,
          ]}
          placeholder="Sets"
          keyboardType="numeric"
          value={sets}
          onChangeText={setSets}
        />

        <TextInput
          style={[
            styles.input,
            styles.columnInput,
          ]}
          placeholder="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />
      </View>

      <View style={styles.twoColumns}>
        <TextInput
          style={[
            styles.input,
            styles.columnInput,
          ]}
          placeholder="Duration min"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <TextInput
          style={[
            styles.input,
            styles.columnInput,
          ]}
          placeholder="Rest seconds"
          keyboardType="numeric"
          value={restTime}
          onChangeText={setRestTime}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Exercise notes"
        value={exerciseNotes}
        onChangeText={setExerciseNotes}
      />

      <TouchableOpacity
        style={styles.addExerciseButton}
        onPress={addExercise}
      >
        <Text style={styles.addExerciseText}>
          + Add Exercise
        </Text>
      </TouchableOpacity>

      {exercises.map((exercise, index) => (
        <View
          key={`${exercise.name}-${index}`}
          style={styles.exerciseCard}
        >
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>
              {index + 1}. {exercise.name}
            </Text>

            <Text style={styles.exerciseDetails}>
              {exercise.sets} sets ×{" "}
              {exercise.reps} reps
              {"  "}•{" "}
              {exercise.restTime}s rest
            </Text>

            {exercise.duration > 0 && (
              <Text style={styles.exerciseDetails}>
                Duration:{" "}
                {exercise.duration} min
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() =>
              removeExercise(index)
            }
          >
            <Text style={styles.removeText}>
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.submitButton,
          saving && styles.disabled,
        ]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            Create Workout Plan
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
    padding: 16,
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
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111",
    marginTop: 15,
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 14,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  helper: {
    color: "#888",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 14,
  },

  optionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },

  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },

  option: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 7,
  },

  selectedOption: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  optionText: {
    color: "#333",
    fontSize: 13,
    textTransform: "capitalize",
  },

  selectedOptionText: {
    color: "#fff",
  },

  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },

  columnInput: {
    flex: 1,
  },

  addExerciseButton: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  addExerciseText: {
    color: "#111",
    fontWeight: "700",
  },

  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 9,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    fontWeight: "700",
    color: "#111",
  },

  exerciseDetails: {
    color: "#777",
    marginTop: 4,
    fontSize: 12,
  },

  removeText: {
    color: "#dc2626",
    fontWeight: "600",
    marginLeft: 10,
  },

  submitButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 15,
  },

  disabled: {
    opacity: 0.6,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddWorkoutPlanScreen;