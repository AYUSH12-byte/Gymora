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

const ProgressDetailsScreen = ({ route, navigation }) => {
  const { progressId } = route.params;

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    try {
      const response = await api.get(`/progress/${progressId}`);

      const data = response.data.progress || response.data.data;

      setProgress(data);
    } catch (error) {
      console.log(
        "Progress Details Error:",
        error.response?.data || error.message,
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load progress details",
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [progressId]),
  );

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (!progress) {
    return (
      <View style={styles.center}>
        <Text>Progress record not found.</Text>
      </View>
    );
  }

  const memberName =
    progress.member?.user?.name || progress.member?.name || "Unknown Member";

  const memberEmail = progress.member?.user?.email || "No email";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <Text style={styles.memberName}>{memberName}</Text>

        <Text style={styles.email}>{memberEmail}</Text>

        <Text style={styles.date}>
          Recorded: {formatDate(progress.recordedAt)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Body Measurements</Text>

      <View style={styles.grid}>
        <View style={styles.measurementCard}>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{progress.weight ?? "-"} kg</Text>
        </View>

        <View style={styles.measurementCard}>
          <Text style={styles.label}>Body Fat</Text>
          <Text style={styles.value}>{progress.bodyFat ?? "-"}%</Text>
        </View>

        <View style={styles.measurementCard}>
          <Text style={styles.label}>Chest</Text>
          <Text style={styles.value}>{progress.chest ?? "-"} cm</Text>
        </View>

        <View style={styles.measurementCard}>
          <Text style={styles.label}>Waist</Text>
          <Text style={styles.value}>{progress.waist ?? "-"} cm</Text>
        </View>

        <View style={styles.measurementCard}>
          <Text style={styles.label}>Arms</Text>
          <Text style={styles.value}>{progress.arms ?? "-"} cm</Text>
        </View>

        <View style={styles.measurementCard}>
          <Text style={styles.label}>Thighs</Text>
          <Text style={styles.value}>{progress.thighs ?? "-"} cm</Text>
        </View>
      </View>

      {progress.notes ? (
        <>
          <Text style={styles.sectionTitle}>Notes</Text>

          <View style={styles.notesCard}>
            <Text style={styles.notes}>{progress.notes}</Text>
          </View>
        </>
      ) : null}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("EditProgress", {
            progressId,
          })
        }
      >
        <Text style={styles.editText}>Edit Progress</Text>
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
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#777",
  },

  profileCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
  },

  memberName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    marginTop: 4,
    color: "#777",
  },

  date: {
    marginTop: 12,
    color: "#555",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  measurementCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },

  label: {
    color: "#777",
    fontSize: 13,
  },

  value: {
    marginTop: 6,
    fontSize: 19,
    fontWeight: "700",
  },

  notesCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },

  notes: {
    color: "#444",
    lineHeight: 21,
  },

  editButton: {
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },

  editText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ProgressDetailsScreen;
