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

const TrainersScreen = ({ navigation }) => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTrainers = async () => {
    try {
      setError("");

      const response = await api.get("/trainers");

      console.log("TRAINERS API RESPONSE:", response.data);

      const data =
        response.data.trainers ||
        response.data.data ||
        [];

      const trainerList = Array.isArray(data) ? data : [];

      setTrainers(trainerList);
      setFilteredTrainers(trainerList);
    } catch (error) {
      console.log(
        "Load trainers error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load trainers"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrainers();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrainers();
  };

  const handleSearch = (text) => {
    setSearch(text);

    const query = text.toLowerCase().trim();

    if (!query) {
      setFilteredTrainers(trainers);
      return;
    }

    const filtered = trainers.filter((item) => {
      const name =
        item.user?.name ||
        item.name ||
        "";

      const email =
        item.user?.email ||
        item.email ||
        "";

      const phone = item.phone || "";
      const specialization = item.specialization || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        specialization.toLowerCase().includes(query)
      );
    });

    setFilteredTrainers(filtered);
  };

  const handleDelete = (trainerId) => {
    Alert.alert(
      "Delete Trainer",
      "Are you sure you want to delete this trainer?",
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
              const response = await api.delete(
                `/trainers/${trainerId}`
              );

              if (response.data.success) {
                Alert.alert(
                  "Success",
                  "Trainer deleted successfully"
                );

                loadTrainers();
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete trainer"
              );
            }
          },
        },
      ]
    );
  };

  const renderTrainer = ({ item }) => {
    const name =
      item.user?.name ||
      item.name ||
      "Unknown Trainer";

    const email =
      item.user?.email ||
      item.email ||
      "No email";

    const status = item.status || "inactive";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>

            <Text style={styles.email}>
              {email}
            </Text>

            <View
              style={[
                styles.statusBadge,
                status === "active"
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  status === "active"
                    ? styles.activeText
                    : styles.inactiveText,
                ]}
              >
                {status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Phone
            </Text>

            <Text style={styles.value}>
              {item.phone || "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Specialization
            </Text>

            <Text style={styles.value}>
              {item.specialization || "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Experience
            </Text>

            <Text style={styles.value}>
              {item.experience != null
                ? `${item.experience} years`
                : "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              Salary
            </Text>

            <Text style={styles.value}>
              {item.salary != null
                ? `Rs. ${item.salary}`
                : "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate(
                "TrainerDetails",
                {
                  trainerId: item._id,
                }
              )
            }
          >
            <Text style={styles.detailsText}>
              Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(
                "EditTrainer",
                {
                  trainerId: item._id,
                }
              )
            }
          >
            <Text style={styles.editText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDelete(item._id)
            }
          >
            <Text style={styles.deleteText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading trainers...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Trainers
          </Text>

          <Text style={styles.subtitle}>
            {trainers.length} trainer
            {trainers.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddTrainer")
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search name, email, phone..."
        value={search}
        onChangeText={handleSearch}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadTrainers}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredTrainers}
        keyExtractor={(item) => item._id}
        renderItem={renderTrainer}
        contentContainerStyle={
          filteredTrainers.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No Trainers Found
            </Text>

            <Text style={styles.emptyText}>
              Add your first trainer to get started.
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
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 3,
    color: "#777",
  },

  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 15,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  headerInfo: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    marginTop: 3,
    color: "#666",
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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

  infoSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    color: "#777",
    fontSize: 13,
  },

  value: {
    color: "#111",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  detailsButton: {
    flex: 1,
    backgroundColor: "#f1f1f1",
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

  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
  },

  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
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
    padding: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  emptyText: {
    marginTop: 6,
    color: "#777",
    textAlign: "center",
  },
});

export default TrainersScreen;