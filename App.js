import React, { useEffect, useState } from "react";
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
  const { width: screenWidth, height: screenHeight } =
     Dimensions.get("window");

  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {
      // Mock predictions to test
      //setPredictions([{ class: "person", score: 0.9, bbox: [0, 0, 0.1, 0.1] }]);

      // Change the predictions randomly every frame
      /*
      setPredictions([
        {
          class: "person",
          score: 0.9,
          bbox: [Math.random(), Math.random(), 0.1, 0.1],
        },
      ]);
      */
      const nextImageTensor = images.next().value;

      // Process the image tensor with TensorFlow
      if (nextImageTensor && model) {
        const preds = await model.detect(nextImageTensor);
        const scaledPreds = scalePredictions(
          preds,
          screenWidth,
          screenHeight,
          1920,
          1080
        );

        // Log the predictions
        console.log(scaledPreds);
        setPredictions(scaledPreds);
        await tf.dispose(nextImageTensor);
      }

      requestAnimationFrame(loop);
    };

    loop();
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
