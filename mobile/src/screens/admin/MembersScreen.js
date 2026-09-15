import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import api from "../../services/api";

const MembersScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/members");

      console.log("MEMBERS API RESPONSE:", response.data);

      const data =
        response.data.members ||
        response.data.data ||
        [];

      const memberList = Array.isArray(data) ? data : [];

      setMembers(memberList);
      setFilteredMembers(memberList);
    } catch (error) {
      console.log(
        "MEMBERS API ERROR:",
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

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadMembers(false);
  };

  const handleSearch = (text) => {
    setSearch(text);

    const keyword = text.toLowerCase().trim();

    if (!keyword) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter((item) => {
      const name =
        item.user?.name ||
        item.name ||
        "";

      const email =
        item.user?.email ||
        item.email ||
        "";

      const phone =
        item.phone ||
        "";

      return (
        name.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        phone.toLowerCase().includes(keyword)
      );
    });

    setFilteredMembers(filtered);
  };

  const getMemberName = (item) => {
    return (
      item.user?.name ||
      item.name ||
      "Unknown Member"
    );
  };

  const getMemberEmail = (item) => {
    return (
      item.user?.email ||
      item.email ||
      "No email"
    );
  };

  const renderMember = ({ item }) => {
    const memberName = getMemberName(item);
    const memberEmail = getMemberEmail(item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => {
          console.log(
            "Opening member details:",
            item._id
          );

          navigation.navigate("MemberDetails", {
            memberId: item._id,
          });
        }}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {memberName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {memberName}
          </Text>

          <Text style={styles.email}>
            {memberEmail}
          </Text>

          <Text style={styles.phone}>
            {item.phone || "No phone"}
          </Text>
        </View>

        <View
          style={[
            styles.status,
            item.status === "active"
              ? styles.activeStatus
              : styles.inactiveStatus,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "active"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {item.status || "inactive"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading members...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Members
          </Text>

          <Text style={styles.subtitle}>
            {members.length} member
            {members.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddMember")
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search member..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadMembers()}
          >
            <Text style={styles.retryText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredMembers.length === 0
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
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              No Members Found
            </Text>

            <Text style={styles.emptyText}>
              {search
                ? "No members match your search."
                : "No members available."}
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
    padding: 16,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 3,
    color: "#777",
  },

  addButton: {
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 9,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111",
    marginBottom: 15,
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
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
    fontWeight: "700",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  email: {
    marginTop: 3,
    fontSize: 13,
    color: "#666",
  },

  phone: {
    marginTop: 3,
    fontSize: 13,
    color: "#888",
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  activeStatus: {
    backgroundColor: "#dcfce7",
  },

  inactiveStatus: {
    backgroundColor: "#fee2e2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  activeText: {
    color: "#15803d",
  },

  inactiveText: {
    color: "#dc2626",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  errorText: {
    color: "#b91c1c",
    marginBottom: 8,
  },

  retryButton: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 7,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyBox: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
  },

  emptyText: {
    marginTop: 7,
    color: "#777",
    textAlign: "center",
  },
});

export default MembersScreen;