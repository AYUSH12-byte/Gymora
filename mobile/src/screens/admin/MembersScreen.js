import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import api from "../../services/api";

const MembersScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD MEMBERS
  // =========================
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/members");

      console.log("MEMBERS API RESPONSE:", response.data);

      const data = response.data.members || response.data.data || [];

      setMembers(Array.isArray(data) ? data : []);
      setFilteredMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("MEMBERS ERROR:", error.response?.data || error.message);

      setError(error.response?.data?.message || "Failed to load members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadMembers();
  }, []);

  // =========================
  // SEARCH MEMBERS
  // =========================
  const handleSearch = (text) => {
    setSearch(text);

    const keyword = text.toLowerCase().trim();

    if (!keyword) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter((member) => {
      const name = member.user?.name?.toLowerCase() || "";

      const email = member.user?.email?.toLowerCase() || "";

      const phone = member.phone?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword)
      );
    });

    setFilteredMembers(filtered);
  };

  // =========================
  // REFRESH
  // =========================
  const handleRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  // =========================
  // MEMBER CARD
  // =========================
  const renderMember = ({ item }) => {
    const memberName = item.user?.name || "Unknown Member";

    const firstLetter = memberName.charAt(0).toUpperCase() || "M";

    const email = item.user?.email || "No email";

    const phone = item.phone || "No phone";

    const status = item.status || "inactive";

    const isActive = status.toLowerCase() === "active";

    return (
      <TouchableOpacity
        style={styles.memberCard}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("MemberDetails", {
            memberId: item._id,
          })
        }
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>

        {/* Member Information */}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName} numberOfLines={1}>
            {memberName}
          </Text>

          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>

          <Text style={styles.phone} numberOfLines={1}>
            {phone}
          </Text>
        </View>

        {/* Status */}
        <View
          style={[
            styles.statusBadge,
            isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />

        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  // =========================
  // ERROR SCREEN
  // =========================
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={() => {
            setLoading(true);
            loadMembers();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =========================
  // MAIN SCREEN
  // =========================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Members</Text>

          <Text style={styles.count}>
            {members.length} {members.length === 1 ? "member" : "members"}
          </Text>
        </View>

        {/* Add Member */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("AddMember")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={handleSearch}
          placeholder="Search name, email or phone..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {/* Clear Search */}
        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearch("")}
          >
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Result Count */}
      {search.length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {filteredMembers.length}{" "}
            {filteredMembers.length === 1 ? "result" : "results"} found
          </Text>
        </View>
      )}

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👤</Text>

            <Text style={styles.emptyTitle}>No members found</Text>

            <Text style={styles.emptyText}>
              {search
                ? "Try another search."
                : "Add your first member to get started."}
            </Text>

            {!search && (
              <TouchableOpacity
                style={styles.emptyButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate("AddMember")}
              >
                <Text style={styles.emptyButtonText}>+ Add Member</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

export default MembersScreen;

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
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

  error: {
    color: "#d00",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
  },

  count: {
    marginTop: 5,
    color: "#777",
    fontSize: 14,
  },

  // Add Button
  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 10,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Search
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    position: "relative",
  },

  searchInput: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingRight: 45,
    fontSize: 14,
    color: "#111",
  },

  clearButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  clearText: {
    fontSize: 25,
    color: "#777",
    lineHeight: 28,
  },

  // Search Result
  resultContainer: {
    paddingHorizontal: 20,
    marginBottom: 5,
  },

  resultText: {
    color: "#777",
    fontSize: 13,
  },

  // List
  list: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 30,
    flexGrow: 1,
  },

  // Member Card
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
  },

  // Member Info
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },

  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },

  email: {
    fontSize: 13,
    color: "#666",
    marginTop: 3,
  },

  phone: {
    fontSize: 13,
    color: "#888",
    marginTop: 3,
  },

  // Status
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },

  activeBadge: {
    backgroundColor: "#dff5e3",
  },

  inactiveBadge: {
    backgroundColor: "#eee",
  },

  statusText: {
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "600",
    color: "#333",
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },

  emptyText: {
    marginTop: 8,
    color: "#777",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },

  emptyButton: {
    backgroundColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
