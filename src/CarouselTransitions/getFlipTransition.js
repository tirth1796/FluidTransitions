/* eslint-disable import/prefer-default-export */
import { TransitionSpecification } from '../Types/index';

export const getFlipTransition = (transitionInfo: TransitionSpecification) => {
  const { start, end } = transitionInfo;
  const flipTo = '90deg';
  const flipToSwap = `-${flipTo}`;
  const flipStart = '0deg';

  const flipInterpolation = transitionInfo.progress.interpolate({
    inputRange: [-1, -1 + start, -1 + end, 0, start, end, 1],
    outputRange: [flipTo, flipTo, flipStart, flipStart, flipStart, flipToSwap, flipToSwap],
  });
  return {
    transform: [{ rotateX: flipInterpolation }],
  };
};
