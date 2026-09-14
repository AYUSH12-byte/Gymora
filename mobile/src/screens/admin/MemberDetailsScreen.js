import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import api from "../../services/api";

const MemberDetailsScreen = ({ route }) => {
  const { memberId } = route.params;

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMember = async () => {
    try {
      const response = await api.get(`/members/${memberId}`);

      if (response.data.success) {
        setMember(response.data.data);
      }
    } catch (error) {
      console.log(
        "Member details error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load member details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading member...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.center}>
        <Text>Member not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {member.user?.name?.charAt(0)?.toUpperCase() || "M"}
          </Text>
        </View>

        <Text style={styles.name}>
          {member.user?.name || "Unknown Member"}
        </Text>

        <Text style={styles.email}>
          {member.user?.email || "No email"}
        </Text>

        <View
          style={[
            styles.status,
            member.status === "active"
              ? styles.active
              : styles.inactive,
          ]}
        >
          <Text style={styles.statusText}>
            {member.status}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <InfoRow
          label="Phone"
          value={member.phone || "Not provided"}
        />

        <InfoRow
          label="Gender"
          value={member.gender || "Not provided"}
        />

        <InfoRow
          label="Date of Birth"
          value={
            member.dateOfBirth
              ? new Date(member.dateOfBirth).toLocaleDateString()
              : "Not provided"
          }
        />

        <InfoRow
          label="Address"
          value={member.address || "Not provided"}
        />

        <InfoRow
          label="Join Date"
          value={
            member.joinDate
              ? new Date(member.joinDate).toLocaleDateString()
              : "Not available"
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Emergency Contact
        </Text>

        <InfoRow
          label="Name"
          value={
            member.emergencyContact?.name || "Not provided"
          }
        />

        <InfoRow
          label="Phone"
          value={
            member.emergencyContact?.phone || "Not provided"
          }
        />

        <InfoRow
          label="Relationship"
          value={
            member.emergencyContact?.relationship ||
            "Not provided"
          }
        />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default MemberDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  error: {
    color: "#d00",
    fontSize: 16,
    textAlign: "center",
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  name: {
    fontSize: 23,
    fontWeight: "bold",
  },

  email: {
    color: "#777",
    marginTop: 5,
  },

  status: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },

  active: {
    backgroundColor: "#dff5e3",
  },

  inactive: {
    backgroundColor: "#eee",
  },

  statusText: {
    textTransform: "capitalize",
    fontWeight: "600",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  label: {
    color: "#777",
  },

  value: {
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
});