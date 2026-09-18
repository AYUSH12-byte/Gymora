import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const MemberProfileScreen = () => {
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/profile/me");

      const data =
        response.data?.user ||
        response.data?.profile ||
        response.data?.data ||
        response.data;

      setProfile(data);

      setName(data?.name || data?.user?.name || "");
      setPhone(data?.phone || data?.user?.phone || "");
      setAddress(data?.address || data?.user?.address || "");
    } catch (err) {
      console.log("Member profile error:", err.response?.data || err.message);

      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name is required.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Validation Error", "Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      await api.put("/profile/me", {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      Alert.alert("Success", "Your profile has been updated.");

      loadProfile();
    } catch (err) {
      console.log("Update profile error:", err.response?.data || err.message);

      Alert.alert(
        "Update Failed",
        err.response?.data?.message || "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Validation Error", "Enter your current password.");
      return;
    }

    if (!newPassword) {
      Alert.alert("Validation Error", "Enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Validation Error",
        "New password must be at least 6 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      await api.put("/profile/change-password", {
        currentPassword,
        newPassword,
      });

      Alert.alert("Success", "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.log("Change password error:", err.response?.data || err.message);

      Alert.alert(
        "Password Change Failed",
        err.response?.data?.message || "Unable to change your password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.log("Logout error:", error);
          }
        },
      },
    ]);
  };

  const getEmail = () => {
    return profile?.email || profile?.user?.email || "N/A";
  };

  const getRole = () => {
    return profile?.role || profile?.user?.role || "member";
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading profile...</Text>
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
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "M"}
            </Text>
          </View>

          <Text style={styles.title}>My Profile</Text>

          <Text style={styles.subtitle}>Manage your personal information</Text>
        </View>

        {/* Error */}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Account Information */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Email</Text>

            <Text style={styles.readOnlyValue}>{getEmail()}</Text>
          </View>

          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Role</Text>

            <Text style={styles.readOnlyValue}>
              {getRole().toString().toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Personal Information */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Text style={styles.label}>Full Name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9ca3af"
            style={[styles.input, saving && styles.disabledInput]}
            editable={!saving}
            returnKeyType="next"
          />

          <Text style={styles.label}>Phone</Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            style={[styles.input, saving && styles.disabledInput]}
            editable={!saving}
            returnKeyType="next"
          />

          <Text style={styles.label}>Address</Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            placeholderTextColor="#9ca3af"
            style={[
              styles.input,
              styles.textArea,
              saving && styles.disabledInput,
            ]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!saving}
          />

          <TouchableOpacity
            style={[styles.primaryButton, saving && styles.disabledButton]}
            onPress={handleUpdateProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator color="#fff" size="small" />

                <Text style={styles.buttonLoadingText}>Saving...</Text>
              </>
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          {/* Current Password */}

          <Text style={styles.label}>Current Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showCurrentPassword}
              style={styles.passwordInput}
              editable={!changingPassword}
              returnKeyType="next"
            />

            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={changingPassword}
            >
              <Text style={styles.showButtonText}>
                {showCurrentPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* New Password */}

          <Text style={styles.label}>New Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showNewPassword}
              style={styles.passwordInput}
              editable={!changingPassword}
              returnKeyType="next"
            />

            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
              disabled={changingPassword}
            >
              <Text style={styles.showButtonText}>
                {showNewPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}

          <Text style={styles.label}>Confirm New Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
              editable={!changingPassword}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={changingPassword}
            >
              <Text style={styles.showButtonText}>
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              changingPassword && styles.disabledButton,
            ]}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? (
              <>
                <ActivityIndicator color="#111827" />

                <Text style={styles.secondaryLoadingText}>Changing...</Text>
              </>
            ) : (
              <Text style={styles.secondaryButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout */}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
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
    backgroundColor: "#f5f7fb",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  header: {
    alignItems: "center",
    marginBottom: 22,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6b7280",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  readOnlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  readOnlyLabel: {
    fontSize: 14,
    color: "#6b7280",
  },

  readOnlyValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    maxWidth: "65%",
    textAlign: "right",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
    marginBottom: 14,
  },

  passwordContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 14,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
  },

  showButton: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  showButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },

  disabledInput: {
    backgroundColor: "#f3f4f6",
    opacity: 0.7,
  },

  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  primaryButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 3,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonLoadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  secondaryButton: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 2,
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryLoadingText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  logoutButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 20,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    marginBottom: 10,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#b91c1c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default MemberProfileScreen;
