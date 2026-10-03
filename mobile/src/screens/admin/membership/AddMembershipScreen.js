import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import SelectPersonModal from "../../../components/SelectPersonModal";
import api from "../../../services/api";

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AddMembershipScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [startDate, setStartDate] = useState(getLocalDate);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const [membersResponse, packagesResponse] = await Promise.all([
        api.get("/members"),
        api.get("/packages/active"),
      ]);

      const memberData =
        membersResponse.data?.members || membersResponse.data?.data || [];
      const packageData =
        packagesResponse.data?.packages || packagesResponse.data?.data || [];

      if (!Array.isArray(memberData) || !Array.isArray(packageData)) {
        throw new Error("Unexpected member or package response");
      }

      setMembers(memberData);
      setPackages(packageData);
    } catch (error) {
      console.log(
        "Load membership assignment options error:",
        error.response?.data || error.message,
      );
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load members and packages.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const handleAssign = async () => {
    if (!selectedMember) {
      Alert.alert("Validation", "Please select a member.");
      return;
    }

    if (!selectedPackage) {
      Alert.alert("Validation", "Please select a package.");
      return;
    }

    const [year, month, day] = startDate.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      Alert.alert("Invalid Date", "Enter a valid date in YYYY-MM-DD format.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/memberships", {
        memberId: selectedMember._id,
        packageId: selectedPackage._id,
        startDate: parsedDate.toISOString(),
      });

      Alert.alert("Success", "Membership assigned successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log(
        "Assign membership error:",
        error.response?.data || error.message,
      );
      Alert.alert(
        "Assignment Failed",
        error.response?.data?.message || "Failed to assign membership.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.helperText}>Loading members and packages...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOptions}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedMemberName =
    selectedMember?.user?.name || selectedMember?.name || "Select Member";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Assign Membership</Text>
      <Text style={styles.subtitle}>
        Choose a member and an active package for your gym.
      </Text>

      <Text style={styles.label}>Member *</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setMemberModalVisible(true)}
        disabled={saving}
      >
        <Text style={selectedMember ? styles.value : styles.placeholder}>
          {selectedMemberName}
        </Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      {members.length === 0 ? (
        <Text style={styles.helperText}>
          No members are assigned to this gym yet. Add a member first.
        </Text>
      ) : null}

      <Text style={styles.label}>Package *</Text>
      {packages.length === 0 ? (
        <Text style={styles.helperText}>
          No active packages are available. Create or activate a package first.
        </Text>
      ) : (
        packages.map((item) => {
          const selected = selectedPackage?._id === item._id;
          const price = Number(item.price || 0);
          const discount = Number(item.discount || 0);
          const finalPrice = price - (price * discount) / 100;

          return (
            <TouchableOpacity
              key={item._id}
              style={[styles.packageCard, selected && styles.selectedPackage]}
              onPress={() => setSelectedPackage(item)}
              disabled={saving}
            >
              <View style={styles.packageHeading}>
                <Text style={styles.packageName}>{item.name}</Text>
                {selected ? (
                  <Text style={styles.selectedLabel}>Selected</Text>
                ) : null}
              </View>
              <Text style={styles.helperText}>
                {item.duration} {item.durationUnit}
              </Text>
              <Text style={styles.packagePrice}>
                Rs. {finalPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.label}>Start Date *</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
        autoCapitalize="none"
        editable={!saving}
      />

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (saving || !members.length || !packages.length) &&
            styles.disabledButton,
        ]}
        onPress={handleAssign}
        disabled={saving || !members.length || !packages.length}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Assign Membership</Text>
        )}
      </TouchableOpacity>

      <SelectPersonModal
        visible={memberModalVisible}
        title="Select Member"
        data={members}
        selectedId={selectedMember?._id}
        onSelect={(member) => {
          setSelectedMember(member);
          setMemberModalVisible(false);
        }}
        onClose={() => setMemberModalVisible(false)}
        getName={(member) =>
          member.user?.name || member.name || "Unknown Member"
        }
        getEmail={(member) =>
          member.user?.email || member.email || "No email"
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    color: "#111",
    fontSize: 25,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 20,
    color: "#777",
  },
  label: {
    marginTop: 14,
    marginBottom: 7,
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  selector: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    color: "#111",
    fontSize: 15,
  },
  placeholder: {
    color: "#999",
    fontSize: 15,
  },
  arrow: {
    color: "#555",
    fontSize: 24,
  },
  packageCard: {
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  selectedPackage: {
    borderWidth: 2,
    borderColor: "#111",
  },
  packageHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageName: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
  selectedLabel: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "700",
  },
  packagePrice: {
    marginTop: 8,
    color: "#111",
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    color: "#111",
    fontSize: 15,
  },
  helperText: {
    marginTop: 6,
    color: "#777",
    fontSize: 13,
  },
  errorText: {
    marginBottom: 14,
    color: "#b91c1c",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#111",
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#111",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.55,
  },
});

export default AddMembershipScreen;
