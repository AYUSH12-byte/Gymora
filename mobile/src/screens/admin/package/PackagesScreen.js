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

import api from "../../../services/api";

const PackagesScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // LOAD PACKAGES
  const loadPackages = async () => {
    try {
      setError("");

      const response = await api.get("/packages");

      console.log("PACKAGES RESPONSE:", response.data);

      const responseData = response.data;

      const data =
        responseData?.packages ||
        responseData?.data?.packages ||
        responseData?.data ||
        [];

      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Packages error:", error.response?.data || error.message);

      setError(error.response?.data?.message || "Failed to load packages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // LOAD WHEN SCREEN FOCUSES
  useFocusEffect(
    useCallback(() => {
      loadPackages();
    }, []),
  );

  // REFRESH
  const handleRefresh = () => {
    setRefreshing(true);
    loadPackages();
  };

  // DELETE PACKAGE
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
              setDeletingId(item._id);

              const response = await api.delete(`/packages/${item._id}`);

              console.log("DELETE PACKAGE RESPONSE:", response.data);

              if (response.data?.success === false) {
                throw new Error(
                  response.data?.message || "Failed to delete package",
                );
              }

              Alert.alert("Success", "Package deleted successfully.");

              await loadPackages();
            } catch (error) {
              console.log(
                "Delete package error:",
                error.response?.data || error.message,
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  error.message ||
                  "Failed to delete package",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  // RENDER PACKAGE
  const renderPackage = ({ item }) => {
    const price = Number(item.price || 0);
    const discount = Number(item.discount || 0);

    const discountedPrice = price - (price * discount) / 100;

    const isActive = item.isActive !== false;

    return (
      <View style={styles.card}>
        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{item.name || "Unnamed Package"}</Text>

            <Text style={styles.description}>
              {item.description || "No description available"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isActive ? "#dcfce7" : "#fee2e2",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isActive ? "#166534" : "#991b1b",
                },
              ]}
            >
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* PACKAGE INFORMATION */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Duration</Text>

            <Text style={styles.value}>
              {item.duration || 0} {item.durationUnit || "months"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Original Price</Text>

            <Text style={styles.price}>Rs. {price.toLocaleString()}</Text>
          </View>
        </View>

        {/* DISCOUNT */}
        {discount > 0 ? (
          <View style={styles.discountBox}>
            <View>
              <Text style={styles.discountText}>{discount}% OFF</Text>

              <Text style={styles.discountLabel}>Discount</Text>
            </View>

            <View style={styles.finalPriceContainer}>
              <Text style={styles.discountLabel}>Final Price</Text>

              <Text style={styles.finalPrice}>
                Rs. {discountedPrice.toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noDiscountBox}>
            <Text style={styles.noDiscountText}>No discount</Text>
          </View>
        )}

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("EditPackage", {
                packageData: item,
                packageId: item._id,
              })
            }
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              deletingId === item._id && styles.deleteButtonDisabled,
            ]}
            activeOpacity={0.8}
            disabled={deletingId === item._id}
            onPress={() => handleDelete(item)}
          >
            {deletingId === item._id ? (
              <ActivityIndicator size="small" color="#b91c1c" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>Loading packages...</Text>
      </View>
    );
  }

  // ERROR
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Something went wrong</Text>

        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={loadPackages}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // MAIN SCREEN
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Membership Packages</Text>

          <Text style={styles.subtitle}>
            {packages.length} package
            {packages.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddPackage")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* PACKAGE LIST */}
      <FlatList
        data={packages}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={renderPackage}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={
          packages.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>

            <Text style={styles.emptyTitle}>No Packages Found</Text>

            <Text style={styles.empty}>
              Create your first membership package to get started.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("AddPackage")}
            >
              <Text style={styles.emptyButtonText}>+ Add Package</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default PackagesScreen;

// STYLES

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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerTitleContainer: {
    flex: 1,
    paddingRight: 10,
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
    backgroundColor: "#f5f6f8",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  error: {
    color: "#dc2626",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 21,
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

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    fontSize: 13,
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

  finalPriceContainer: {
    alignItems: "flex-end",
  },

  finalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },

  noDiscountBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  noDiscountText: {
    color: "#888",
    fontSize: 12,
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
    justifyContent: "center",
  },

  editButtonText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 14,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#fee2e2",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },

  deleteButtonDisabled: {
    opacity: 0.6,
  },

  deleteButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 14,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  emptyBox: {
    alignItems: "center",
    maxWidth: 300,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
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
    lineHeight: 20,
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
