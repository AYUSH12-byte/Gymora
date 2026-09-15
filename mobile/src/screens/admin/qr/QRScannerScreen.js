import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import api from "../../../services/api";

const QRScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState("check-in");

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          Camera Permission Required
        </Text>

        <Text style={styles.permissionText}>
          Camera access is required to scan gym member QR
          codes.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    try {
      let qrData;

      try {
        qrData = JSON.parse(data);
      } catch {
        throw new Error("Invalid gym QR code");
      }

      if (
        qrData?.type !== "GYM_MEMBER" ||
        !qrData?.memberId ||
        !qrData?.token
      ) {
        throw new Error("Invalid gym member QR code");
      }

      const endpoint =
        mode === "check-in"
          ? "/attendance/qr-check-in"
          : "/attendance/qr-check-out";

      const response = await api.post(endpoint, {
        memberId: qrData.memberId,
        token: qrData.token,
      });

      if (response.data.success) {
        const member =
          response.data.member || {};

        const memberName =
          member.name ||
          member.user?.name ||
          "Member";

        Alert.alert(
          mode === "check-in"
            ? "Check-in Successful"
            : "Check-out Successful",
          `${memberName} ${
            mode === "check-in"
              ? "has checked in."
              : "has checked out."
          }`,
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              },
            },
          ]
        );
      } else {
        throw new Error(
          response.data.message ||
            "Attendance operation failed"
        );
      }
    } catch (error) {
      console.log(
        "QR attendance error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "QR Scan Failed",
        error.response?.data?.message ||
          error.message ||
          "Unable to process QR code",
        [
          {
            text: "Try Again",
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarcodeScanned
        }
      />

      <View style={styles.overlay}>
        <View style={styles.top}>
          <Text style={styles.title}>
            QR Attendance
          </Text>

          <Text style={styles.subtitle}>
            Scan member QR code
          </Text>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        <View style={styles.bottom}>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "check-in" &&
                  styles.activeMode,
              ]}
              onPress={() => {
                setMode("check-in");
                setScanned(false);
              }}
              disabled={processing}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === "check-in" &&
                    styles.activeModeText,
                ]}
              >
                Check In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "check-out" &&
                  styles.activeMode,
              ]}
              onPress={() => {
                setMode("check-out");
                setScanned(false);
              }}
              disabled={processing}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === "check-out" &&
                    styles.activeModeText,
                ]}
              >
                Check Out
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.instruction}>
            {processing
              ? "Processing attendance..."
              : `Scan QR to ${
                  mode === "check-in"
                    ? "check in"
                    : "check out"
                }`}
          </Text>

          {processing && (
            <ActivityIndicator
              color="#fff"
              size="small"
              style={styles.loader}
            />
          )}

          {!processing && scanned && (
            <TouchableOpacity
              style={styles.scanAgain}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>
                Scan Again
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            disabled={processing}
          >
            <Text style={styles.closeText}>
              Close Scanner
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  permissionText: {
    marginTop: 10,
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },

  permissionButton: {
    marginTop: 20,
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
  },

  permissionButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "space-between",
    paddingTop: 65,
    paddingBottom: 35,
  },

  top: {
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
  },

  subtitle: {
    color: "#ddd",
    marginTop: 6,
    fontSize: 14,
  },

  scanArea: {
    width: 270,
    height: 270,
    alignSelf: "center",
    position: "relative",
  },

  cornerTopLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 45,
    height: 45,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: "#fff",
  },

  cornerTopRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 45,
    height: 45,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: "#fff",
  },

  cornerBottomLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 45,
    height: 45,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#fff",
  },

  cornerBottomRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 45,
    height: 45,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#fff",
  },

  bottom: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modeContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },

  modeButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },

  activeMode: {
    backgroundColor: "#fff",
  },

  modeText: {
    color: "#fff",
    fontWeight: "600",
  },

  activeModeText: {
    color: "#111",
  },

  instruction: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },

  loader: {
    marginTop: 10,
  },

  scanAgain: {
    marginTop: 15,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 10,
  },

  scanAgainText: {
    color: "#111",
    fontWeight: "700",
  },

  closeButton: {
    marginTop: 15,
    paddingHorizontal: 25,
    paddingVertical: 11,
  },

  closeText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default QRScannerScreen;