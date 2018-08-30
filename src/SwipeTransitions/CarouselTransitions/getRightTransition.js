import { TransitionSpecification } from '../../Types/TransitionSpecification';
import {Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const getRightTransition = (transitionSpecification: TransitionSpecification) => {
  if(!transitionSpecification || transitionSpecification.metrics === undefined)
    return { };

  const { start, end, boundingbox, dimensions } = transitionSpecification;
  const { x, width } = boundingbox;
  const distanceValue = dimensions.width-(x - 25);
  const progress = transitionSpecification.progress.interpolate({
    inputRange: [-1, -1+start, -1+end, 0, start, end, 1],
    outputRange: [2 * (distanceValue + screenWidth), 2 * (distanceValue + screenWidth),0, 0, 0, (distanceValue + screenWidth), (distanceValue + screenWidth)]
  });

  return {
    transform: [{
      translateX: progress
    }]
  };
}

