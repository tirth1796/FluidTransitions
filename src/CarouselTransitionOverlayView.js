import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import sortBy from 'lodash.sortby';
import _get from 'lodash/get';

import TransitionItem from './TransitionItem';
import { NavigationDirection, TransitionContext, RouteDirection } from './Types';
import * as Constants from './TransitionConstants';

import { initTransitionTypes, getCarouselTransitionElements } from './CarouselTransitions';
import { initInterpolatorTypes, getSharedElements, getAnchoredElements } from './CarouselInterpolators';

initTransitionTypes();
initInterpolatorTypes();

type Props = {
  fromRoute: string,
  toRoute: string,
  visibility: Animated.Value,
  direction: number,
  index: number,
  sharedElements: Array<any>,
  transitionElements: Array<TransitionItem>
}

const getDirectionRouteName = (routeName, {left, curr, right}) => {
  if(routeName ===left){
    return RouteDirection.left;
  }
  if(routeName === right) {
    return RouteDirection.right;
  }
  if(routeName === curr) {
    return RouteDirection.current;
  }
  return RouteDirection.unknown;
};

class TransitionOverlayView extends React.Component<Props> {
  constructor(props: Props, context) {
    super(props, context);
    this._isMounted = false;
    this.getInterpolation = this.getInterpolation.bind(this);
  }

  _isMounted: boolean;
  _nativeInterpolation: any;
  _interpolation: any;

  render() {
    const routes = _get(this.props.navigation, 'state.routes', []);
    const { getTransitionProgress } = this.context;
    const progress = getTransitionProgress();
    const progressIndex = progress? progress._value : this.props.index;
    const index = this.props.index;
    const rightRoute  = _get(routes, `${index + 1}.routeName`);
    const currentRoute= _get(routes, `${index}.routeName`);
    const leftRoute = _get(routes, `${index - 1}.routeName`);
    const from = this.props.fromRoute;
    const to = this.props.toRoute;
    const transitionElements = this.props.transitionElements ? this.props.transitionElements
      .filter(i => i.route === currentRoute || i.route === leftRoute || i.route === rightRoute) : [];

    const transitionContext = this.getTransitionContext(transitionElements);
    if (!transitionContext || !this.getMetricsReady() ||
      ((this.props.sharedElements || []).length === 0 && transitionElements.length === 0)) {
      return <View style={styles.overlay} pointerEvents="none" />;
    }

    this._interpolation = null;
    this._nativeInterpolation = null;

    const transitionViews = getCarouselTransitionElements(transitionElements, transitionContext, progressIndex, this.props.navigation);
    const sharedElementViews = getSharedElements(this.props.sharedElements, this.getInterpolation, progressIndex, this.props.navigation, getTransitionProgress);

    let views = [...transitionViews, ...sharedElementViews];
    views = sortBy(views, 'props.index');

    return (
      <Animated.View style={[styles.overlay, this.getVisibilityStyle()]} pointerEvents="none">
        {views}
      </Animated.View>
    );
  }

  getVisibilityStyle() {const { getTransitionProgress } = this.context;
    const { index } = this.props;

    if (!getTransitionProgress) return {};
    const progress = getTransitionProgress();
    if (!progress) return { opacity: 0 };

    const inputRange = [index - 1, (index-1) + Constants.OP, (index) - Constants.OP, index, index+Constants.OP, (index+1) - Constants.OP, index+1];
    const outputRange = [0, 1, 1, 0, 1, 1, 0];
    const visibility = progress.interpolate({ inputRange, outputRange });

    return { opacity: visibility };
  }

  getMetricsReady(): boolean {
    let metricsReady = true;
    if (this.props.transitionElements) {
      this.props.transitionElements.forEach(item => {
        if (!item.metrics) {
          metricsReady = false;
        }
      });
    }

    if (this.props.sharedElements) {
      this.props.sharedElements.forEach(pair => {
        if (!pair.toItem.metrics || !pair.fromItem.metrics) {
          metricsReady = false;
        }
        if(pair.fromItem && pair.fromItem.anchors) {
          for(let n = 0; n < pair.fromItem.anchors.length; n++) {
            if(!pair.fromItem.anchors[n].metrics) {
              metricsReady = false;
              break;
            }
          }
        }
        if(pair.toItem && pair.toItem.anchors) {
          for(let n = 0; n < pair.toItem.anchors.length; n++) {
            if(!pair.toItem.anchors[n].metrics) {
              metricsReady = false;
              break;
            }
          }
        }
      });
    }
    return metricsReady;
  }

  getInterpolation(useNativeDriver: boolean, fullRange: boolean, indexToUse) {
    const { getTransitionProgress, getIndex } = this.context;
    if (!getTransitionProgress || !getIndex) return null;

    const index = indexToUse!==undefined?indexToUse : getIndex();
    const inputRange = [index - 1, index, index + 1];
    const outputRange = [fullRange? -1:1, 0, 1];
    if (useNativeDriver && !this._nativeInterpolation) {
      this._nativeInterpolation = getTransitionProgress(true).interpolate({
        inputRange, outputRange,
      });
    } else if (!useNativeDriver && !this._interpolation) {
      this._interpolation = getTransitionProgress(false).interpolate({
        inputRange, outputRange,
      });
    }

    if (useNativeDriver) return this._nativeInterpolation;
    return this._interpolation;
  }

  getTransitionContext(transitionElements): TransitionContext {
    const { getDirectionForRoute, getIndex, getDirection,
      getRoutes, getTransitionProgress } = this.context;

    if (!transitionElements || !getDirectionForRoute || !getDirection ||
      !getRoutes || !getIndex || !getTransitionProgress) {
      return null;
    }
    const index = this.props.index;
    const routes = this.props.navigation.state.routes;
    const rightRoute  = _get(routes, `${index + 1}.routeName`);
    const currentRoute= _get(routes, `${index}.routeName`);
    const leftRoute = _get(routes, `${index - 1}.routeName`);
    const delayCountFrom = transitionElements
      .filter(item => getDirectionForRoute(item.name, item.route) === RouteDirection.from)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const delayCountTo = transitionElements
      .filter(item => getDirectionForRoute(item.name, item.route) === RouteDirection.to)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const delayCountLeft = transitionElements.filter(item => item.route === leftRoute)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const delayCountCurrent = transitionElements.filter(item => item.route === currentRoute)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);

    const delayCountRight = transitionElements.filter(item => item.route === rightRoute)
      .reduce((prevValue, item) => (item.delay ? prevValue + 1 : prevValue), 0);
    const navDirection = getDirection();
    let delayIndexFrom = 0;
    let delayIndexTo = 0;
    const delayFromFactor = 1;
    const delayToFactor = 1;
    const getDirectionForRouteName = (routeName) => getDirectionRouteName(routeName, {left:leftRoute, right: rightRoute, curr: currentRoute});
    return {
      delayCountLeft,
      delayCountCurrent,
      delayCountRight,
      delayIndexCurrent: delayCountCurrent,
      delayIndexRight: delayCountRight,
      delayIndexLeft: 0,
      navDirection,
      delayIndexFrom,
      delayIndexTo,
      delayToFactor,
      delayFromFactor,
      getDirectionForRoute,
      getIndex,
      getTransitionProgress,
      getRoutes,
      currentRoute,
      leftRoute,
      getDirectionForRouteName,
      rightRoute,
      routes: this.props.navigation.state.routes
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static contextTypes = {
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getRoutes: PropTypes.func,
  }
}

const styles: StyleSheet.NamedStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    // backgroundColor: '#FF00AE11',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default TransitionOverlayView;
