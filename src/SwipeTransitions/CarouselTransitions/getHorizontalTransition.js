import { RouteDirection, TransitionSpecification } from '../../Types/index';

export const getHorizontalTransition = (transitionInfo: TransitionSpecification) => {
  if (!transitionInfo || transitionInfo.metrics === undefined)
    return {};

  const { start, end, boundingbox, dimensions } = transitionInfo;

  const transitionProgress = transitionInfo.progress.interpolate({
    inputRange: [-1, -1+start, -1+end, 0, start, end, 1],
    outputRange: [dimensions.width + 25, dimensions.width + 25, 0, 0, 0, -(dimensions.width + 25),-(dimensions.width + 25)]
  });
  // inputRange: [-1, 0, 1],
  // outputRange: [dimensions.width + 25, 0,-(dimensions.width + 25)]
  // const transitionProgress = transitionInfo.progress.interpolate({
  //   inputRange: [-1, 0, 1],
  //   outputRange: [dimensions.width + 25, 0, -(dimensions.width + 25)]
  // });

  return { transform: [{ translateX: transitionProgress }] };
}

