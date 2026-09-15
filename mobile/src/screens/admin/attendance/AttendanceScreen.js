import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const AttendanceScreen = ({ navigation }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    try {
      setError("");

      const response = await api.get("/attendance/today");

      const data =
        response.data.attendance ||
        response.data.data ||
        [];

      setAttendance(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.log(
        "Attendance error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMemberName = (item) => {
    return (
      item.member?.user?.name ||
      item.member?.name ||
      "Unknown Member"
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getMemberName(item)
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {getMemberName(item)}
          </Text>

          <Text style={styles.method}>
            Method:{" "}
            {(item.method || "manual").toUpperCase()}
          </Text>
        </View>

        <View
          style={[
            styles.status,
            item.status === "completed"
              ? styles.completed
              : styles.present,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "completed"
              ? "Completed"
              : "Present"}
          </Text>
        </View>
      </View>

      <View style={styles.times}>
        <View>
          <Text style={styles.timeLabel}>
            Check In
          </Text>

          <Text style={styles.timeValue}>
            {formatTime(item.checkIn)}
          </Text>
        </View>

        <View>
          <Text style={styles.timeLabel}>
            Check Out
          </Text>

          <Text style={styles.timeValue}>
            {formatTime(item.checkOut)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>
          Loading attendance...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Today's Attendance
          </Text>

          <Text style={styles.subtitle}>
            {attendance.length} attendance record
            {attendance.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() =>
            navigation.navigate("QRScanner")
          }
        >
          <Text style={styles.scanButtonText}>
            Scan QR
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={loadAttendance}
          >
            <Text style={styles.retry}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={
            attendance.length === 0
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
                No Attendance
              </Text>

              <Text style={styles.emptyText}>
                No attendance records found for today.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    padding: 20,
    paddingTop: 25,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    color: "#777",
    marginTop: 4,
  },

  scanButton: {
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 9,
  },

  scanButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  list: {
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },

  method: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  present: {
    backgroundColor: "#dcfce7",
  },

  completed: {
    backgroundColor: "#e0e7ff",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },

  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 15,
    paddingTop: 12,
  },

  timeLabel: {
    fontSize: 11,
    color: "#888",
  },

  timeValue: {
    marginTop: 4,
    fontWeight: "700",
    color: "#111",
  },

  errorBox: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fee2e2",
    borderRadius: 10,
  },

  errorText: {
    color: "#991b1b",
  },

  retry: {
    color: "#111",
    fontWeight: "700",
    marginTop: 10,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111",
  },

  emptyText: {
    marginTop: 7,
    color: "#777",
    textAlign: "center",
  },
});

export default AttendanceScreen;