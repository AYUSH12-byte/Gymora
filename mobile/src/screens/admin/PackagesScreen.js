import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const PackagesScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPackages = async () => {
    try {
      setError("");

      const response = await api.get("/packages");

      console.log("PACKAGES RESPONSE:", response.data);

      const data =
        response.data.packages ||
        response.data.data ||
        [];

      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Packages error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load packages"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPackages();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPackages();
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Delete Package",
      `Are you sure you want to delete "${item.name}"?`,
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
              await api.delete(`/packages/${item._id}`);

              Alert.alert(
                "Success",
                "Package deleted successfully"
              );

              loadPackages();
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete package"
              );
            }
          },
        },
      ]
    );
  };

  const renderPackage = ({ item }) => {
    const discountedPrice =
      Number(item.price || 0) -
      (Number(item.price || 0) *
        Number(item.discount || 0)) /
        100;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text style={styles.description}>
              {item.description || "No description"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.isActive
                  ? "#dcfce7"
                  : "#fee2e2",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.isActive
                    ? "#166534"
                    : "#991b1b",
                },
              ]}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>
              Duration
            </Text>

            <Text style={styles.value}>
              {item.duration} {item.durationUnit}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>
              Price
            </Text>

            <Text style={styles.price}>
              Rs.{" "}
              {Number(
                item.price || 0
              ).toLocaleString()}
            </Text>
          </View>
        </View>

        {Number(item.discount || 0) > 0 && (
          <View style={styles.discountBox}>
            <View>
              <Text style={styles.discountText}>
                {item.discount}% OFF
              </Text>

              <Text style={styles.discountLabel}>
                Discount
              </Text>
            </View>

            <View>
              <Text style={styles.discountLabel}>
                Final Price
              </Text>

              <Text style={styles.finalPrice}>
                Rs.{" "}
                {Number(
                  discountedPrice
                ).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditPackage", {
                packageData: item,
              })
            }
          >
            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>
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
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading packages...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadPackages}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Membership Packages
          </Text>

          <Text style={styles.subtitle}>
            {packages.length} package
            {packages.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddPackage")
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item) => item._id}
        renderItem={renderPackage}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          packages.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              No Packages Found
            </Text>

            <Text style={styles.empty}>
              Create your first membership package.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                navigation.navigate("AddPackage")
              }
            >
              <Text style={styles.emptyButtonText}>
                + Add Package
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default PackagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  list: {
    padding: 16,
    paddingBottom: 30,
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
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },

  description: {
    color: "#777",
    marginTop: 6,
    lineHeight: 19,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  infoItem: {
    flex: 1,
  },

  label: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },

  price: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111",
  },

  discountBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  discountText: {
    color: "#15803d",
    fontWeight: "bold",
    fontSize: 14,
  },

  discountLabel: {
    color: "#888",
    fontSize: 11,
    marginBottom: 3,
  },

  finalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  editButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  editButtonText: {
    color: "#111",
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  emptyBox: {
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },

  empty: {
    color: "#888",
    textAlign: "center",
    marginBottom: 18,
  },

  emptyButton: {
    backgroundColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});