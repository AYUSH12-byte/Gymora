import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import api from "../../../services/api";

const MemberProgressScreen = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProgress = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/member-portal/progress");

      const data = response.data?.progress || response.data?.data || [];

      setProgress(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Member progress error:", err.response?.data || err.message);

      setError(err.response?.data?.message || "Failed to load your progress.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const latestProgress = useMemo(() => {
    if (!progress.length) return null;

    return [...progress].sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0),
    )[0];
  }, [progress]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString();
  };

  const getValue = (item, keys) => {
    for (const key of keys) {
      if (
        item?.[key] !== undefined &&
        item?.[key] !== null &&
        item?.[key] !== ""
      ) {
        return item[key];
      }
    }

    return null;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>

        <Text style={styles.subtitle}>
          Track your fitness progress over time
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Latest Progress */}

      {latestProgress ? (
        <View style={styles.latestCard}>
          <Text style={styles.sectionTitle}>Latest Progress</Text>

          <Text style={styles.latestDate}>
            {formatDate(latestProgress.date || latestProgress.createdAt)}
          </Text>

          <View style={styles.measurementGrid}>
            <View style={styles.measurementCard}>
              <Text style={styles.measurementLabel}>Weight</Text>

              <Text style={styles.measurementValue}>
                {formatNumber(getValue(latestProgress, ["weight", "weightKg"]))}{" "}
                kg
              </Text>
            </View>

            <View style={styles.measurementCard}>
              <Text style={styles.measurementLabel}>Body Fat</Text>

              <Text style={styles.measurementValue}>
                {formatNumber(
                  getValue(latestProgress, ["bodyFat", "bodyFatPercentage"]),
                )}
                %
              </Text>
            </View>

            <View style={styles.measurementCard}>
              <Text style={styles.measurementLabel}>Chest</Text>

              <Text style={styles.measurementValue}>
                {formatNumber(getValue(latestProgress, ["chest", "chestCm"]))}{" "}
                cm
              </Text>
            </View>

            <View style={styles.measurementCard}>
              <Text style={styles.measurementLabel}>Waist</Text>

              <Text style={styles.measurementValue}>
                {formatNumber(getValue(latestProgress, ["waist", "waistCm"]))}{" "}
                cm
              </Text>
            </View>
          </View>

          {latestProgress.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes</Text>

              <Text style={styles.notesText}>{latestProgress.notes}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Progress Records</Text>

          <Text style={styles.emptyText}>
            Your trainer or gym administrator has not added any progress records
            yet.
          </Text>
        </View>
      )}

      {/* Progress History */}

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Progress History</Text>

        {progress.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Progress history will appear here.
            </Text>
          </View>
        ) : (
          [...progress]
            .sort(
              (a, b) =>
                new Date(b.date || b.createdAt || 0) -
                new Date(a.date || a.createdAt || 0),
            )
            .map((item, index) => {
              const weight = getValue(item, ["weight", "weightKg"]);

              const bodyFat = getValue(item, ["bodyFat", "bodyFatPercentage"]);

              const chest = getValue(item, ["chest", "chestCm"]);

              const waist = getValue(item, ["waist", "waistCm"]);

              const hips = getValue(item, ["hips", "hipsCm"]);

              const muscle = getValue(item, ["muscleMass", "muscleMassKg"]);

              return (
                <View
                  key={item._id || item.id || `progress-${index}`}
                  style={styles.historyCard}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {formatDate(item.date || item.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.historyGrid}>
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Weight</Text>

                      <Text style={styles.historyValue}>
                        {weight !== null ? `${formatNumber(weight)} kg` : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Body Fat</Text>

                      <Text style={styles.historyValue}>
                        {bodyFat !== null ? `${formatNumber(bodyFat)}%` : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Chest</Text>

                      <Text style={styles.historyValue}>
                        {chest !== null ? `${formatNumber(chest)} cm` : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Waist</Text>

                      <Text style={styles.historyValue}>
                        {waist !== null ? `${formatNumber(waist)} cm` : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Hips</Text>

                      <Text style={styles.historyValue}>
                        {hips !== null ? `${formatNumber(hips)} cm` : "N/A"}
                      </Text>
                    </View>

                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>Muscle Mass</Text>

                      <Text style={styles.historyValue}>
                        {muscle !== null ? `${formatNumber(muscle)} kg` : "N/A"}
                      </Text>
                    </View>
                  </View>

                  {item.notes ? (
                    <View style={styles.historyNotes}>
                      <Text style={styles.notesLabel}>Notes</Text>

                      <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 30,
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
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6b7280",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  latestCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },

  latestDate: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 15,
  },

  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  measurementCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  measurementLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 5,
  },

  measurementValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  notesBox: {
    marginTop: 5,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
  },

  notesLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },

  notesText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  historySection: {
    marginTop: 2,
  },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  historyHeader: {
    marginBottom: 14,
  },

  historyDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  historyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  historyItem: {
    width: "50%",
    marginBottom: 14,
  },

  historyLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 3,
  },

  historyValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  historyNotes: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 2,
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
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
  },
});

export default MemberProgressScreen;
