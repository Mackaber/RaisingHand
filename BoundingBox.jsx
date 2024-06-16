import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const BoundingBox = ({ predictions }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" viewBox={`0 0 ${screenWidth} ${screenHeight}`}>
        {predictions.map((prediction, index) => {
          const [x, y, width, height] = prediction.bbox;
          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke="red"
                strokeWidth="2"
                fill="none"
              />
              <SvgText
                x={x}
                y={y - 10}
                fill="red"
                fontSize="40"
                fontWeight="bold"
              >
                {prediction.class} ({(prediction.score * 100).toFixed(2)}%)
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default BoundingBox;
