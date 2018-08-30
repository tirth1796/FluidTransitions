import { RouteDirection, TransitionSpecification } from '../../Types/index';

export const getVerticalTransition = (transitionInfo: TransitionSpecification) => {
  if (!transitionInfo || transitionInfo.metrics === undefined)
    return {};

  const { start, end, dimensions } = transitionInfo;

  const transitionProgress = transitionInfo.progress.interpolate({
    inputRange: [-1, -1+start, -1+end, 0, start, end, 1],
    outputRange: [-(dimensions.height + 25), -(dimensions.height + 25),0, 0, 0, dimensions.height + 25, dimensions.height + 25]
  });
  return { transform: [{ translateY: transitionProgress }] };
}
