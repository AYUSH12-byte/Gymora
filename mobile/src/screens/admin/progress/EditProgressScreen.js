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

  const handleUpdate = async () => {
    if (!selectedMember) {
      Alert.alert("Validation", "Please select a member");
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

    try {
      setSaving(true);

      const payload = {
        member: selectedMember._id,
        recordedAt: recordedAt
          ? new Date(recordedAt).toISOString()
          : new Date().toISOString(),
        weight: weightValue,
        bodyFat: bodyFat ? Number(bodyFat) : undefined,
        chest: chest ? Number(chest) : undefined,
        waist: waist ? Number(waist) : undefined,
        arms: arms ? Number(arms) : undefined,
        thighs: thighs ? Number(thighs) : undefined,
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Edit Progress</Text>

      <Text style={styles.subtitle}>Update member fitness measurements</Text>

      <Text style={styles.label}>Member *</Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setMemberModalVisible(true)}
      >
        <Text style={styles.selectorText}>{selectedMemberName}</Text>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Recorded Date</Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={recordedAt}
        onChangeText={setRecordedAt}
      />

      <Text style={styles.sectionTitle}>Body Measurements</Text>

      <Text style={styles.label}>Weight (kg) *</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 72.5"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Body Fat (%)</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 18.5"
        value={bodyFat}
        onChangeText={setBodyFat}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Chest (cm)</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 95"
        value={chest}
        onChangeText={setChest}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Waist (cm)</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 82"
        value={waist}
        onChangeText={setWaist}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Arms (cm)</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 34"
        value={arms}
        onChangeText={setArms}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Thighs (cm)</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 55"
        value={thighs}
        onChangeText={setThighs}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Notes</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Progress notes..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Update Progress</Text>
        )}
      </TouchableOpacity>

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
        getEmail={(member) => member.user?.email || member.email || "No email"}
      />
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
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 3,
  },

  textArea: {
    minHeight: 100,
  },

  saveButton: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default EditProgressScreen;
