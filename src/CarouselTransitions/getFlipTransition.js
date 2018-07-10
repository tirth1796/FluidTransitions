import React from 'react';
import { Platform } from 'react-native';
import { RouteDirection, TransitionSpecification } from './../Types';

export const getFlipTransition = (transitionInfo: TransitionSpecification) => {
  const { progress, start, end, direction } = transitionInfo;
  const flipTo = '90deg';
  const flipToSwap = '-' + flipTo;
  const flipStart = '0deg';

  const flipInterpolation = transitionInfo.progress.interpolate({
    inputRange: [-1, -1+start, -1+end, 0, start, end, 1],
    outputRange: [flipTo, flipTo,flipStart, flipStart, flipStart, flipToSwap, flipToSwap]
  });
  return { 
    transform: [{ rotateX: flipInterpolation }],    
  };
}