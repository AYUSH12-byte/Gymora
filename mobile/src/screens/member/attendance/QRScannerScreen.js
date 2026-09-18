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
  Camera,
  useCameraPermissions,
} from "expo-camera";

import * as ImagePicker from "expo-image-picker";

import api from "../../../services/api";

const QRScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState("check-in");

  // CAMERA PERMISSION
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

  // PROCESS QR DATA

  const processQRData = async (data) => {
    if (processing) {
      return;
    }

    setProcessing(true);

    try {
      console.log("QR DATA:", data);

      let qrData;

      try {
        qrData = JSON.parse(data);
      } catch (error) {
        throw new Error(
          "Invalid gym QR code.",
        );
      }

      console.log("PARSED QR DATA:", qrData);

      // VALIDATE QR

      if (
        qrData?.type !== "GYM_MEMBER" ||
        !qrData?.memberId ||
        !qrData?.token
      ) {
        throw new Error(
          "Invalid gym member QR code.",
        );
      }

      // SELECT ENDPOINT

      const endpoint =
        mode === "check-in"
          ? "/attendance/qr-check-in"
          : "/attendance/qr-check-out";

      console.log(
        "ATTENDANCE ENDPOINT:",
        endpoint,
      );

      // SEND TO BACKEND

      const response = await api.post(endpoint, {
        memberId: qrData.memberId,
        token: qrData.token,
      });

      console.log(
        "QR ATTENDANCE RESPONSE:",
        response.data,
      );


      // CHECK RESPONSE


      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Attendance operation failed.",
        );
      }

      // DURATION

      const duration =
        response.data?.durationMinutes ??
        response.data?.attendance
          ?.durationMinutes;

      // SUCCESS

      if (mode === "check-in") {
        Alert.alert(
          "Check-in Successful",
          "Your attendance has been recorded successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Check-out Successful",
          duration !== undefined
            ? `Your attendance has been completed.\n\nDuration: ${duration} minutes`
            : "Your attendance has been completed successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              },
            },
          ],
        );
      }
    } catch (error) {
      console.log(
        "QR ATTENDANCE ERROR:",
        error?.response?.data ||
          error?.message ||
          error,
      );

      setProcessing(false);

      Alert.alert(
        "QR Scan Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to process QR code.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setScanned(false);
            },
          },
        ],
      );
    }
  };

  // CAMERA QR SCAN

  const handleBarcodeScanned = async ({
    data,
  }) => {
    if (scanned || processing) {
      return;
    }

    console.log(
      "CAMERA QR SCANNED:",
      data,
    );

    setScanned(true);

    await processQRData(data);
  };

  // GALLERY QR SCAN

  const handleGalleryScan = async () => {
    if (processing) {
      return;
    }

    try {
      // REQUEST GALLERY PERMISSION


      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission Required",
          "Please allow gallery access to select a QR image.",
        );

        return;
      }

      // OPEN GALLERY

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        });

      if (result.canceled) {
        return;
      }

      // GET IMAGE URI

      const imageUri =
        result.assets?.[0]?.uri;

      if (!imageUri) {
        Alert.alert(
          "Image Error",
          "Unable to select the image.",
        );

        return;
      }

      console.log(
        "SELECTED GALLERY IMAGE:",
        imageUri,
      );

      setScanned(true);
      setProcessing(true);

      // SCAN QR FROM IMAGE

      const scanResult =
        await Camera.scanFromURLAsync(
          imageUri,
          ["qr"],
        );

      console.log(
        "GALLERY QR RESULT:",
        scanResult,
      );

      // CHECK QR RESULT

      if (
        !scanResult ||
        scanResult.length === 0
      ) {
        throw new Error(
          "No QR code found in the selected image.",
        );
      }

      const qrData =
        scanResult[0]?.data;

      if (!qrData) {
        throw new Error(
          "Unable to read QR code data.",
        );
      }

      console.log(
        "GALLERY QR DATA:",
        qrData,
      );

      // PROCESS QR

      await processQRData(qrData);
    } catch (error) {
      console.log(
        "GALLERY QR ERROR:",
        error?.response?.data ||
          error?.message ||
          error,
      );

      setProcessing(false);
      setScanned(false);

      Alert.alert(
        "Gallery QR Scan Failed",
        error?.response?.data?.message ||
          error?.message ||
          "No valid QR code was found in the selected image.",
        [
          {
            text: "Try Again",
          },
        ],
      );
    }
  };

  // CHANGE CHECK-IN / CHECK-OUT MODE

  const handleModeChange = (newMode) => {
    if (processing) {
      return;
    }

    setMode(newMode);
    setScanned(false);
  };

  // SCAN AGAIN

  const handleScanAgain = () => {
    setScanned(false);
    setProcessing(false);
  };

  // UI


  return (
    <View style={styles.container}>
      {/* CAMERA*/}

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

      {/* HEADER*/}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          QR Attendance
        </Text>

        <Text style={styles.headerSubtitle}>
          Scan the QR displayed by gym admin
        </Text>
      </View>

      {/*  SCAN FRAME */}

      <View style={styles.scanBox}>
        <View style={styles.lineTopLeft} />

        <View style={styles.lineTopRight} />

        <View style={styles.lineBottomLeft} />

        <View style={styles.lineBottomRight} />
      </View>

      {/* BOTTOM CONTROLS */}

      <View style={styles.bottom}>
        {/* CHECK IN / CHECK OUT */}

        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "check-in" &&
                styles.activeButton,
            ]}
            onPress={() =>
              handleModeChange("check-in")
            }
            disabled={processing}
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
            onPress={() =>
              handleModeChange("check-out")
            }
            disabled={processing}
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

        {/* INSTRUCTION */}

        <Text style={styles.instruction}>
          {processing
            ? "Processing..."
            : `Scan QR to ${
                mode === "check-in"
                  ? "check in"
                  : "check out"
              }`}
        </Text>

        {/* LOADING */}

        {processing && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={styles.loader}
          />
        )}

        {/* GALLERY BUTTON */}

        {!processing && (
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGalleryScan}
          >
            <Text style={styles.galleryText}>
              Select QR from Gallery
            </Text>
          </TouchableOpacity>
        )}

        {/* SCAN AGAIN */}

        {!processing && scanned && (
          <TouchableOpacity
            style={styles.scanAgain}
            onPress={handleScanAgain}
          >
            <Text style={styles.scanAgainText}>
              Scan Again
            </Text>
          </TouchableOpacity>
        )}

        {/* CLOSE */}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() =>
            navigation.goBack()
          }
          disabled={processing}
        >
          <Text style={styles.closeText}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  // HEADER

  header: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
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
    textAlign: "center",
  },

  // SCAN BOX

  scanBox: {
    position: "absolute",
    width: 270,
    height: 270,
    top: "32%",
    left: "50%",
    marginLeft: -135,
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

  // BOTTOM

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 25,
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // MODE

  modeContainer: {
    flexDirection: "row",
    backgroundColor:
      "rgba(0, 0, 0, 0.7)",
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

  // INSTRUCTION

  instruction: {
    color: "#fff",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },

  loader: {
    marginTop: 10,
  },

  // GALLERY

  galleryButton: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  galleryText: {
    color: "#111",
    fontWeight: "700",
  },

  // SCAN AGAIN

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

  // CLOSE


  closeButton: {
    marginTop: 10,
    padding: 10,
  },

  closeText: {
    color: "#fff",
    fontWeight: "600",
  },

  // PERMISSION


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