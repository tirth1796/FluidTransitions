import React from 'react';
import PropTypes from 'prop-types';
import {
  SwitchRouter,
  createNavigationContainer,
  createNavigator,
  StackActions,
} from 'react-navigation';

import CarouselTransitioner from './CarouselTransitioner';

export default (routeConfigMap, stackConfig = {}) => {
  const {
    initialRouteName,
    initialRouteParams,
    paths,
    mode,
    transitionConfig,
    onTransitionStart,
    onTransitionEnd,
    navigationOptions,
    style,
    ...transitionerProps
  } = stackConfig;

  const stackRouterConfig = {
    initialRouteName,
    initialRouteParams,
    paths,
    navigationOptions,
  };

  class FluidNavigationView extends React.PureComponent {
    render() {
      return (
        <CarouselTransitioner
          transitionerProps={transitionerProps}
          mode={mode}
          style={style}
          navigation={this.props.navigation}
          screenProps={this.props.screenProps}
          descriptors={this.props.descriptors}
          transitionConfig={transitionConfig}
          onTransitionStart={this.props.onTransitionStart}
          onTransitionEnd={(transition, lastTransition) => {
            const { onTransitionEnd: onEndTransition, navigation } = this.props;
            if (
              transition.navigation.state.isTransitioning &&
              !lastTransition.navigation.state.isTransitioning
            ) {
              navigation.dispatch(StackActions.completeTransition({
                key: navigation.state.key,
              }));
            }
            if (onEndTransition) {
              onEndTransition(transition, lastTransition);
            }
          }}
        />
      );
    }
  }

  FluidNavigationView.propTypes = {
    navigation: PropTypes.object,
    screenProps: PropTypes.object,
    descriptors: PropTypes.object,
    onTransitionStart: PropTypes.func,
    onTransitionEnd: PropTypes.func,
  };


  const router = SwitchRouter(routeConfigMap, stackRouterConfig);
  const Navigator = createNavigator(FluidNavigationView, router, stackConfig);
  return createNavigationContainer(Navigator);
};
