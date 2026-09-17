import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const TrainerProfileScreen = () => {
  const { logout } = useAuth();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setError("");

      const response = await api.get("/trainers/profile");

      const trainer = response.data.trainer;

      setProfile(trainer);

      setName(trainer?.user?.name || "");
      setPhone(trainer?.phone || "");
      setSpecialization(trainer?.specialization || "");
      setExperience(trainer?.experience?.toString() || "0");
      setBio(trainer?.bio || "");
    } catch (err) {
      console.error(
        "Trainer profile error:",
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Validation", "Phone is required");
      return;
    }

    const experienceNumber = Number(experience);

    if (Number.isNaN(experienceNumber) || experienceNumber < 0) {
      Alert.alert("Validation", "Enter a valid experience");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/trainers/profile", {
        name: name.trim(),
        phone: phone.trim(),
        specialization: specialization.trim(),
        experience: experienceNumber,
        bio: bio.trim(),
      });

      setProfile(response.data.trainer);

      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.error(
        "Update trainer profile error:",
        err.response?.data || err.message,
      );

      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Validation", "Enter your current password");
      return;
    }

    if (!newPassword) {
      Alert.alert("Validation", "Enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);

      await api.put("/profile/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert("Success", "Password changed successfully");
    } catch (err) {
      console.error(
        "Change password error:",
        err.response?.data || err.message,
      );

      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to change password",
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
          await logout();
        },
      },
    ]);
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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

        <Text style={styles.profileEmail}>{profile?.user?.email || ""}</Text>

        <View style={styles.activeBadge}>
          <Text style={styles.activeText}>{profile?.status || "active"}</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Name</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile?.user?.email || ""}
          editable={false}
        />

        <Text style={styles.label}>Phone</Text>

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Specialization</Text>

        <TextInput
          style={styles.input}
          value={specialization}
          onChangeText={setSpecialization}
          placeholder="e.g. Strength Training"
        />

        <Text style={styles.label}>Experience</Text>

        <TextInput
          style={styles.input}
          value={experience}
          onChangeText={setExperience}
          placeholder="Years of experience"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Bio</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Write something about yourself"
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdateProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Trainer Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trainer Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Joining Date</Text>

          <Text style={styles.infoValue}>
            {formatDate(profile?.joiningDate)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Status</Text>

          <Text style={styles.infoValue}>
            {profile?.user?.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <Text style={styles.label}>Current Password</Text>

        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry
        />

        <Text style={styles.label}>New Password</Text>

        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        <Text style={styles.label}>Confirm New Password</Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.passwordButton}
          onPress={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.passwordButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  profileHeader: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginBottom: 14,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
  },

  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  profileEmail: {
    marginTop: 4,
    fontSize: 13,
    color: "#d1d5db",
  },

  activeBadge: {
    marginTop: 10,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },

  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },

  textArea: {
    height: 95,
    paddingTop: 12,
  },

  saveButton: {
    marginTop: 18,
    backgroundColor: "#111827",
    height: 48,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  passwordButton: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    height: 48,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  passwordButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  logoutButton: {
    height: 48,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  logoutText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default TrainerProfileScreen;
