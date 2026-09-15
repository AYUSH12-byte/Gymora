import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const TrainerDetailsScreen = ({
  route,
  navigation,
}) => {
  const { trainerId } = route.params;

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTrainer = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/trainers/${trainerId}`
      );

      console.log(
        "TRAINER DETAILS RESPONSE:",
        response.data
      );

      const data =
        response.data.trainer ||
        response.data.data;

      setTrainer(data || null);
    } catch (error) {
      console.log(
        "Trainer details error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load trainer details"
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrainer();
    }, [trainerId])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />
      </View>
    );
  }

  if (!trainer) {
    return (
      <View style={styles.center}>
        <Text>
          Trainer not found.
        </Text>
      </View>
    );
  }

  const name =
    trainer.user?.name ||
    trainer.name ||
    "Unknown Trainer";

  const email =
    trainer.user?.email ||
    trainer.email ||
    "No email";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {name}
        </Text>

        <Text style={styles.email}>
          {email}
        </Text>

        <View
          style={[
            styles.statusBadge,
            trainer.status === "active"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              trainer.status === "active"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {(trainer.status || "inactive").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Trainer Information
        </Text>

        <InfoRow
          label="Phone"
          value={trainer.phone || "N/A"}
        />

        <InfoRow
          label="Specialization"
          value={
            trainer.specialization || "N/A"
          }
        />

        <InfoRow
          label="Experience"
          value={
            trainer.experience != null
              ? `${trainer.experience} years`
              : "N/A"
          }
        />

        <InfoRow
          label="Salary"
          value={
            trainer.salary != null
              ? `Rs. ${trainer.salary}`
              : "N/A"
          }
        />

        <InfoRow
          label="Joining Date"
          value={
            trainer.joiningDate
              ? new Date(
                  trainer.joiningDate
                ).toLocaleDateString()
              : "N/A"
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Bio
        </Text>

        <Text style={styles.bio}>
          {trainer.bio ||
            "No biography available."}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate(
            "EditTrainer",
            {
              trainerId: trainer._id,
            }
          )
        }
      >
        <Text style={styles.editText}>
          Edit Trainer
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>
      {label}
    </Text>

    <Text style={styles.value}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },

  name: {
    fontSize: 23,
    fontWeight: "700",
    marginTop: 12,
    color: "#111",
  },

  email: {
    color: "#777",
    marginTop: 4,
  },

  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },

  activeBadge: {
    backgroundColor: "#dcfce7",
  },

  inactiveBadge: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#dc2626",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  label: {
    color: "#777",
  },

  value: {
    color: "#111",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  bio: {
    color: "#555",
    lineHeight: 21,
  },

  editButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 15,
  },

  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default TrainerDetailsScreen;