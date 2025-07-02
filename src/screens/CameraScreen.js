import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Text,
  Alert,
  Linking,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from "react-native-vision-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Image as ImageCompressor } from "react-native-compressor";
import Icon from "react-native-vector-icons/MaterialIcons";

const CameraScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1920, height: 1080 } },
  ]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const takePhoto = async () => {
    try {
      if (!cameraRef.current) return;
      setIsLoading(true);
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: "balanced",
        skipMetadata: true,
      });
      setCapturedImage(photo.path);
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => setCapturedImage(null);

  const submitPhoto = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    try {
      // const compressedUri = await ImageCompressor.compress(capturedImage, {
      //   quality: 0.9,
      //   compressionMethod: 'auto'
      // });

      route.params?.onCapture("file://" + capturedImage);
      navigation.goBack();
    } catch (error) {
      console.log("Compression error:", error);
      Alert.alert("Error", "Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="no-photography" size={50} color="gray" />
        <Text style={styles.errorText}>Camera permission required</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="camera-off" size={50} color="gray" />
        <Text style={styles.errorText}>Camera not available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: `file://${capturedImage}` }}
            style={styles.previewImage}
          />
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={retakePhoto}
              disabled={isLoading}
            >
              <Icon name="refresh" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.primaryButton]}
              onPress={submitPhoto}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Icon name="check" size={28} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {isFocused && (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              format={format}
              isActive={isFocused}
              photo={true}
              orientation="portrait"
            />
          )}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePhoto}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginBottom: 15,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  settingsButton: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  previewImage: {
    flex: 1,
    resizeMode: "contain",
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  actionBar: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    alignSelf: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.7)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
  },
});

export default CameraScreen;
