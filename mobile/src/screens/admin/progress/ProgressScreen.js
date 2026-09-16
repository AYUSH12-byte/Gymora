import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const ProgressScreen = ({ navigation }) => {
  const [progress, setProgress] = useState([]);
  const [filteredProgress, setFilteredProgress] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProgress = async () => {
    try {
      setError("");

      const response = await api.get("/progress");

      const data = response.data.progress || response.data.data || [];

      const progressData = Array.isArray(data) ? data : [];

      setProgress(progressData);
      setFilteredProgress(progressData);
    } catch (error) {
      console.log("Progress API Error:", error.response?.data || error.message);

      setError(
        error.response?.data?.message || "Failed to load progress records",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const handleSearch = (text) => {
    setSearch(text);

    const keyword = text.toLowerCase().trim();

    if (!keyword) {
      setFilteredProgress(progress);
      return;
    }

    const filtered = progress.filter((item) => {
      const memberName = item.member?.user?.name || item.member?.name || "";

      const memberEmail = item.member?.user?.email || "";

      return (
        memberName.toLowerCase().includes(keyword) ||
        memberEmail.toLowerCase().includes(keyword)
      );
    });

    setFilteredProgress(filtered);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString();
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Progress",
      "Are you sure you want to delete this progress record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete(`/progress/${id}`);

              if (response.data.success) {
                Alert.alert("Success", "Progress record deleted successfully");

                loadProgress();
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete progress record",
              );
            }
          },
        },
      ],
    );
  };

  const renderProgress = ({ item }) => {
    const memberName =
      item.member?.user?.name || item.member?.name || "Unknown Member";

    const memberEmail = item.member?.user?.email || "No email";

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{memberName}</Text>

            <Text style={styles.email}>{memberEmail}</Text>
          </View>

          <Text style={styles.date}>{formatDate(item.recordedAt)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{item.weight ?? "-"} kg</Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statLabel}>Body Fat</Text>
            <Text style={styles.statValue}>{item.bodyFat ?? "-"}%</Text>
          </View>
        </View>

        <View style={styles.measurements}>
          <Text style={styles.measurement}>Chest: {item.chest ?? "-"} cm</Text>

          <Text style={styles.measurement}>Waist: {item.waist ?? "-"} cm</Text>

          <Text style={styles.measurement}>Arms: {item.arms ?? "-"} cm</Text>

          <Text style={styles.measurement}>
            Thighs: {item.thighs ?? "-"} cm
          </Text>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate("ProgressDetails", {
                progressId: item._id,
              })
            }
          >
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditProgress", {
                progressId: item._id,
              })
            }
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (error && progress.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadProgress}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Member Progress</Text>

          <Text style={styles.subtitle}>Track member fitness progress</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddProgress")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search member..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredProgress}
        keyExtractor={(item) => item._id}
        renderItem={renderProgress}
        contentContainerStyle={
          filteredProgress.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No Progress Found</Text>

            <Text style={styles.emptyText}>
              Add a progress record for a member.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
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

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    color: "#777",
  },

  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 15,
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  memberName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    marginTop: 3,
    color: "#777",
  },

  date: {
    color: "#555",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 14,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  stat: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },

  statLabel: {
    color: "#777",
    fontSize: 12,
  },

  statValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "700",
  },

  measurements: {
    marginTop: 12,
    gap: 5,
  },

  measurement: {
    color: "#555",
  },

  notesBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 8,
  },

  notesLabel: {
    fontWeight: "700",
    marginBottom: 3,
  },

  notes: {
    color: "#555",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 15,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: "#eee",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  detailsText: {
    color: "#111",
    fontWeight: "600",
  },

  editButton: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteText: {
    color: "#dc2626",
    fontWeight: "600",
  },

  error: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  emptyText: {
    marginTop: 5,
    color: "#777",
  },
});

export default ProgressScreen;
