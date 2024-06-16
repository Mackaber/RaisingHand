// utils.js
export const scalePredictions = (predictions, screenWidth, screenHeight, modelWidth, modelHeight) => {
  const scaleFactorWidth = screenWidth / modelWidth;
  const scaleFactorHeight = screenHeight / modelHeight;

  return predictions.map(pred => ({
    ...pred,
    bbox: [
      pred.bbox[0] * scaleFactorWidth,
      pred.bbox[1] * scaleFactorHeight,
      pred.bbox[2] * scaleFactorWidth,
      pred.bbox[3] * scaleFactorHeight,
    ],
  }));
};
