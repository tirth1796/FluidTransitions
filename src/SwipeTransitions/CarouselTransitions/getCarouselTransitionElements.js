import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import _findIndex from 'lodash/findIndex';

import { createAnimatedWrapper } from '../../Utils/createAnimatedWrapper';
import { getTransitionType } from './TransitionTypes';
import * as Constants from '../../TransitionConstants';
import {
  TransitionContext,
  RouteDirection,
  NavigationDirection,
  TransitionSpecification,
} from '../../Types/index';

const screenWidth = Dimensions.get('window').width;

const getDelays = (routeDirection, transitionContext) => {
  let delayCount = 0 , delayIndex = 0;
  switch (routeDirection){
    case RouteDirection.current: {
      delayCount = transitionContext.delayCountCurrent;
      delayIndex = transitionContext.delayIndexCurrent;
      break;
    }
    case RouteDirection.left: {
      delayCount = transitionContext.delayCountLeft;
      delayIndex = transitionContext.delayIndexLeft;
      break;
    }
    case RouteDirection.right: {
      delayCount = transitionContext.delayCountRight;
      delayIndex = transitionContext.delayIndexRight;
      break;
    }
    default:
  }
  return {delayCount: delayCount + 1, delayIndex: delayIndex};
}

const getCarouselTransitionElements = (transitionElements: Array<TransitionItem>, transitionContext: TransitionContext, currentIndex, navigation) => {
  return transitionElements.map((item, idx) => {
    const routeDirection = transitionContext.getDirectionForRouteName(item.route);
    let element = React.Children.only(item.reactElement.props.children);
    const key = `ti-${idx.toString()}`;
    const {delayCount, delayIndex} = getDelays(routeDirection, transitionContext);

    const transitionStyle = getPositionStyle(item, delayCount, delayIndex, transitionContext, currentIndex, navigation);

    const style = [transitionStyle, styles.transitionElement];
    const props = { ...element.props, __index: item.index };
    element = React.createElement(element.type, { ...props, key });
    const comp = createAnimatedWrapper({component: element, nativeStyles: style});

    if (item.delay) {
      if (routeDirection === RouteDirection.left) {
        transitionContext.delayIndexLeft += transitionContext.delayFromFactor;
      } else if(routeDirection === RouteDirection.right) {
        transitionContext.delayIndexRight += transitionContext.delayToFactor;
      } else {
        transitionContext.delayIndexCurrent += transitionContext.delayToFactor;
      }
    }
    return comp;
  });
}

const getIndex = (item, navigation) => {
  const routes = navigation.state.routes;
  const index = _findIndex(routes, (route)=> route.routeName === item.route);
  return index;
}

const getPositionStyle = (item: TransitionItem, delayCount: number, delayIndex: number, transitionContext: TransitionContext, currentIndex, navigation) => {
  return {
    // borderWidth: 1,
    // borderColor: '#00FFFF',
    left: item.metrics.x - screenWidth * (getIndex(item, navigation) - currentIndex),
    top: item.metrics.y,
    width: item.metrics.width,
    height: item.metrics.height,
    ...getTransitionStyle(item, delayCount, delayIndex, transitionContext, currentIndex, navigation),
  };
}

const getTransitionStyle = (item: TransitionItem, delayCount: number, delayIndex: number, transitionContext: TransitionContext, currentIndex, navigation) => {
  // const index = transitionContext.getIndex();
  const progress = transitionContext.getTransitionProgress();
  const routeDirection = transitionContext.getDirectionForRoute(item.name, item.route);

  // const routes = transitionContext.getRoutes();
  // const xDirection = currentIndex === index ? RouteDirection.current : (index < currentIndex ? RouteDirection.right: RouteDirection.left);
  if (progress) {
    const transitionFunction = getTransitionFunction(item);
    if (transitionFunction) {
      let start = Constants.TRANSITION_PROGRESS_START;
      let end = Constants.TRANSITION_PROGRESS_END;

      let distance = 0.5;

      if(typeof item.delay === 'number' && item.delay>0 && item.delay<1){
        start=item.delay;
      } else if (item.delay) {
        const delayStep = distance / delayCount;
        start += (delayStep * delayIndex);
      }

      const xIndex = getIndex(item, navigation);
      const interpolatedProgress = progress.interpolate({
        inputRange: [xIndex - 1, xIndex, xIndex + 1],
        outputRange: [-1, 0, 1],
      });

      const transitionSpecification: TransitionSpecification = {
        progress: interpolatedProgress,
        name: item.name,
        route: item.route,
        metrics: item.metrics,
        boundingbox: item.boundingBoxMetrics,
        direction: routeDirection,
        dimensions: Dimensions.get('window'),
        start,
        end,
      };

      return transitionFunction(transitionSpecification);
    }
  }
  return {};
}

const getTransitionFunction = (item: TransitionItem) => {
  const getTransition = (transition: string | Function) => {
    if (transition instanceof Function) { return transition; }
    return getTransitionType(transition);
  };

  if (item.appear) {
    return getTransition(item.appear);
  }
  return null;
}

const styles = StyleSheet.create({
  transitionElement: {
    // borderColor: '#00F',
    // borderWidth: 1,
    position: 'absolute',
    margin: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginStart: 0,
    marginEnd: 0,
  },
});

export { getCarouselTransitionElements };