import React from 'react';
import { Dimensions } from 'react-native';

import TransitionItem from './../TransitionItem';
import { createAnimatedWrapper, createAnimated, mergeStyles } from './../Utils';
import {
  TransitionContext,
  NavigationDirection,
  InterpolatorSpecification,
  InterpolatorResult,
} from './../Types';

import { getInterpolatorTypes } from './InterpolatorTypes';
import _findIndex from 'lodash/findIndex';

const screenWidth = Dimensions.get('window').width;

const getIndex = (item, navigation) => {
  const routes = navigation.state.routes;
  const index = _findIndex(routes, (route)=> route.routeName === item.route);
  return index;
}

const getSharedElements = (sharedElements: Array<any>, getInterpolationFunction: Function, index, navigation) => {
  
  return sharedElements.map((pair, idx) => {
    const { fromItem, toItem } = pair;
    const element = React.Children.only(fromItem.reactElement.props.children);
    const transitionStyles = getTransitionStyle(fromItem, toItem, getInterpolationFunction,index, navigation);

    const key = `so-${idx.toString()}`;
    const animationStyle = transitionStyles.styles;
    const nativeAnimationStyle = [transitionStyles.nativeStyles];
    const overrideStyles = {
      position: 'absolute',
      // borderColor: '#0000FF',
      // borderWidth: 1, 
      left: fromItem.metrics.x  - getHorizontalOffset(fromItem, index, navigation),
      top: fromItem.metrics.y,
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
    };

    const props = { ...element.props, __index: fromItem.index };
    if(fromItem.animated) {
      props[fromItem.animated] = getInterpolationFunction(false)
    }

    const component = React.createElement(element.type, { ...props, key });

    return createAnimatedWrapper({
      component,
      nativeStyles: nativeAnimationStyle,
      styles: animationStyle,
      overrideStyles,
      log: true,
      logPrefix: 'SE: ' + fromItem.name + '/' + fromItem.route,
    });
  });
}

const getHorizontalOffset = (item, index, navigation) => {
  const offset = screenWidth * (getIndex(item, navigation) - index )
  return offset;
}

const getTransitionStyle = (
  fromItem: TransitionItem, toItem: TransitionItem, getInterpolationFunction: Function,index, navigation) => {
  const interpolatorInfo: InterpolatorSpecification = {
    from: {
      metrics: {...fromItem.metrics, x: fromItem.metrics.x  - getHorizontalOffset(fromItem, index, navigation)},
      boundingbox: {...fromItem.boundingBoxMetrics, x: fromItem.boundingBoxMetrics.x  - getHorizontalOffset(fromItem, index, navigation)},
      style: fromItem.getFlattenedStyle()
    },
    to: {
      metrics: {...toItem.metrics, x: toItem.metrics.x  - getHorizontalOffset(toItem, index, navigation)},
      style: toItem.getFlattenedStyle(),
      boundingbox: {...toItem.boundingBoxMetrics, x: toItem.boundingBoxMetrics.x  - getHorizontalOffset(toItem, index, navigation)},
    },
    scaleX: toItem.scaleRelativeTo(fromItem).x,
    scaleY: toItem.scaleRelativeTo(fromItem).y,
    getInterpolation: getInterpolationFunction,
    dimensions: Dimensions.get('window'),
  };

  const nativeStyles = [];
  const styles = [];

  getInterpolatorTypes().forEach(interpolator => {
    const interpolatorResult = interpolator.interpolatorFunction(interpolatorInfo);
    if (interpolatorResult) {
      if (interpolatorResult.nativeAnimationStyles)
        {nativeStyles.push(interpolatorResult.nativeAnimationStyles);}
      if (interpolatorResult.animationStyles)
        {styles.push(interpolatorResult.animationStyles);}
    }
  });

  return {
    nativeStyles: {
      ...mergeStyles(nativeStyles),
    },
    styles: {
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      ...mergeStyles(styles),
    },
  };
}

export { getSharedElements }