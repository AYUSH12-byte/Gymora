import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";

import api from "../../../services/api";

const AttendanceScreen = () => {
  const [activeTab, setActiveTab] = useState("today");

  const [todayAttendance, setTodayAttendance] = useState([]);
  const [historyAttendance, setHistoryAttendance] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // GET ATTENDANCE ARRAY FROM API RESPONSE
  // =========================================================
  const getAttendanceData = (response) => {
    const responseData = response?.data;

    console.log("RAW API RESPONSE:", responseData);

    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.attendance)) {
      return responseData.attendance;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.records)) {
      return responseData.records;
    }

    if (Array.isArray(responseData?.results)) {
      return responseData.results;
    }

    if (Array.isArray(responseData?.items)) {
      return responseData.items;
    }

    return [];
  };

  // =========================================================
  // LOAD TODAY ATTENDANCE
  // =========================================================
  const loadTodayAttendance = async () => {
    try {
      const response = await api.get("/attendance/today");

      const data = getAttendanceData(response);

      console.log("=================================");
      console.log("TODAY ATTENDANCE");
      console.log("API COUNT:", response?.data?.count);
      console.log("RECORD COUNT:", data.length);
      console.log("RECORDS:", JSON.stringify(data, null, 2));
      console.log("=================================");

      setTodayAttendance(data);
    } catch (err) {
      console.error(
        "TODAY ATTENDANCE ERROR:",
        err?.response?.data || err?.message
      );

      throw err;
    }
  };

  // =========================================================
  // LOAD ATTENDANCE HISTORY
  // =========================================================
  const loadHistoryAttendance = async () => {
    try {
      const response = await api.get("/attendance");

      const data = getAttendanceData(response);

      console.log("=================================");
      console.log("ATTENDANCE HISTORY");
      console.log("API COUNT:", response?.data?.count);
      console.log("RECORD COUNT:", data.length);
      console.log("RECORDS:", JSON.stringify(data, null, 2));
      console.log("=================================");

      setHistoryAttendance(data);
    } catch (err) {
      console.error(
        "ATTENDANCE HISTORY ERROR:",
        err?.response?.data || err?.message
      );

      throw err;
    }
  };

  // =========================================================
  // LOAD ALL ATTENDANCE
  // =========================================================
  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        loadTodayAttendance(),
        loadHistoryAttendance(),
      ]);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length > 0) {
        const firstError = failedRequests[0]?.reason;

        setError(
          firstError?.response?.data?.message ||
            "Failed to load attendance."
        );
      }
    } catch (err) {
      console.error("LOAD ATTENDANCE ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    loadAttendance();
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      const results = await Promise.allSettled([
        loadTodayAttendance(),
        loadHistoryAttendance(),
      ]);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length > 0) {
        const firstError = failedRequests[0]?.reason;

        setError(
          firstError?.response?.data?.message ||
            "Failed to refresh attendance."
        );
      }
    } catch (err) {
      console.error("REFRESH ERROR:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to refresh attendance."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // MEMBER NAME
  // =========================================================
  const getMemberName = (item) => {
    if (!item) {
      return "";
    }

    const name =
      item?.member?.user?.name ||
      item?.member?.user?.fullName ||
      item?.member?.user?.username ||
      item?.member?.name ||
      item?.member?.fullName ||
      item?.member?.memberName ||
      item?.user?.name ||
      item?.user?.fullName ||
      item?.user?.username ||
      item?.name ||
      item?.fullName ||
      item?.memberName ||
      item?.customerName ||
      item?.customer?.name ||
      item?.customer?.fullName ||
      "";

    return typeof name === "string" ? name.trim() : "";
  };

  // =========================================================
  // MEMBER EMAIL
  // =========================================================
  const getMemberEmail = (item) => {
    if (!item) {
      return "";
    }

    const email =
      item?.member?.user?.email ||
      item?.member?.email ||
      item?.user?.email ||
      item?.email ||
      item?.customer?.email ||
      "";

    return typeof email === "string" ? email.trim() : "";
  };

  // =========================================================
  // STATUS
  // =========================================================
  const getStatus = (item) => {
    if (item?.checkOut) {
      return "Completed";
    }

    if (
      item?.status === "present" ||
      item?.status === "Present"
    ) {
      return "Present";
    }

    if (item?.status) {
      return String(item.status);
    }

    return "-";
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================
  const getStatusStyle = (item) => {
    const status = getStatus(item).toLowerCase();

    if (status === "completed") {
      return styles.completedBadge;
    }

    if (status === "present") {
      return styles.presentBadge;
    }

    if (status === "absent") {
      return styles.absentBadge;
    }

    return styles.otherBadge;
  };

  // =========================================================
  // DATE
  // =========================================================
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  };

  // =========================================================
  // TIME
  // =========================================================
  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // DURATION
  // =========================================================
  const getDuration = (item) => {
    if (
      item?.duration !== undefined &&
      item?.duration !== null
    ) {
      return `${item.duration} min`;
    }

    if (
      item?.durationMinutes !== undefined &&
      item?.durationMinutes !== null
    ) {
      return `${item.durationMinutes} min`;
    }

    if (!item?.checkIn || !item?.checkOut) {
      return "-";
    }

    const checkIn = new Date(item.checkIn);
    const checkOut = new Date(item.checkOut);

    if (
      Number.isNaN(checkIn.getTime()) ||
      Number.isNaN(checkOut.getTime())
    ) {
      return "-";
    }

    const minutes = Math.floor(
      (checkOut.getTime() - checkIn.getTime()) / 60000
    );

    if (minutes < 0) {
      return "-";
    }

    return `${minutes} min`;
  };

  // =========================================================
  // CURRENT DATA
  // =========================================================
  const currentData =
    activeTab === "today"
      ? todayAttendance
      : historyAttendance;

  // =========================================================
  // SEARCH FILTER
  // =========================================================
  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return currentData;
    }

    return currentData.filter((item) => {
      const name = getMemberName(item).toLowerCase();

      const email = getMemberEmail(item).toLowerCase();

      const method = String(
        item?.method || ""
      ).toLowerCase();

      const status = getStatus(item).toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        method.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [currentData, search]);

  // =========================================================
  // RENDER ATTENDANCE
  // =========================================================
  const renderAttendance = ({ item }) => {
    const memberName = getMemberName(item);
    const memberEmail = getMemberEmail(item);

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {memberName || "Member"}
            </Text>

            {memberEmail ? (
              <Text style={styles.email}>
                {memberEmail}
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.statusBadge,
              getStatusStyle(item),
            ]}
          >
            <Text style={styles.statusText}>
              {getStatus(item)}
            </Text>
          </View>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* DATE + METHOD */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Date</Text>

            <Text style={styles.value}>
              {formatDate(
                item?.date || item?.checkIn
              )}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Method</Text>

            <Text style={styles.value}>
              {item?.method
                ? String(item.method).toUpperCase()
                : "-"}
            </Text>
          </View>
        </View>

        {/* CHECK IN + CHECK OUT */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>
              Check In
            </Text>

            <Text style={styles.value}>
              {formatTime(item?.checkIn)}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>
              Check Out
            </Text>

            <Text style={styles.value}>
              {formatTime(item?.checkOut)}
            </Text>
          </View>
        </View>

        {/* DURATION */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>
              Duration
            </Text>

            <Text style={styles.value}>
              {getDuration(item)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading attendance...
        </Text>
      </View>
    );
  }

  // =========================================================
  // MAIN SCREEN
  // =========================================================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Attendance
        </Text>

        <Text style={styles.subtitle}>
          Track member check-in and check-out records
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "today" &&
              styles.activeTab,
          ]}
          onPress={() => {
            setActiveTab("today");
            setSearch("");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "today" &&
                styles.activeTabText,
            ]}
          >
            Today ({todayAttendance.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "history" &&
              styles.activeTab,
          ]}
          onPress={() => {
            setActiveTab("history");
            setSearch("");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" &&
                styles.activeTabText,
            ]}
          >
            History ({historyAttendance.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search member..."
        placeholderTextColor="#9ca3af"
        style={styles.searchInput}
      />

      {/* ERROR */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={loadAttendance}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) =>
          String(
            item?._id ||
              item?.id ||
              item?.attendanceId ||
              `attendance-${index}`
          )
        }
        renderItem={renderAttendance}
        contentContainerStyle={
          filteredData.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {search
                ? "No matching records"
                : activeTab === "today"
                ? "No attendance today"
                : "No attendance history"}
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? "No matching attendance records found."
                : activeTab === "today"
                ? "No member has checked in today."
                : "Attendance records will appear here."}
            </Text>
          </View>
        }
      />
    </View>
  );
};

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#6b7280",
  },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 11,
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
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#111827",
  },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 10,
  },

  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },

  retryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#991b1b",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },

  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
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
    paddingRight: 10,
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
    paddingVertical: 6,
    borderRadius: 20,
  },

  presentBadge: {
    backgroundColor: "#dcfce7",
  },

  completedBadge: {
    backgroundColor: "#dbeafe",
  },

  absentBadge: {
    backgroundColor: "#fee2e2",
  },

  otherBadge: {
    backgroundColor: "#f3f4f6",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  infoBox: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  emptyBox: {
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#6b7280",
    lineHeight: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },

  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },
});

export default AttendanceScreen;