import React from 'react';
import {
  SwitchRouter,
  NavigationActions,
  createNavigationContainer,
  createNavigator,
  StackActions
} from 'react-navigation';

import CarouselTransitioner from './CarouselTransitioner';

export default (routeConfigMap, stackConfig = {}) => {

  console.log(routeConfigMap, stackConfig)
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

  class FluidNavigationView extends React.Component {
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
            const {onTransitionEnd, navigation} = this.props;
            if (
              transition.navigation.state.isTransitioning &&
              !lastTransition.navigation.state.isTransitioning
            ) {
              navigation.dispatch(
                StackActions.completeTransition({
                  key: navigation.state.key,
                })
              );
            }
            onTransitionEnd && onTransitionEnd(transition, lastTransition);
          }}
        />
      );
    }
  }

  const router = SwitchRouter(routeConfigMap, stackRouterConfig);
  const Navigator = createNavigator(FluidNavigationView, router, stackConfig);
  return createNavigationContainer(Navigator);
};
