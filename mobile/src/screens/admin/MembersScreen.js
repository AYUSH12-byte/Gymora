import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import api from "../../services/api";

const MembersScreen = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    try {
      setError("");

      const response = await api.get("/members");

      if (response.data.success) {
        const data = response.data.data || [];

        setMembers(data);
        setFilteredMembers(data);
      }
    } catch (error) {
      console.log(
        "Members error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load members"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

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

  const handleRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const renderMember = ({ item }) => {
    return (
      <View style={styles.memberCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user?.name?.charAt(0)?.toUpperCase() || "M"}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {item.user?.name || "Unknown Member"}
          </Text>

          <Text style={styles.email}>
            {item.user?.email || "No email"}
          </Text>

          <Text style={styles.phone}>
            {item.phone || "No phone"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === "active"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading members...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>

        <Text style={styles.count}>
          {members.length} members
        </Text>
      </View>

      <TextInput
        value={search}
        onChangeText={handleSearch}
        placeholder="Search name, email or phone..."
        style={styles.searchInput}
      />

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No members found
            </Text>

            <Text style={styles.emptyText}>
              Try another search or add a new member.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default MembersScreen;

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
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  error: {
    color: "#d00",
    fontSize: 16,
    textAlign: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  count: {
    marginTop: 5,
    color: "#777",
  },

  searchInput: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  list: {
    padding: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },

  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

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

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 16,
    fontWeight: "bold",
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

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
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
  },

  empty: {
    alignItems: "center",
    paddingTop: 50,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  emptyText: {
    marginTop: 8,
    color: "#777",
    textAlign: "center",
  },
});