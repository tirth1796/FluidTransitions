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
import * as Constants from './../TransitionConstants';

const screenWidth = Dimensions.get('window').width;

const getIndex = (item, navigation) => {
  const routes = navigation.state.routes;
  const index = _findIndex(routes, (route)=> route.routeName === item.route);
  return index;
}

const getSharedElements = (sharedElements: Array<any>, getInterpolationFunction: Function, index, navigation, getTransitionProgress) => {

  return sharedElements.map((pair, idx) => {
    const { fromItem, toItem } = pair;
    const element = React.Children.only(fromItem.reactElement.props.children);
    const transitionStyles = getTransitionStyle(fromItem, toItem, getInterpolationFunction,index, navigation);

    const key = `so-${idx.toString()}`;
    const animationStyle = transitionStyles.styles;
    const nativeAnimationStyle = [transitionStyles.nativeStyles];
    const opacity = getOpacityStyles(fromItem, toItem, getTransitionProgress,index, navigation);
    const overrideStyles = {
      position: 'absolute',
      // borderColor: '#0000FF',
      // borderWidth: 1,
      left: fromItem.metrics.x  - getHorizontalOffset(fromItem, index, navigation),
      top: fromItem.metrics.y,
      width: fromItem.metrics.width,
      height: fromItem.metrics.height,
      opacity,
    };
    let progress = getInterpolationFunction(false, false, index>=0?index:0);
    if(index === getIndex(toItem, navigation)){
      progress = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0]
      })
    }
    const props = { ...element.props, __index: fromItem.index };
    if(fromItem.animated) {
      props[fromItem.animated] = progress
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

const getOpacityStyles = (fromItem: TransitionItem, toItem: TransitionItem, getTransitionProgress: Function,index, navigation) => {
  const fromItemIndex = getIndex(fromItem, navigation)
  const nativeInterpolator = getTransitionProgress(true);
  const toItemIndex = getIndex(toItem, navigation)
  const isFirstPage = fromItemIndex === 0;
  const isLastPage = toItemIndex === navigation.state.routes.length-1;
  const initialOpacity = isFirstPage? 1 : 0;
  const finalOpacity = isLastPage? 1 : 0;
  return nativeInterpolator.interpolate({
    inputRange: [fromItemIndex,fromItemIndex+Constants.OP, toItemIndex - Constants.OP,toItemIndex],
    outputRange: [initialOpacity,1,1,finalOpacity]
  })
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