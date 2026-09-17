import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import api from "../../../services/api";

const AddPackageScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("months");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const createPackage = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Package name is required");
      return;
    }

    if (!duration || Number(duration) <= 0) {
      Alert.alert("Validation", "Enter a valid duration");
      return;
    }

    if (!price || Number(price) < 0) {
      Alert.alert("Validation", "Enter a valid price");
      return;
    }

    if (Number(discount) < 0 || Number(discount) > 100) {
      Alert.alert("Validation", "Discount must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/packages", {
        name: name.trim(),
        duration: Number(duration),
        durationUnit,
        price: Number(price),
        discount: Number(discount),
        description: description.trim(),
      });

      if (response.data.success) {
        Alert.alert("Success", "Membership package created successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.log(
        "Create package error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create package",
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* Package Name */}
        <Text style={styles.label}>Package Name</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Monthly Membership"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          editable={!loading}
          returnKeyType="next"
        />

        {/* Duration */}
        <Text style={styles.label}>Duration</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 1"
          placeholderTextColor="#999"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          editable={!loading}
          returnKeyType="next"
        />

        {/* Duration Unit */}
        <Text style={styles.label}>Duration Unit</Text>

        <View style={styles.options}>
          {["days", "months", "years"].map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[
                styles.option,
                durationUnit === unit && styles.selectedOption,
              ]}
              onPress={() => setDurationUnit(unit)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  durationUnit === unit && styles.selectedOptionText,
                ]}
              >
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={styles.label}>Price</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 3000"
          placeholderTextColor="#999"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          editable={!loading}
          returnKeyType="next"
        />

        {/* Discount */}
        <Text style={styles.label}>Discount (%)</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. 10"
          placeholderTextColor="#999"
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
          editable={!loading}
          returnKeyType="next"
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Package description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          editable={!loading}
          textAlignVertical="top"
        />

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={createPackage}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />

              <Text style={styles.buttonText}>Creating...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Create Package</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddPackageScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  options: {
    flexDirection: "row",
    gap: 8,
  },

  option: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  selectedOption: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  optionText: {
    textTransform: "capitalize",
    color: "#555",
    fontSize: 14,
  },

  selectedOptionText: {
    color: "#fff",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#111",
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
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

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
