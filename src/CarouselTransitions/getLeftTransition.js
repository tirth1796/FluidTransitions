/* eslint-disable import/prefer-default-export */
import { Dimensions } from 'react-native';
import { TransitionSpecification } from '../Types/TransitionSpecification';

const screenWidth = Dimensions.get('window').width;

export const getLeftTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) { return {}; }

  const { start, end, boundingbox } = transitionSpecification;
  const { x, width } = boundingbox;
  const distanceValue = -(width + x + 25);
  const progress = transitionSpecification.progress.interpolate({
    inputRange: [-1, -1 + start, -1 + end, 0, start, end, 1],
    outputRange: [distanceValue, distanceValue, 0, 0, 0, 2 * (distanceValue - screenWidth), 2 * (distanceValue - screenWidth)],
  });

  return {
    transform: [{ translateX: progress }],
  };
};
