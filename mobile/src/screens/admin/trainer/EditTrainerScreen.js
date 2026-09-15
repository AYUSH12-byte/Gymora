import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import api from "../../../services/api";

const EditTrainerScreen = ({
  route,
  navigation,
}) => {
  const { trainerId } = route.params;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] =
    useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] =
    useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] =
    useState("active");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadTrainer();
  }, [trainerId]);

  const loadTrainer = async () => {
    try {
      const response = await api.get(
        `/trainers/${trainerId}`
      );

      const trainer =
        response.data.trainer ||
        response.data.data;

      if (!trainer) {
        throw new Error(
          "Trainer not found"
        );
      }

      setName(
        trainer.user?.name ||
          trainer.name ||
          ""
      );

      setEmail(
        trainer.user?.email ||
          trainer.email ||
          ""
      );

      setPhone(trainer.phone || "");

      setSpecialization(
        trainer.specialization || ""
      );

      setExperience(
        trainer.experience != null
          ? String(trainer.experience)
          : ""
      );

      setSalary(
        trainer.salary != null
          ? String(trainer.salary)
          : ""
      );

      setJoiningDate(
        trainer.joiningDate
          ? new Date(
              trainer.joiningDate
            )
              .toISOString()
              .split("T")[0]
          : ""
      );

      setBio(trainer.bio || "");

      setStatus(
        trainer.status || "active"
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to load trainer"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      Alert.alert(
        "Validation Error",
        "Name, email and phone are required."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/trainers/${trainerId}`,
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          specialization:
            specialization.trim(),
          experience: experience
            ? Number(experience)
            : 0,
          salary: salary
            ? Number(salary)
            : 0,
          joiningDate:
            joiningDate.trim() || undefined,
          bio: bio.trim(),
          status,
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Trainer updated successfully.",
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
        "Update trainer error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update trainer"
      );
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Edit Trainer
      </Text>

      <Text style={styles.label}>
        Full Name *
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Email *
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>
        Phone *
      </Text>

      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>
        Specialization
      </Text>

      <TextInput
        style={styles.input}
        value={specialization}
        onChangeText={setSpecialization}
      />

      <Text style={styles.label}>
        Experience (years)
      </Text>

      <TextInput
        style={styles.input}
        value={experience}
        onChangeText={setExperience}
        keyboardType="numeric"
      />

      <Text style={styles.label}>
        Salary
      </Text>

      <TextInput
        style={styles.input}
        value={salary}
        onChangeText={setSalary}
        keyboardType="numeric"
      />

      <Text style={styles.label}>
        Joining Date
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={joiningDate}
        onChangeText={setJoiningDate}
      />

      <Text style={styles.label}>
        Status
      </Text>

      <View style={styles.statusRow}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            status === "active" &&
              styles.selectedStatus,
          ]}
          onPress={() =>
            setStatus("active")
          }
        >
          <Text
            style={[
              styles.statusButtonText,
              status === "active" &&
                styles.selectedStatusText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusButton,
            status === "inactive" &&
              styles.selectedStatus,
          ]}
          onPress={() =>
            setStatus("inactive")
          }
        >
          <Text
            style={[
              styles.statusButtonText,
              status === "inactive" &&
                styles.selectedStatusText,
            ]}
          >
            Inactive
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>
        Bio
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          saving && styles.disabled,
        ]}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>
            Update Trainer
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
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 22,
    color: "#111",
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
    marginBottom: 15,
  },

  textArea: {
    minHeight: 110,
  },

  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  selectedStatus: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  statusButtonText: {
    color: "#333",
    fontWeight: "600",
  },

  selectedStatusText: {
    color: "#fff",
  },

  saveButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default EditTrainerScreen;