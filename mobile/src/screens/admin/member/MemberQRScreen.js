import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";

import api from "../../../services/api";

const MemberQRScreen = ({ route, navigation }) => {
  const { memberId } = route.params || {};

  const [qr, setQr] = useState(null);
  const [member, setMember] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadQR = useCallback(async () => {
    if (!memberId) {
      setError("Member ID is missing");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await api.get(`/members/${memberId}/qr`);

      if (response.data?.success) {
        setQr(response.data.qr);
        setMember(response.data.member);
      } else {
        setError(response.data?.message || "Failed to load QR code");
      }
    } catch (error) {
      console.error("Member QR Error:", error.response?.data || error.message);

      setError(
        error.response?.data?.message || "Failed to load member QR code",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadQR();
  }, [loadQR]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadQR();
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Generating QR code...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>!</Text>

        <Text style={styles.errorTitle}>Unable to Load QR</Text>

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={loadQR}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Member QR</Text>
          <Text style={styles.subtitle}>Attendance QR Code</Text>
        </View>
      </View>

      {/* Member Information */}
      <View style={styles.memberCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(member?.name || "M").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member?.name || "Member"}</Text>

          <Text style={styles.memberEmail}>{member?.email || "No email"}</Text>

          {member?.phone ? (
            <Text style={styles.memberPhone}>{member.phone}</Text>
          ) : null}
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{member?.status || "active"}</Text>
        </View>
      </View>

      {/* QR Card */}
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Scan to Mark Attendance</Text>

        <Text style={styles.qrDescription}>
          Keep this QR code visible while the member scans it from their mobile
          app.
        </Text>

        {qr?.image ? (
          <View style={styles.qrWrapper}>
            <Image
              source={{ uri: qr.image }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.noQR}>
            <Text style={styles.noQRText}>QR code unavailable</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Attendance Flow</Text>

          <Text style={styles.infoText}>1. Admin displays this QR code</Text>

          <Text style={styles.infoText}>2. Member opens QR Scanner</Text>

          <Text style={styles.infoText}>3. Member scans this QR code</Text>

          <Text style={styles.infoText}>
            4. Attendance is recorded automatically
          </Text>
        </View>
      </View>

      {/* QR Data */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>QR Information</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{qr?.type || "GYM_MEMBER"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member ID</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {qr?.memberId || memberId}
          </Text>
        </View>
      </View>

      {/* Close */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={styles.closeButtonText}>Back to Member</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f7fb",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#222",
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#6b7280",
  },

  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  memberEmail: {
    marginTop: 3,
    fontSize: 13,
    color: "#6b7280",
  },

  memberPhone: {
    marginTop: 2,
    fontSize: 13,
    color: "#6b7280",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
    textTransform: "capitalize",
  },

  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
  },

  qrTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  qrDescription: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
    textAlign: "center",
  },

  qrWrapper: {
    width: 280,
    height: 280,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  qrImage: {
    width: "100%",
    height: "100%",
  },

  noQR: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },

  noQRText: {
    color: "#6b7280",
  },

  infoBox: {
    width: "100%",
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 5,
  },

  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  detailsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },

  detailValue: {
    flex: 1,
    marginLeft: 20,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },

  closeButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  errorIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    textAlign: "center",
    lineHeight: 45,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    textAlign: "center",
    color: "#6b7280",
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default MemberQRScreen;
