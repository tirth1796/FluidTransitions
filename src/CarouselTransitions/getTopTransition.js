import { TransitionSpecification } from './../Types/TransitionSpecification';

export const getTopTransition = (transitionSpecification: TransitionSpecification) => {
  if(!transitionSpecification || transitionSpecification.metrics === undefined)
    return { };

  const { start, end, boundingbox, dimensions } = transitionSpecification;
  const { y, height } = boundingbox;
  const distanceValue = -(height + y + 25);

  const progress = transitionSpecification.progress.interpolate({
    inputRange: [-1, -1+start, -1+end, 0, start, end, 1],
    outputRange: [distanceValue, distanceValue,0, 0, 0, distanceValue, distanceValue]
  });
  return {			
    transform: [{
      translateY: progress
    }]
  };
}

