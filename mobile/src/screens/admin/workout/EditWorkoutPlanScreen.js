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
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import api from "../../../services/api";
import SelectPersonModal from "../../../components/SelectPersonModal";

const EditWorkoutPlanScreen = ({ route, navigation }) => {
  const { planId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [memberId, setMemberId] = useState("");
  const [trainerId, setTrainerId] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    loadData();
  }, [planId]);

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

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [planResponse, membersResponse, trainersResponse] =
        await Promise.all([
          api.get(`/workout-plans/${planId}`),
          api.get("/members"),
          api.get("/trainers"),
        ]);

      const plan =
        planResponse.data.workoutPlan ||
        planResponse.data.plan ||
        planResponse.data.data;

      if (!plan) {
        throw new Error("Workout plan not found");
      }

      const membersData =
        membersResponse.data.members || membersResponse.data.data || [];

      const trainersData =
        trainersResponse.data.trainers || trainersResponse.data.data || [];

      const memberList = Array.isArray(membersData) ? membersData : [];

      const trainerList = Array.isArray(trainersData) ? trainersData : [];

      setMembers(memberList);
      setTrainers(trainerList);

      setName(plan.name || "");
      setDescription(plan.description || "");

      setDifficulty(plan.difficulty || "beginner");

      setGoal(plan.goal || "fitness");

      const currentMemberId = plan.member?._id || plan.member || "";

      const currentTrainerId = plan.trainer?._id || plan.trainer || "";

      setMemberId(currentMemberId);
      setTrainerId(currentTrainerId);

      const foundMember = memberList.find(
        (member) => member._id === currentMemberId,
      );

      const foundTrainer = trainerList.find(
        (trainer) => trainer._id === currentTrainerId,
      );

      if (foundMember) {
        setSelectedMember(foundMember);
      }

      if (foundTrainer) {
        setSelectedTrainer(foundTrainer);
      }

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
          : [],
      );
    } catch (error) {
      console.log(
        "Load workout plan error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load workout plan",
      );
    } finally {
      setLoading(false);
    }
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
      current.filter((_, exerciseIndex) => exerciseIndex !== index),
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
          : exercise,
      ),
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Workout plan name is required");
      return false;
    }

    if (!selectedMember) {
      Alert.alert("Validation", "Please select a member");
      return false;
    }

    if (!selectedTrainer) {
      Alert.alert("Validation", "Please select a trainer");
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
      Alert.alert("Validation", "End date cannot be before start date");
      return false;
    }

    if (exercises.length === 0) {
      Alert.alert("Validation", "Add at least one exercise");
      return false;
    }

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];

      if (!exercise.name.trim()) {
        Alert.alert("Validation", `Exercise ${i + 1} name is required`);
        return false;
      }

      if (!exercise.sets || Number(exercise.sets) < 1) {
        Alert.alert("Validation", `Exercise ${i + 1} must have at least 1 set`);
        return false;
      }

      if (!exercise.reps || Number(exercise.reps) < 1) {
        Alert.alert("Validation", `Exercise ${i + 1} must have at least 1 rep`);
        return false;
      }

      if (exercise.duration && Number(exercise.duration) < 0) {
        Alert.alert(
          "Validation",
          `Exercise ${i + 1} duration cannot be negative`,
        );
        return false;
      }

      if (exercise.restTime && Number(exercise.restTime) < 0) {
        Alert.alert(
          "Validation",
          `Exercise ${i + 1} rest time cannot be negative`,
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
        duration: exercise.duration ? Number(exercise.duration) : 0,
        restTime: exercise.restTime ? Number(exercise.restTime) : 60,
        notes: exercise.notes.trim(),
      }));

      const response = await api.put(`/workout-plans/${planId}`, {
        name: name.trim(),
        description: description.trim(),
        difficulty,
        goal,

        member: selectedMember._id,
        trainer: selectedTrainer._id,

        startDate: startDate.trim(),

        endDate: endDate.trim(),

        exercises: formattedExercises,

        isActive,
      });

      if (response.data.success) {
        Alert.alert("Success", "Workout plan updated successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update workout plan",
        );
      }
    } catch (error) {
      console.log(
        "Update workout plan error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update workout plan",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>Loading workout plan...</Text>
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
        <Text style={styles.title}>Edit Workout Plan</Text>

        {/* PLAN NAME */}

        <Text style={styles.label}>Plan Name *</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter workout plan name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          editable={!saving}
          returnKeyType="next"
        />

        {/* DESCRIPTION */}

        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
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
                styles.optionButton,
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
                {item.charAt(0).toUpperCase() + item.slice(1)}
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
              style={[
                styles.goalButton,
                goal === item && styles.selectedOption,
              ]}
              onPress={() => setGoal(item)}
              disabled={saving}
            >
              <Text
                style={[
                  styles.optionText,
                  goal === item && styles.selectedOptionText,
                ]}
              >
                {item
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
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

        <Text style={styles.label}>Start Date *</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          value={startDate}
          onChangeText={setStartDate}
          editable={!saving}
          returnKeyType="next"
        />

        <Text style={styles.label}>End Date *</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          value={endDate}
          onChangeText={setEndDate}
          editable={!saving}
          returnKeyType="done"
        />

        {/* ACTIVE STATUS */}

        <View style={styles.activeRow}>
          <View style={styles.activeContent}>
            <Text style={styles.activeTitle}>Plan Active</Text>

            <Text style={styles.activeSubtitle}>
              Allow this workout plan to remain active
            </Text>
          </View>

          <Switch
            value={isActive}
            onValueChange={setIsActive}
            disabled={saving}
          />
        </View>

        {/* EXERCISES HEADER */}

        <View style={styles.exerciseHeader}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={addExercise}
            disabled={saving}
          >
            <Text style={styles.addExerciseText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* EMPTY EXERCISES */}

        {exercises.length === 0 ? (
          <View style={styles.emptyExercise}>
            <Text style={styles.emptyExerciseText}>No exercises added</Text>
          </View>
        ) : (
          exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseTopRow}>
                <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>

                <TouchableOpacity
                  onPress={() => removeExercise(index)}
                  disabled={saving}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>

              {/* EXERCISE NAME */}

              <Text style={styles.smallLabel}>Exercise Name</Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Bench Press"
                placeholderTextColor="#999"
                value={exercise.name}
                onChangeText={(value) => updateExercise(index, "name", value)}
                editable={!saving}
                returnKeyType="next"
              />

              {/* SETS + REPS */}

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>Sets</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    placeholderTextColor="#999"
                    value={exercise.sets}
                    onChangeText={(value) =>
                      updateExercise(index, "sets", value)
                    }
                    keyboardType="numeric"
                    editable={!saving}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>Reps</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="12"
                    placeholderTextColor="#999"
                    value={exercise.reps}
                    onChangeText={(value) =>
                      updateExercise(index, "reps", value)
                    }
                    keyboardType="numeric"
                    editable={!saving}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* DURATION + REST */}

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>Duration</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Minutes"
                    placeholderTextColor="#999"
                    value={exercise.duration}
                    onChangeText={(value) =>
                      updateExercise(index, "duration", value)
                    }
                    keyboardType="numeric"
                    editable={!saving}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.smallLabel}>Rest Time</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="60"
                    placeholderTextColor="#999"
                    value={exercise.restTime}
                    onChangeText={(value) =>
                      updateExercise(index, "restTime", value)
                    }
                    keyboardType="numeric"
                    editable={!saving}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* NOTES */}

              <Text style={styles.smallLabel}>Notes</Text>

              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                placeholder="Exercise instructions"
                placeholderTextColor="#999"
                value={exercise.notes}
                onChangeText={(value) => updateExercise(index, "notes", value)}
                multiline
                editable={!saving}
                textAlignVertical="top"
              />
            </View>
          ))
        )}

        {/* UPDATE BUTTON */}

        <TouchableOpacity
          style={[styles.updateButton, saving && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator color="#fff" />

              <Text style={[styles.updateButtonText, styles.savingText]}>
                Updating...
              </Text>
            </>
          ) : (
            <Text style={styles.updateButtonText}>Update Workout Plan</Text>
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
          setMemberId(member._id);
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
          setTrainerId(trainer._id);
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
    padding: 20,
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
    marginBottom: 8,
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

  selector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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

  activeRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activeContent: {
    flex: 1,
    paddingRight: 10,
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
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  savingText: {
    marginLeft: 8,
  },

  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default EditWorkoutPlanScreen;
