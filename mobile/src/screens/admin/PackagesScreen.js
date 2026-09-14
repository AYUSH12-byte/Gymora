import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const PackagesScreen = () => {
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

  const renderPackage = ({ item }) => {
    const discountedPrice =
      item.price -
      (item.price * (item.discount || 0)) / 100;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>
            {item.name}
          </Text>

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
              style={{
                color: item.isActive
                  ? "#166534"
                  : "#991b1b",
                fontWeight: "600",
              }}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          {item.description || "No description"}
        </Text>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>
              Duration
            </Text>
            <Text style={styles.value}>
              {item.duration} {item.durationUnit}
            </Text>
          </View>

          <View>
            <Text style={styles.label}>
              Price
            </Text>
            <Text style={styles.price}>
              Rs. {Number(item.price || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {item.discount > 0 && (
          <View style={styles.discountBox}>
            <Text style={styles.discountText}>
              {item.discount}% OFF
            </Text>

            <Text style={styles.finalPrice}>
              Rs.{" "}
              {Number(
                discountedPrice
              ).toLocaleString()}
            </Text>
          </View>
        )}
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={packages}
        keyExtractor={(item) => item._id}
        renderItem={renderPackage}
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
          <Text style={styles.empty}>
            No membership packages found
          </Text>
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

  list: {
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

  error: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
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
    alignItems: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  description: {
    color: "#777",
    marginTop: 8,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
  },

  price: {
    fontSize: 17,
    fontWeight: "bold",
  },

  discountBox: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  discountText: {
    color: "#15803d",
    fontWeight: "bold",
  },

  finalPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    color: "#888",
    fontSize: 16,
  },
});