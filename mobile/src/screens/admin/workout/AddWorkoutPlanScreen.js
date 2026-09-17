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
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import api from "../../../services/api";
import SelectPersonModal from "../../../components/SelectPersonModal";

const AddWorkoutPlanScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [goal, setGoal] = useState("fitness");

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [trainerModalVisible, setTrainerModalVisible] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [exercises, setExercises] = useState([]);

  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [duration, setDuration] = useState("");
  const [restTime, setRestTime] = useState("60");
  const [exerciseNotes, setExerciseNotes] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);

      const [membersResponse, trainersResponse] = await Promise.all([
        api.get("/members"),
        api.get("/trainers"),
      ]);

      const membersData =
        membersResponse.data.members || membersResponse.data.data || [];

      const trainersData =
        trainersResponse.data.trainers || trainersResponse.data.data || [];

      setMembers(Array.isArray(membersData) ? membersData : []);
      setTrainers(Array.isArray(trainersData) ? trainersData : []);
    } catch (error) {
      console.log(
        "Load form data error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load members and trainers",
      );
    } finally {
      setLoadingData(false);
    }
  };

  const getMemberName = (member) => {
    return member.user?.name || member.name || "Unknown Member";
  };

  const getMemberEmail = (member) => {
    return member.user?.email || member.email || "No email";
  };

  const getTrainerName = (trainer) => {
    return trainer.user?.name || trainer.name || "Unknown Trainer";
  };

  const getTrainerEmail = (trainer) => {
    return trainer.user?.email || trainer.email || "No email";
  };

  const addExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert("Validation", "Exercise name is required.");
      return;
    }

    if (!sets || Number(sets) < 1) {
      Alert.alert("Validation", "Sets must be at least 1.");
      return;
    }

    if (!reps || Number(reps) < 1) {
      Alert.alert("Validation", "Reps must be at least 1.");
      return;
    }

    if (duration && Number(duration) < 0) {
      Alert.alert("Validation", "Duration cannot be negative.");
      return;
    }

    if (restTime && Number(restTime) < 0) {
      Alert.alert("Validation", "Rest time cannot be negative.");
      return;
    }

    const newExercise = {
      name: exerciseName.trim(),
      sets: Number(sets),
      reps: Number(reps),
      duration: duration ? Number(duration) : 0,
      restTime: restTime ? Number(restTime) : 60,
      notes: exerciseNotes.trim(),
    };

    setExercises((current) => [...current, newExercise]);

    setExerciseName("");
    setSets("");
    setReps("");
    setDuration("");
    setRestTime("60");
    setExerciseNotes("");
  };

  const removeExercise = (index) => {
    setExercises((current) =>
      current.filter((_, exerciseIndex) => exerciseIndex !== index),
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Workout plan name is required.");
      return;
    }

    if (!selectedMember) {
      Alert.alert("Validation", "Please select a member.");
      return;
    }

    if (!selectedTrainer) {
      Alert.alert("Validation", "Please select a trainer.");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Validation", "Add at least one exercise.");
      return;
    }

    if (
      startDate.trim() &&
      endDate.trim() &&
      new Date(endDate) < new Date(startDate)
    ) {
      Alert.alert("Validation", "End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/workout-plans", {
        name: name.trim(),
        description: description.trim(),
        difficulty,
        goal,

        member: selectedMember._id,
        trainer: selectedTrainer._id,

        exercises,

        startDate: startDate.trim() || undefined,

        endDate: endDate.trim() || undefined,

        isActive: true,
      });

      if (response.data.success) {
        Alert.alert("Success", "Workout plan created successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to create workout plan",
        );
      }
    } catch (error) {
      console.log(
        "Create workout plan error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create workout plan",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>Loading form...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <Text style={styles.title}>Add Workout Plan</Text>

        {/* PLAN DETAILS */}

        <Text style={styles.label}>Plan Name *</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Weight Loss Plan"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          editable={!saving}
          returnKeyType="next"
        />

        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Plan description..."
          placeholderTextColor="#999"
          multiline
          value={description}
          onChangeText={setDescription}
          editable={!saving}
          textAlignVertical="top"
        />

        {/* DIFFICULTY */}

        <Text style={styles.label}>Difficulty</Text>

        <View style={styles.optionRow}>
          {["beginner", "intermediate", "advanced"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.option,
                difficulty === item && styles.selectedOption,
              ]}
              onPress={() => setDifficulty(item)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  difficulty === item && styles.selectedOptionText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GOAL */}

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
              style={[styles.option, goal === item && styles.selectedOption]}
              onPress={() => setGoal(item)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  goal === item && styles.selectedOptionText,
                ]}
              >
                {item.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ASSIGNMENT */}

        <Text style={styles.sectionTitle}>Assignment</Text>

        <Text style={styles.label}>Member *</Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setMemberModalVisible(true)}
          disabled={saving}
        >
          <View style={styles.selectorContent}>
            <Text style={styles.selectorTitle}>
              {selectedMember ? getMemberName(selectedMember) : "Select Member"}
            </Text>

            {selectedMember && (
              <Text style={styles.selectorSubtitle}>
                {getMemberEmail(selectedMember)}
              </Text>
            )}
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Trainer *</Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setTrainerModalVisible(true)}
          disabled={saving}
        >
          <View style={styles.selectorContent}>
            <Text style={styles.selectorTitle}>
              {selectedTrainer
                ? getTrainerName(selectedTrainer)
                : "Select Trainer"}
            </Text>

            {selectedTrainer && (
              <Text style={styles.selectorSubtitle}>
                {getTrainerEmail(selectedTrainer)}
              </Text>
            )}
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* DATES */}

        <Text style={styles.label}>Start Date</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          value={startDate}
          onChangeText={setStartDate}
          editable={!saving}
          returnKeyType="next"
        />

        <Text style={styles.label}>End Date</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          value={endDate}
          onChangeText={setEndDate}
          editable={!saving}
          returnKeyType="done"
        />

        {/* EXERCISES */}

        <Text style={styles.sectionTitle}>Exercises</Text>

        <TextInput
          style={styles.input}
          placeholder="Exercise name"
          placeholderTextColor="#999"
          value={exerciseName}
          onChangeText={setExerciseName}
          editable={!saving}
          returnKeyType="next"
        />

        <View style={styles.twoColumns}>
          <TextInput
            style={[styles.input, styles.columnInput]}
            placeholder="Sets"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={sets}
            onChangeText={setSets}
            editable={!saving}
            returnKeyType="next"
          />

          <TextInput
            style={[styles.input, styles.columnInput]}
            placeholder="Reps"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
            editable={!saving}
            returnKeyType="next"
          />
        </View>

        <View style={styles.twoColumns}>
          <TextInput
            style={[styles.input, styles.columnInput]}
            placeholder="Duration min"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            editable={!saving}
            returnKeyType="next"
          />

          <TextInput
            style={[styles.input, styles.columnInput]}
            placeholder="Rest seconds"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={restTime}
            onChangeText={setRestTime}
            editable={!saving}
            returnKeyType="next"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Exercise notes"
          placeholderTextColor="#999"
          value={exerciseNotes}
          onChangeText={setExerciseNotes}
          editable={!saving}
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[styles.addExerciseButton, saving && styles.disabled]}
          onPress={addExercise}
          disabled={saving}
        >
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </TouchableOpacity>

        {/* EXERCISE LIST */}

        {exercises.map((exercise, index) => (
          <View key={`${exercise.name}-${index}`} style={styles.exerciseCard}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {index + 1}. {exercise.name}
              </Text>

              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.reps} reps
                {"  "}• {exercise.restTime}s rest
              </Text>

              {exercise.duration > 0 && (
                <Text style={styles.exerciseDetails}>
                  Duration: {exercise.duration} min
                </Text>
              )}

              {exercise.notes && (
                <Text style={styles.exerciseDetails}>
                  Notes: {exercise.notes}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => removeExercise(index)}
              disabled={saving}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* SUBMIT */}

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.disabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator color="#fff" />

              <Text style={[styles.submitText, styles.savingText]}>
                Creating...
              </Text>
            </>
          ) : (
            <Text style={styles.submitText}>Create Workout Plan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* MEMBER MODAL */}

      <SelectPersonModal
        visible={memberModalVisible}
        title="Select Member"
        data={members}
        selectedId={selectedMember?._id}
        onSelect={(member) => {
          setSelectedMember(member);
          setMemberModalVisible(false);
        }}
        onClose={() => setMemberModalVisible(false)}
        getName={getMemberName}
        getEmail={getMemberEmail}
      />

      {/* TRAINER MODAL */}

      <SelectPersonModal
        visible={trainerModalVisible}
        title="Select Trainer"
        data={trainers}
        selectedId={selectedTrainer?._id}
        onSelect={(trainer) => {
          setSelectedTrainer(trainer);
          setTrainerModalVisible(false);
        }}
        onClose={() => setTrainerModalVisible(false)}
        getName={getTrainerName}
        getEmail={getTrainerEmail}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    padding: 16,
    paddingBottom: 120,
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
    marginTop: 5,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 14,
    color: "#111",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
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

  selector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectorContent: {
    flex: 1,
  },

  selectorTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  selectorSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: "#777",
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
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 20,
  },

  savingText: {
    marginLeft: 8,
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
