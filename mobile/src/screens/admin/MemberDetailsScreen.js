import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const MemberDetailsScreen = ({ route }) => {
  const { memberId } = route.params || {};

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMember = async (showLoader = true) => {
    try {
      if (!memberId) {
        setError("Member ID is missing.");
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      setError("");

      console.log(
        "Loading member details:",
        memberId
      );

      const response = await api.get(
        `/members/${memberId}`
      );

      console.log(
        "MEMBER DETAILS RESPONSE:",
        response.data
      );

      const data =
        response.data.member ||
        response.data.data;

      if (!data) {
        setMember(null);
        setError("Member not found.");
        return;
      }

      setMember(data);
    } catch (error) {
      console.log(
        "MEMBER DETAILS ERROR:",
        error.response?.data || error.message
      );

      setMember(null);

      setError(
        error.response?.data?.message ||
          "Member not found."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMember();
    }, [memberId])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadMember(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading member details...
        </Text>
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Member Not Found
        </Text>

        <Text style={styles.errorText}>
          {error || "Unable to load member details."}
        </Text>

        <Text style={styles.idText}>
          Member ID: {memberId || "Missing"}
        </Text>
      </View>
    );
  }

  const memberName =
    member.user?.name ||
    member.name ||
    "Unknown Member";

  const memberEmail =
    member.user?.email ||
    member.email ||
    "No email";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {memberName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {memberName}
        </Text>

        <Text style={styles.email}>
          {memberEmail}
        </Text>

        <View
          style={[
            styles.statusBadge,
            member.status === "active"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              member.status === "active"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {member.status || "inactive"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <InfoRow
          label="Phone"
          value={member.phone || "N/A"}
        />

        <InfoRow
          label="Address"
          value={member.address || "N/A"}
        />

        <InfoRow
          label="Gender"
          value={member.gender || "N/A"}
        />

        <InfoRow
          label="Date of Birth"
          value={
            member.dateOfBirth
              ? new Date(
                  member.dateOfBirth
                ).toLocaleDateString()
              : "N/A"
          }
        />

        <InfoRow
          label="Join Date"
          value={
            member.joinDate
              ? new Date(
                  member.joinDate
                ).toLocaleDateString()
              : "N/A"
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
            member.emergencyContact?.name ||
            "N/A"
          }
        />

        <InfoRow
          label="Phone"
          value={
            member.emergencyContact?.phone ||
            "N/A"
          }
        />

        <InfoRow
          label="Relationship"
          value={
            member.emergencyContact?.relationship ||
            "N/A"
          }
        />
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 30,
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  errorText: {
    marginTop: 10,
    color: "#dc2626",
    textAlign: "center",
  },

  idText: {
    marginTop: 10,
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    marginBottom: 15,
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
    fontWeight: "700",
  },

  name: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    marginTop: 5,
    color: "#777",
  },

  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontWeight: "700",
    textTransform: "capitalize",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#dc2626",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 11,
  },

  label: {
    color: "#777",
    fontSize: 14,
  },

  value: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
});

export default MemberDetailsScreen;