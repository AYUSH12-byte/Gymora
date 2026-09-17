import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const AdminProfileScreen = () => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await api.get("/profile/me");

      const data =
        response.data.profile || response.data.user || response.data.data;

      setProfile(data);

      setName(data?.user?.name || data?.name || user?.name || "");
      setPhone(data?.phone || "");
      setAddress(data?.address || "");
    } catch (error) {
      console.log("Profile error:", error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load profile",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile(false);
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.put("/profile/me", {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      if (response.data.success) {
        Alert.alert("Success", "Profile updated successfully");

        loadProfile(false);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Validation", "Current password is required");
      return;
    }

    if (!newPassword) {
      Alert.alert("Validation", "New password is required");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.put("/profile/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        Alert.alert("Success", "Password changed successfully");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to change password",
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const email = profile?.user?.email || profile?.email || user?.email || "";

  const role = profile?.user?.role || profile?.role || user?.role || "admin";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(name || "A").charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.profileName}>{name || "Admin"}</Text>

        <Text style={styles.profileEmail}>{email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

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
          value={email}
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

        <Text style={styles.label}>Address</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          multiline
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleUpdateProfile}
          disabled={savingProfile}
        >
          {savingProfile ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
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
          style={styles.secondaryButton}
          onPress={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.secondaryButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
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
    padding: 15,
    paddingBottom: 40,
  },

  profileHeader: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginBottom: 15,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },

  profileName: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
  },

  profileEmail: {
    color: "#bbb",
    marginTop: 5,
  },

  roleBadge: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  roleText: {
    color: "#111",
    fontSize: 11,
    fontWeight: "800",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111",
    marginBottom: 13,
    backgroundColor: "#fff",
  },

  disabledInput: {
    backgroundColor: "#f1f1f1",
    color: "#777",
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  primaryButton: {
    backgroundColor: "#111",
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 5,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "#eee",
    paddingVertical: 13,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 5,
  },

  secondaryButtonText: {
    color: "#111",
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  logoutText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },
});

export default AdminProfileScreen;
