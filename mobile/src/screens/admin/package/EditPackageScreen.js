import React, { useEffect, useState } from "react";
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

const EditPackageScreen = ({ route, navigation }) => {
  const { packageId } = route.params;

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("months");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPackage();
  }, []);

  const loadPackage = async () => {
    try {
      const response = await api.get(
        `/packages/${packageId}`
      );

      const data =
        response.data.package ||
        response.data.data;

      if (!data) {
        Alert.alert("Error", "Package not found");
        navigation.goBack();
        return;
      }

      setName(data.name || "");
      setDuration(String(data.duration || ""));
      setDurationUnit(
        data.durationUnit || "months"
      );
      setPrice(String(data.price || ""));
      setDiscount(String(data.discount || 0));
      setDescription(data.description || "");
      setIsActive(data.isActive !== false);
    } catch (error) {
      console.log(
        "Load package error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load package"
      );

      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Validation",
        "Package name is required"
      );
      return;
    }

    if (
      !duration ||
      Number(duration) <= 0
    ) {
      Alert.alert(
        "Validation",
        "Enter a valid duration"
      );
      return;
    }

    if (
      !price ||
      Number(price) < 0
    ) {
      Alert.alert(
        "Validation",
        "Enter a valid price"
      );
      return;
    }

    if (
      Number(discount) < 0 ||
      Number(discount) > 100
    ) {
      Alert.alert(
        "Validation",
        "Discount must be between 0 and 100"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/packages/${packageId}`,
        {
          name: name.trim(),
          duration: Number(duration),
          durationUnit,
          price: Number(price),
          discount: Number(discount),
          description: description.trim(),
          isActive,
        }
      );

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Package updated successfully",
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
        "Update package error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update package"
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading package...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 80 : 20
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Package Name */}
        <Text style={styles.label}>
          Package Name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Package name"
          placeholderTextColor="#999"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Duration */}
        <Text style={styles.label}>
          Duration
        </Text>

        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="e.g. 1"
          placeholderTextColor="#999"
          keyboardType="numeric"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Duration Unit */}
        <Text style={styles.label}>
          Duration Unit
        </Text>

        <View style={styles.options}>
          {["days", "months", "years"].map(
            (unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.option,
                  durationUnit === unit &&
                    styles.selectedOption,
                ]}
                onPress={() =>
                  setDurationUnit(unit)
                }
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    durationUnit === unit &&
                      styles.selectedOptionText,
                  ]}
                >
                  {unit}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Price */}
        <Text style={styles.label}>
          Price
        </Text>

        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 3000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Discount */}
        <Text style={styles.label}>
          Discount (%)
        </Text>

        <TextInput
          style={styles.input}
          value={discount}
          onChangeText={setDiscount}
          placeholder="e.g. 10"
          placeholderTextColor="#999"
          keyboardType="numeric"
          editable={!saving}
          returnKeyType="next"
        />

        {/* Description */}
        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Package description"
          placeholderTextColor="#999"
          multiline
          editable={!saving}
          textAlignVertical="top"
        />

        {/* Status */}
        <Text style={styles.label}>
          Status
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={[
              styles.option,
              isActive &&
                styles.selectedOption,
            ]}
            onPress={() => setIsActive(true)}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                isActive &&
                  styles.selectedOptionText,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              !isActive &&
                styles.selectedOption,
            ]}
            onPress={() => setIsActive(false)}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.optionText,
                !isActive &&
                  styles.selectedOptionText,
              ]}
            >
              Inactive
            </Text>
          </TouchableOpacity>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[
            styles.button,
            saving &&
              styles.disabledButton,
          ]}
          onPress={updatePackage}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color="#fff"
              />

              <Text style={styles.buttonText}>
                Updating...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              Update Package
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditPackageScreen;

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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
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
    height: 52,
    backgroundColor: "#111",
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