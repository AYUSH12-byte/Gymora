import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/notifications");

      const data =
        response.data.notifications || response.data.data || [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Notifications error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load notifications",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(
        `/notifications/${notificationId}/read`,
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to mark notification as read",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put(
        "/notifications/read-all",
      );

      if (response.data.success) {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        );

        Alert.alert(
          "Success",
          "All notifications marked as read",
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to mark notifications as read",
      );
    }
  };

  const handleDelete = (notificationId) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
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
              await api.delete(
                `/notifications/${notificationId}`,
              );

              setNotifications((current) =>
                current.filter(
                  (notification) =>
                    notification._id !== notificationId,
                ),
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete notification",
              );
            }
          },
        },
      ],
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleString();
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "new_member":
        return "New Member";

      case "membership_expiring":
        return "Membership Expiring";

      case "membership_expired":
        return "Membership Expired";

      case "payment_pending":
        return "Payment Pending";

      case "payment_received":
        return "Payment Received";

      case "membership_renewed":
        return "Membership Renewed";

      case "attendance":
        return "Attendance";

      case "general":
        return "General";

      default:
        return type || "Notification";
    }
  };

  const renderNotification = ({ item }) => {
    return (
      <View
        style={[
          styles.card,
          !item.isRead && styles.unreadCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {item.title || "Notification"}
            </Text>

            {!item.isRead && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  NEW
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.deleteText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.type}>
          {getTypeLabel(item.type)}
        </Text>

        <Text style={styles.message}>
          {item.message || "No message available"}
        </Text>

        <Text style={styles.date}>
          {formatDate(item.createdAt)}
        </Text>

        {!item.isRead && (
          <TouchableOpacity
            style={styles.readButton}
            onPress={() => markAsRead(item._id)}
          >
            <Text style={styles.readButtonText}>
              Mark as Read
            </Text>
          </TouchableOpacity>
        )}

        {item.isRead && (
          <Text style={styles.readText}>
            ✓ Read
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadNotifications()}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            Notifications
          </Text>

          <Text style={styles.subHeading}>
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>
              Mark All Read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={
          notifications.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              🔔
            </Text>

            <Text style={styles.emptyTitle}>
              No Notifications
            </Text>

            <Text style={styles.emptyText}>
              You don't have any notifications yet.
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
  },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  subHeading: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },

  markAllButton: {
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },

  markAllText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  listContainer: {
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#111",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },

  unreadBadge: {
    backgroundColor: "#111",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 8,
  },

  unreadBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },

  deleteText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },

  type: {
    marginTop: 8,
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },

  message: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    lineHeight: 21,
  },

  date: {
    marginTop: 10,
    fontSize: 11,
    color: "#888",
  },

  readButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
  },

  readButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  readText: {
    marginTop: 12,
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "600",
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

  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    padding: 30,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
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

export default NotificationsScreen;