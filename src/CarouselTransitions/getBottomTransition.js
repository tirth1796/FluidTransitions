import { TransitionSpecification } from '../Types/TransitionSpecification';

export const getBottomTransition = (transitionSpecification: TransitionSpecification) => {
  if (!transitionSpecification || transitionSpecification.metrics === undefined) {
    return {};
  }
  const {
    start, end, boundingbox, dimensions
  } = transitionSpecification;
  const { y } = boundingbox;
  const distanceValue = dimensions.height - (y + 25);

  const progress = transitionSpecification.progress.interpolate({
    inputRange: [-1, -1 + start, -1 + end, 0, start, end, 1],
    outputRange: [distanceValue, distanceValue, 0, 0, 0, distanceValue, distanceValue],
  });

  return { transform: [{ translateY: progress }] };
};
