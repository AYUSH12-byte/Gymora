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
  KeyboardAvoidingView,
  Platform,
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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      Alert.alert(
        "Validation Error",
        "Name, email, password and phone are required.",
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 6 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/trainers", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        specialization: specialization.trim(),
        experience: experience ? Number(experience) : 0,
        salary: salary ? Number(salary) : 0,
        joiningDate: joiningDate.trim() || undefined,
        bio: bio.trim(),
      });

      if (response.data.success) {
        Alert.alert("Success", "Trainer created successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.log(
        "Create trainer error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create trainer",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // Keep the form visible while submitting.
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
        <Text style={styles.title}>Add Trainer</Text>

        <Text style={styles.subtitle}>
          Create a trainer account and profile.
        </Text>

        {/* Full Name */}
        <Text style={styles.label}>Full Name *</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter trainer name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Email */}
        <Text style={styles.label}>Email *</Text>

        <TextInput
          style={styles.input}
          placeholder="trainer@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Password */}
        <Text style={styles.label}>Password *</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Minimum 6 characters"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="next"
          />

          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Text style={styles.showButtonText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <Text style={styles.label}>Phone *</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Specialization */}
        <Text style={styles.label}>Specialization</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Weight Training"
          placeholderTextColor="#999"
          value={specialization}
          onChangeText={setSpecialization}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Experience */}
        <Text style={styles.label}>Experience (years)</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 3"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={experience}
          onChangeText={setExperience}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Salary */}
        <Text style={styles.label}>Salary</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 30000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={salary}
          onChangeText={setSalary}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Joining Date */}
        <Text style={styles.label}>Joining Date</Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
          value={joiningDate}
          onChangeText={setJoiningDate}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Bio */}
        <Text style={styles.label}>Bio</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Trainer description..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          value={bio}
          onChangeText={setBio}
          editable={!loading}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />

              <Text style={styles.submitText}>Creating...</Text>
            </View>
          ) : (
            <Text style={styles.submitText}>Create Trainer</Text>
          )}
        </TouchableOpacity>
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
    fontSize: 15,
    color: "#111",
  },

  passwordContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 13,
    fontSize: 15,
    color: "#111",
  },

  showButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  showButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#111",
    height: 52,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddTrainerScreen;
