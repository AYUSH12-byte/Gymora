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
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import api from "../../../services/api";
import SelectPersonModal from "../../../components/SelectPersonModal";

const EditProgressScreen = ({ route, navigation }) => {
  const { progressId } = route.params;

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [memberModalVisible, setMemberModalVisible] = useState(false);

  const [recordedAt, setRecordedAt] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [arms, setArms] = useState("");
  const [thighs, setThighs] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressResponse, membersResponse] = await Promise.all([
        api.get(`/progress/${progressId}`),
        api.get("/members"),
      ]);

      const progressData =
        progressResponse.data.progress || progressResponse.data.data;

      const membersData =
        membersResponse.data.members || membersResponse.data.data || [];

      const memberList = Array.isArray(membersData) ? membersData : [];

      setMembers(memberList);

      if (progressData) {
        setRecordedAt(
          progressData.recordedAt
            ? new Date(progressData.recordedAt).toISOString().split("T")[0]
            : "",
        );

        setWeight(progressData.weight?.toString() || "");

        setBodyFat(progressData.bodyFat?.toString() || "");

        setChest(progressData.chest?.toString() || "");

        setWaist(progressData.waist?.toString() || "");

        setArms(progressData.arms?.toString() || "");

        setThighs(progressData.thighs?.toString() || "");

        setNotes(progressData.notes || "");

        const memberId = progressData.member?._id || progressData.member;

        const foundMember = memberList.find(
          (member) => member._id === memberId,
        );

        if (foundMember) {
          setSelectedMember(foundMember);
        }
      }
    } catch (error) {
      console.log(
        "Edit Progress Load Error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load progress",
      );
    } finally {
      setLoading(false);
    }
  };

  const validateOptionalMeasurement = (value, label) => {
    if (!value.trim()) {
      return true;
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue) || numberValue <= 0) {
      Alert.alert("Validation", `Please enter a valid ${label}`);

      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!selectedMember) {
      Alert.alert("Validation", "Please select a member");
      return;
    }

    if (!recordedAt.trim()) {
      Alert.alert("Validation", "Recorded date is required");
      return;
    }

    if (!weight.trim()) {
      Alert.alert("Validation", "Weight is required");
      return;
    }

    const weightValue = Number(weight);

    if (Number.isNaN(weightValue) || weightValue <= 0) {
      Alert.alert("Validation", "Please enter a valid weight");
      return;
    }

    if (!validateOptionalMeasurement(bodyFat, "body fat")) {
      return;
    }

    if (!validateOptionalMeasurement(chest, "chest measurement")) {
      return;
    }

    if (!validateOptionalMeasurement(waist, "waist measurement")) {
      return;
    }

    if (!validateOptionalMeasurement(arms, "arms measurement")) {
      return;
    }

    if (!validateOptionalMeasurement(thighs, "thighs measurement")) {
      return;
    }

    const selectedDate = new Date(recordedAt);

    if (Number.isNaN(selectedDate.getTime())) {
      Alert.alert(
        "Validation",
        "Please enter a valid date in YYYY-MM-DD format",
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        member: selectedMember._id,

        recordedAt: selectedDate.toISOString(),

        weight: weightValue,

        bodyFat: bodyFat.trim() ? Number(bodyFat) : undefined,

        chest: chest.trim() ? Number(chest) : undefined,

        waist: waist.trim() ? Number(waist) : undefined,

        arms: arms.trim() ? Number(arms) : undefined,

        thighs: thighs.trim() ? Number(thighs) : undefined,

        notes: notes.trim(),
      };

      const response = await api.put(`/progress/${progressId}`, payload);

      if (response.data.success) {
        Alert.alert("Success", "Progress updated successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.log(
        "Update Progress Error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update progress",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedMemberName =
    selectedMember?.user?.name || selectedMember?.name || "Select Member";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading progress...</Text>
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
        <Text style={styles.title}>Edit Progress</Text>

        <Text style={styles.subtitle}>Update member fitness measurements</Text>

        {/* Member */}

        <Text style={styles.label}>Member *</Text>

        <TouchableOpacity
          style={[styles.selector, saving && styles.disabledControl]}
          onPress={() => setMemberModalVisible(true)}
          disabled={saving}
        >
          <Text
            style={selectedMember ? styles.selectorText : styles.placeholder}
          >
            {selectedMemberName}
          </Text>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Recorded Date */}

        <Text style={styles.label}>Recorded Date *</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          value={recordedAt}
          onChangeText={setRecordedAt}
          editable={!saving}
          autoCapitalize="none"
          returnKeyType="next"
        />

        {/* Body Measurements */}

        <Text style={styles.sectionTitle}>Body Measurements</Text>

        {/* Weight */}

        <Text style={styles.label}>Weight (kg) *</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="e.g. 72.5"
          placeholderTextColor="#999"
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Body Fat */}

        <Text style={styles.label}>Body Fat (%)</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="e.g. 18.5"
          placeholderTextColor="#999"
          value={bodyFat}
          onChangeText={setBodyFat}
          keyboardType="decimal-pad"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Chest */}

        <Text style={styles.label}>Chest (cm)</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="e.g. 95"
          placeholderTextColor="#999"
          value={chest}
          onChangeText={setChest}
          keyboardType="decimal-pad"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Waist */}

        <Text style={styles.label}>Waist (cm)</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="e.g. 82"
          placeholderTextColor="#999"
          value={waist}
          onChangeText={setWaist}
          keyboardType="decimal-pad"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Arms */}

        <Text style={styles.label}>Arms (cm)</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="e.g. 34"
          placeholderTextColor="#999"
          value={arms}
          onChangeText={setArms}
          keyboardType="decimal-pad"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Thighs */}

        <Text style={styles.label}>Thighs (cm)</Text>

        <TextInput
          style={[styles.input, saving && styles.disabledInput]}
          placeholder="e.g. 55"
          placeholderTextColor="#999"
          value={thighs}
          onChangeText={setThighs}
          keyboardType="decimal-pad"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Notes */}

        <Text style={styles.label}>Notes</Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
            saving && styles.disabledInput,
          ]}
          placeholder="Progress notes..."
          placeholderTextColor="#999"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!saving}
        />

        {/* Update Button */}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator color="#fff" size="small" />

              <Text style={styles.savingText}>Updating...</Text>
            </>
          ) : (
            <Text style={styles.saveText}>Update Progress</Text>
          )}
        </TouchableOpacity>

        {/* Member Modal */}

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
          getName={(member) =>
            member.user?.name || member.name || "Unknown Member"
          }
          getEmail={(member) =>
            member.user?.email || member.email || "No email"
          }
        />
      </ScrollView>
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
  },

  loadingText: {
    marginTop: 10,
    color: "#777",
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 20,
    color: "#777",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
    marginTop: 12,
  },

  selector: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectorText: {
    color: "#111",
    fontSize: 15,
  },

  placeholder: {
    color: "#999",
    fontSize: 15,
  },

  arrow: {
    fontSize: 25,
    color: "#777",
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

  disabledInput: {
    opacity: 0.6,
  },

  disabledControl: {
    opacity: 0.6,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 3,
    color: "#111",
  },

  textArea: {
    minHeight: 100,
  },

  saveButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  savingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});

export default EditProgressScreen;
