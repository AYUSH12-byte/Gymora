import React, { useState } from "react";
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

const AddTrainerScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phone.trim()
    ) {
      Alert.alert(
        "Validation Error",
        "Name, email, password and phone are required."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/trainers", {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        specialization: specialization.trim(),
        experience: experience
          ? Number(experience)
          : 0,
        salary: salary ? Number(salary) : 0,
        joiningDate: joiningDate.trim() || undefined,
        bio: bio.trim(),
      });

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Trainer created successfully.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.log(
        "Create trainer error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create trainer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        Add Trainer
      </Text>

      <Text style={styles.subtitle}>
        Create a trainer account and profile.
      </Text>

      <Text style={styles.label}>
        Full Name *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter trainer name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>
        Email *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="trainer@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>
        Password *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Minimum 6 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>
        Phone *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <Text style={styles.label}>
        Specialization
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Weight Training"
        value={specialization}
        onChangeText={setSpecialization}
      />

      <Text style={styles.label}>
        Experience (years)
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 3"
        keyboardType="numeric"
        value={experience}
        onChangeText={setExperience}
      />

      <Text style={styles.label}>
        Salary
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. 30000"
        keyboardType="numeric"
        value={salary}
        onChangeText={setSalary}
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
        Bio
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Trainer description..."
        multiline
        numberOfLines={5}
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          loading && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            Create Trainer
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

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
    marginBottom: 22,
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
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddTrainerScreen;