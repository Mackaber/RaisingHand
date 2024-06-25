import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Camera } from "expo-camera";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import BoundingBox from "./BoundingBox"; // Import the BoundingBox component
import { scalePredictions } from "./utils";
import { Dimensions } from "react-native";

const TensorCamera = cameraWithTensors(Camera);

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const FRAME_SKIP_INTERVAL = 10; // Process one frame every 10 frames
  const frameSkip = useRef(FRAME_SKIP_INTERVAL);
  const isProcessing = useRef(false); // Ref to track if processing is ongoing

  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {
      const nextImageTensor = images.next().value;

      // Store a copy of the frame for processing
      if (!isProcessing.current && nextImageTensor) {
        frameData.current = nextImageTensor.clone();
        console.log(`Processing frame... isProcessing: ${isProcessing.current}`);
        processFrame();
      }

      tf.dispose(nextImageTensor);
      requestAnimationFrame(loop);
    };

    loop();
  };

  const processFrame = async () => {
    if (frameData.current && model) {
      isProcessing.current = true;
      try {
        console.log('Processing frame...');
        const preds = await model.detect(frameData.current);
        const scaledPreds = scalePredictions(preds, screenWidth, screenHeight, 1920, 1080);
        setPredictions(scaledPreds);
        console.log(`[PREDICTIONS] ${JSON.stringify(scaledPreds)}, frame: ${frameSkip.current}`);
      } catch (error) {
        console.error(error);
      } finally {
        tf.dispose(frameData.current);
        frameData.current = null;
        isProcessing.current = false;
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
      await tf.ready();
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <TensorCamera
        style={styles.camera}
        type={type}
        cameraTextureHeight={1080}
        cameraTextureWidth={1920}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
      />
      <BoundingBox
        predictions={predictions}
        cameraTextureWidth={1920}
        cameraTextureHeight={1080}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
});

export default App;
