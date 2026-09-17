import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const TrainerProfileScreen = () => {
  const { logout } = useAuth();

  const [trainer, setTrainer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/trainers/profile");

      const data = response.data?.trainer || response.data?.data;

      if (!data) {
        throw new Error("Trainer profile data not found");
      }

      setTrainer(data);

      const user = data.user || {};

      setName(user.name || data.name || "");
      setPhone(data.phone || "");
      setSpecialization(data.specialization || "");

      setExperience(
        data.experience !== undefined && data.experience !== null
          ? String(data.experience)
          : "",
      );

      setBio(data.bio || "");
    } catch (err) {
      console.error("Load trainer profile error:", err);

      setError(
        err.response?.data?.message || err.message || "Failed to load profile",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Validation", "Phone number is required.");
      return;
    }

    if (experience.trim() && isNaN(Number(experience))) {
      Alert.alert("Validation", "Experience must be a valid number.");
      return;
    }

    if (experience.trim() && Number(experience) < 0) {
      Alert.alert("Validation", "Experience cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/trainers/profile", {
        name: name.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        experience: experience.trim() ? Number(experience) : 0,
        bio: bio.trim(),
      });

      const updatedTrainer = response.data?.trainer || response.data?.data;

      if (updatedTrainer) {
        setTrainer(updatedTrainer);

        const user = updatedTrainer.user || {};

        setName(user.name || updatedTrainer.name || "");

        setPhone(updatedTrainer.phone || "");

        setSpecialization(updatedTrainer.specialization || "");

        setExperience(
          updatedTrainer.experience !== undefined &&
            updatedTrainer.experience !== null
            ? String(updatedTrainer.experience)
            : "",
        );

        setBio(updatedTrainer.bio || "");
      }

      Alert.alert(
        "Success",
        response.data?.message || "Profile updated successfully.",
      );
    } catch (err) {
      console.error("Update trainer profile error:", err);

      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Validation", "Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Validation", "Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Validation", "Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Validation",
        "New password and confirm password do not match.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put("/profile/change-password", {
        currentPassword,
        newPassword,
      });

      Alert.alert(
        "Success",
        response.data?.message || "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error("Change password error:", err);

      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to change password.",
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
          } catch (err) {
            console.error("Logout error:", err);
          }
        },
      },
    ]);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#111827" />

        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error && !trainer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = trainer?.user || {};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "T"}
            </Text>
          </View>

          <Text style={styles.profileName}>{name || "Trainer"}</Text>

          <Text style={styles.profileEmail}>
            {user.email || "No email available"}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>TRAINER</Text>
          </View>
        </View>

        {/* Error */}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        {/* Basic Information */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>

            <TextInput
              style={[styles.input, saving && styles.disabledInput]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              autoCapitalize="words"
              editable={!saving}
            />

            <Text style={styles.label}>Email</Text>

            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user.email || ""}
              editable={false}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone</Text>

            <TextInput
              style={[styles.input, saving && styles.disabledInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Specialization</Text>

            <TextInput
              style={[styles.input, saving && styles.disabledInput]}
              value={specialization}
              onChangeText={setSpecialization}
              placeholder="e.g. Strength Training"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Experience</Text>

            <TextInput
              style={[styles.input, saving && styles.disabledInput]}
              value={experience}
              onChangeText={setExperience}
              placeholder="Years of experience"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Bio</Text>

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                saving && styles.disabledInput,
              ]}
              value={bio}
              onChangeText={setBio}
              placeholder="Write something about yourself"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              editable={!saving}
            />

            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.disabledButton]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />

                  <Text style={styles.buttonLoadingText}>Saving...</Text>
                </>
              ) : (
                <Text style={styles.primaryButtonText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Information */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Joining Date</Text>

              <Text style={styles.infoValue}>
                {formatDate(trainer?.joiningDate)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>

              <View
                style={[
                  styles.statusBadge,
                  trainer?.status === "active"
                    ? styles.activeBadge
                    : styles.inactiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    trainer?.status === "active"
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  {trainer?.status || "unknown"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Change Password */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Current Password</Text>

            <View
              style={[
                styles.passwordContainer,
                changingPassword && styles.disabledPasswordContainer,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!changingPassword}
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

            <Text style={styles.label}>New Password</Text>

            <View
              style={[
                styles.passwordContainer,
                changingPassword && styles.disabledPasswordContainer,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!changingPassword}
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

            <Text style={styles.passwordHint}>
              Password must be at least 6 characters.
            </Text>

            <Text style={styles.label}>Confirm New Password</Text>

            <View
              style={[
                styles.passwordContainer,
                changingPassword && styles.disabledPasswordContainer,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                editable={!changingPassword}
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
                styles.passwordButton,
                changingPassword && styles.disabledButton,
              ]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />

                  <Text style={styles.buttonLoadingText}>Changing...</Text>
                </>
              ) : (
                <Text style={styles.passwordButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f3f4f6",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6b7280",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  profileHeader: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },

  profileName: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
  },

  profileEmail: {
    color: "#d1d5db",
    fontSize: 14,
    marginTop: 5,
  },

  roleBadge: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  roleBadgeText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  errorBoxText: {
    color: "#991b1b",
    fontSize: 14,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },

  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    opacity: 0.8,
  },

  textArea: {
    minHeight: 110,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: "top",
  },

  primaryButton: {
    minHeight: 50,
    backgroundColor: "#111827",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 22,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonLoadingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  infoRow: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  activeText: {
    color: "#166534",
  },

  inactiveText: {
    color: "#991b1b",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  disabledPasswordContainer: {
    backgroundColor: "#f3f4f6",
    opacity: 0.8,
  },

  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
  },

  showButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  showButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },

  passwordHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 7,
  },

  passwordButton: {
    minHeight: 50,
    backgroundColor: "#374151",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 22,
  },

  passwordButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  logoutButton: {
    minHeight: 50,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  logoutButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 30,
  },
});

export default TrainerProfileScreen;
