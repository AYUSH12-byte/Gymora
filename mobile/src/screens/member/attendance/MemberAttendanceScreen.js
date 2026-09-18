import React, { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../../../services/api";

const MemberAttendanceScreen = () => {
  const [attendance, setAttendance] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAttendance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/member-portal/attendance");

      const data =
        response.data?.attendance ||
        response.data?.history ||
        response.data?.data ||
        [];

      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Member attendance error:",
        err?.response?.data || err.message,
      );

      setError(err?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, []),
  );

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
    let data = attendance;

    if (activeTab === "today") {
      data = data.filter((item) => isToday(item?.date || item?.checkIn));
    }

    const value = search.trim().toLowerCase();

    if (!value) {
      return data;
    }

    return data.filter((item) => {
      const method = item?.method?.toLowerCase() || "";

      const status = item?.status?.toLowerCase() || "";

      const notes = item?.notes?.toLowerCase() || "";

      return (
        method.includes(value) ||
        status.includes(value) ||
        notes.includes(value)
      );
    });
  }, [attendance, activeTab, search]);

  const todayAttendance = useMemo(() => {
    return attendance.filter((item) => isToday(item?.date || item?.checkIn));
  }, [attendance]);

  const completedCount = attendance.filter(
    (item) => item?.status === "completed" || item?.checkOut,
  ).length;

  const presentCount = attendance.filter(
    (item) => item?.status === "present",
  ).length;

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatTime = (date) => {
    if (!date) {
      return "--";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "--";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (item) => {
    if (!item?.checkIn) {
      return "--";
    }

    if (!item?.checkOut) {
      return "In gym";
    }

    const checkIn = new Date(item.checkIn);
    const checkOut = new Date(item.checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return "--";
    }

    const difference = checkOut.getTime() - checkIn.getTime();

    if (difference < 0) {
      return "--";
    }

    const totalMinutes = Math.floor(difference / (1000 * 60));

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  const renderAttendance = ({ item }) => {
    const completed = item?.status === "completed" || Boolean(item?.checkOut);

    return (
      <View style={styles.attendanceCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.date}>
              {formatDate(item?.date || item?.checkIn)}
            </Text>

            <Text style={styles.method}>
              Method: {item?.method ? item.method.toUpperCase() : "MANUAL"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              completed ? styles.completedBadge : styles.presentBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                completed ? styles.completedText : styles.presentText,
              ]}
            >
              {completed ? "COMPLETED" : "PRESENT"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>CHECK IN</Text>

            <Text style={styles.timeValue}>{formatTime(item?.checkIn)}</Text>
          </View>

          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>CHECK OUT</Text>

            <Text style={styles.timeValue}>{formatTime(item?.checkOut)}</Text>
          </View>

          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>DURATION</Text>

            <Text style={styles.timeValue}>{calculateDuration(item)}</Text>
          </View>
        </View>

        {item?.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes</Text>

            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading && attendance.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text style={styles.loadingText}>Loading attendance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Attendance</Text>

        <Text style={styles.subtitle}>
          Track your gym visits and attendance history
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={() => loadAttendance()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* SUMMARY */}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{attendance.length}</Text>

          <Text style={styles.summaryLabel}>Total Visits</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{completedCount}</Text>

          <Text style={styles.summaryLabel}>Completed</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{presentCount}</Text>

          <Text style={styles.summaryLabel}>In Gym</Text>
        </View>
      </View>

      {/* TABS */}

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

      {/* SEARCH */}

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search method, status or notes..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredAttendance}
        keyExtractor={(item, index) => item?._id || `attendance-${index}`}
        renderItem={renderAttendance}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAttendance(true)}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          filteredAttendance.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>

            <Text style={styles.emptyTitle}>No Attendance Records</Text>

            <Text style={styles.emptyText}>
              {activeTab === "today"
                ? "You have no attendance record for today."
                : "Your attendance history is empty."}
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
    backgroundColor: "#f3f4f6",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 5,
    lineHeight: 19,
  },

  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 15,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  summaryLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },

  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 9,
    padding: 3,
    marginBottom: 10,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 7,
  },

  activeTab: {
    backgroundColor: "#fff",
  },

  tabText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#2563eb",
    fontWeight: "800",
  },

  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 5,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  attendanceCard: {
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  date: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  method: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  completedBadge: {
    backgroundColor: "#dcfce7",
  },

  presentBadge: {
    backgroundColor: "#dbeafe",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  completedText: {
    color: "#166534",
  },

  presentText: {
    color: "#1d4ed8",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },

  timeRow: {
    flexDirection: "row",
    gap: 8,
  },

  timeBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 9,
  },

  timeLabel: {
    fontSize: 9,
    color: "#6b7280",
    fontWeight: "700",
  },

  timeValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "800",
    marginTop: 5,
  },

  notesContainer: {
    marginTop: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 10,
  },

  notesLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
  },

  notesText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 9,
    padding: 12,
  },

  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },

  retryText: {
    color: "#2563eb",
    fontWeight: "800",
    marginTop: 6,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 10,
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 19,
  },
});

export default MemberAttendanceScreen;
