import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../../services/api";

const TrainerAttendanceScreen = () => {
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      setError("");

      const response = await api.get("/trainers/my-attendance");

      const data = response.data.attendance || response.data.data || [];

      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Trainer attendance error:",
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, []);

  const isToday = (date) => {
    if (!date) return false;

    const attendanceDate = new Date(date);
    const today = new Date();

    return (
      attendanceDate.getFullYear() === today.getFullYear() &&
      attendanceDate.getMonth() === today.getMonth() &&
      attendanceDate.getDate() === today.getDate()
    );
  };

  const filteredAttendance = useMemo(() => {
    let result = attendance;

    if (activeTab === "today") {
      result = result.filter((item) => isToday(item.date));
    }

    const keyword = search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((item) => {
        const name = item.member?.user?.name?.toLowerCase() || "";

        const email = item.member?.user?.email?.toLowerCase() || "";

        const method = item.method?.toLowerCase() || "";

        return (
          name.includes(keyword) ||
          email.includes(keyword) ||
          method.includes(keyword)
        );
      });
    }

    return result;
  }, [attendance, activeTab, search]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) {
      return "In progress";
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const minutes = Math.max(0, Math.floor((end - start) / 60000));

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes}m`;
  };

  const renderAttendance = ({ item }) => {
    const memberName = item.member?.user?.name || "Unknown Member";

    const memberEmail = item.member?.user?.email || "";

    const isCompleted = item.status === "completed";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{memberName}</Text>

            {memberEmail ? (
              <Text style={styles.email}>{memberEmail}</Text>
            ) : null}
          </View>

          <View
            style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadge : styles.presentBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCompleted ? styles.completedText : styles.presentText,
              ]}
            >
              {isCompleted ? "Completed" : "Present"}
            </Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>

          <View
            style={[
              styles.methodBadge,
              item.method === "qr" ? styles.qrBadge : styles.manualBadge,
            ]}
          >
            <Text style={styles.methodText}>
              {item.method === "qr" ? "QR" : "Manual"}
            </Text>
          </View>
        </View>

        <View style={styles.attendanceRow}>
          <View style={styles.timeBox}>
            <Text style={styles.label}>Check In</Text>

            <Text style={styles.value}>{formatTime(item.checkIn)}</Text>
          </View>

          <View style={styles.timeBox}>
            <Text style={styles.label}>Check Out</Text>

            <Text style={styles.value}>{formatTime(item.checkOut)}</Text>
          </View>

          <View style={styles.timeBox}>
            <Text style={styles.label}>Duration</Text>

            <Text style={styles.value}>
              {getDuration(item.checkIn, item.checkOut)}
            </Text>
          </View>
        </View>

        {item.notes ? (
          <Text style={styles.notes}>Note: {item.notes}</Text>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
    );
  }

  if (error && attendance.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={fetchAttendance}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Attendance</Text>

        <Text style={styles.subHeading}>
          Track attendance of your assigned members
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "today" && styles.activeTab]}
          onPress={() => setActiveTab("today")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "today" && styles.activeTabText,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search member..."
        value={search}
        onChangeText={setSearch}
      />

      {error ? <Text style={styles.smallError}>{error}</Text> : null}

      <FlatList
        data={filteredAttendance}
        keyExtractor={(item) => item._id}
        renderItem={renderAttendance}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          filteredAttendance.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {filteredAttendance.length}
              </Text>

              <Text style={styles.summaryLabel}>Records</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {
                  filteredAttendance.filter(
                    (item) =>
                      item.status === "present" || item.status === "completed",
                  ).length
                }
              </Text>

              <Text style={styles.summaryLabel}>Present</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {
                  filteredAttendance.filter(
                    (item) => item.status === "completed",
                  ).length
                }
              </Text>

              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No attendance found</Text>

            <Text style={styles.emptyText}>
              {activeTab === "today"
                ? "No attendance records for today."
                : "No attendance history available."}
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
    backgroundColor: "#f5f7fb",
    padding: 16,
  },

  header: {
    marginBottom: 14,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  subHeading: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },

  activeTab: {
    backgroundColor: "#ffffff",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  activeTabText: {
    color: "#111827",
  },

  searchInput: {
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },

  listContainer: {
    paddingBottom: 20,
  },

  emptyContainer: {
    flexGrow: 1,
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  summaryItem: {
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    color: "#6b7280",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  memberInfo: {
    flex: 1,
    marginRight: 10,
  },

  memberName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  email: {
    marginTop: 3,
    fontSize: 12,
    color: "#6b7280",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  completedBadge: {
    backgroundColor: "#dcfce7",
  },

  presentBadge: {
    backgroundColor: "#dbeafe",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  completedText: {
    color: "#166534",
  },

  presentText: {
    color: "#1d4ed8",
  },

  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  dateText: {
    fontSize: 12,
    color: "#6b7280",
  },

  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  qrBadge: {
    backgroundColor: "#ede9fe",
  },

  manualBadge: {
    backgroundColor: "#f3f4f6",
  },

  methodText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4b5563",
  },

  attendanceRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },

  timeBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 9,
  },

  label: {
    fontSize: 10,
    color: "#6b7280",
  },

  value: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  notes: {
    marginTop: 10,
    fontSize: 12,
    color: "#4b5563",
    fontStyle: "italic",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },

  errorText: {
    textAlign: "center",
    color: "#dc2626",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  smallError: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 8,
  },

  emptyBox: {
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
});

export default TrainerAttendanceScreen;
