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

        <Text style={styles.text}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          Camera Permission Required
        </Text>

        <Text style={styles.text}>
          Camera access is required to scan QR codes.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || processing) {
      return;
    }

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

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Attendance operation failed"
        );
      }

      const member = response.data.member || {};

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
    } catch (error) {
      console.log(
        "QR error:",
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

      {/* CAMERA ONLY */}
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarcodeScanned
        }
      />

      {/* SIMPLE UI */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          QR Attendance
        </Text>

        <Text style={styles.headerSubtitle}>
          Point the camera at member QR
        </Text>
      </View>

      {/* SCAN BOX */}
      <View style={styles.scanBox}>
        <View style={styles.lineTopLeft} />
        <View style={styles.lineTopRight} />
        <View style={styles.lineBottomLeft} />
        <View style={styles.lineBottomRight} />
      </View>

      {/* BOTTOM */}
      <View style={styles.bottom}>

        {/* MODE */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "check-in" &&
                styles.activeButton,
            ]}
            onPress={() => {
              if (processing) return;

              setMode("check-in");
              setScanned(false);
            }}
          >
            <Text
              style={[
                styles.modeText,
                mode === "check-in" &&
                  styles.activeText,
              ]}
            >
              Check In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "check-out" &&
                styles.activeButton,
            ]}
            onPress={() => {
              if (processing) return;

              setMode("check-out");
              setScanned(false);
            }}
          >
            <Text
              style={[
                styles.modeText,
                mode === "check-out" &&
                  styles.activeText,
              ]}
            >
              Check Out
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.instruction}>
          {processing
            ? "Processing..."
            : `Scan QR to ${
                mode === "check-in"
                  ? "check in"
                  : "check out"
              }`}
        </Text>

        {processing && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={{ marginTop: 10 }}
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
        >
          <Text style={styles.closeText}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  /*
   * IMPORTANT
   * Camera is the base layer.
   */
  camera: {
    flex: 1,
  },

  /*
   * Header is positioned independently.
   * It does NOT have a full-screen background.
   */
  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#fff",
    marginTop: 5,
    fontSize: 14,
  },

  /*
   * QR FRAME
   */
  scanBox: {
    position: "absolute",
    width: 270,
    height: 270,
    top: "32%",
    left: "50%",
    marginLeft: -135,
    borderWidth: 0,
  },

  lineTopLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 45,
    height: 45,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: "#fff",
  },

  lineTopRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 45,
    height: 45,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: "#fff",
  },

  lineBottomLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 45,
    height: 45,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#fff",
  },

  lineBottomRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 45,
    height: 45,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: "#fff",
  },

  /*
   * BOTTOM CONTROLS
   */
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 25,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modeContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 4,
  },

  modeButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },

  activeButton: {
    backgroundColor: "#fff",
  },

  modeText: {
    color: "#fff",
    fontWeight: "600",
  },

  activeText: {
    color: "#111",
  },

  instruction: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
  },

  scanAgain: {
    marginTop: 12,
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
    marginTop: 10,
    padding: 10,
  },

  closeText: {
    color: "#fff",
    fontWeight: "600",
  },

  /*
   * PERMISSION
   */
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  text: {
    marginTop: 10,
    color: "#666",
    textAlign: "center",
  },

  permissionButton: {
    marginTop: 20,
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default QRScannerScreen;