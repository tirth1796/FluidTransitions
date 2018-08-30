import React from 'react';
import { Platform } from 'react-native';
import { RouteDirection, TransitionSpecification } from '../../Types/index';

export const getScaleTransition = (transitionInfo: TransitionSpecification) => {
  // When scaling we need to handle Android's scaling issues and not use zero values
  let startPosition = 1;
  let endPosition = 0.005;

  if(Platform.OS === 'ios'){
    startPosition = 1;
    endPosition = 0;
  }

  const { progress, start, end } = transitionInfo;

  const scaleInterpolation = transitionInfo.progress.interpolate({
    inputRange: [-1, -1+start, -1+end, 0, start, end, 1],
    outputRange: [endPosition, endPosition,startPosition, startPosition, startPosition, endPosition, endPosition]
  });
  return { transform: [{ scale: scaleInterpolation }]};
}