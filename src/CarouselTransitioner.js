import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Platform, Easing, I18nManager, Animated, Dimensions, PanResponder, InteractionManager } from 'react-native';
import { NavigationActions, Transitioner } from 'react-navigation';
import clamp from 'clamp';

import _isEqual from 'lodash/isEqual';

import CarouselTransitionItemsView from "./CarouselTransitionItemsView";
import TransitionRouteView from './TransitionRouteView';

const emptyFunction = () => {};

const ANIMATION_DURATION = 500;
const POSITION_THRESHOLD = 0.4;
const RESPOND_THRESHOLD = 20;

const screenWidth = Dimensions.get('window').width
type SceneRenderedInfo = {
  key: string,
  isMounted: boolean,
};

class FluidTransitioner extends React.Component<*> {
  constructor(props) {
    super(props);

    this._onTransitionStart = this._onTransitionStart.bind(this);
    this._onSceneReady = this._onSceneReady.bind(this);
    this._transitionItemsViewOnLayout = this._transitionItemsViewOnLayout.bind(this);
    this._configureTransition = this._configureTransition.bind(this);
    this._getSceneTransitionConfiguration = this._getSceneTransitionConfiguration.bind(this);

    this._scenesReadyPromise = new Promise(resolve =>
      this._scenesReadyResolveFunc = resolve);
  }
  _animations = [];
  _scenes: Array<SceneRenderedInfo> = [];
  _scenesReadyResolveFunc: ?Function;
  _scenesReadyPromise: ?Promise<void>;
  _layoutsReady: boolean;
  _gestureStartValue = 0;
  _isResponding = false;
  _panResponder = null;

  oldProps = {};
  transitioner = null;

  static childContextTypes = {
    route: PropTypes.string,
    getTransitionConfig: PropTypes.func,
    onSceneReady: PropTypes.func,
  }

  _animatedSubscribeForNativeAnimation(animatedValue: Animated.Value) {
    if (!animatedValue) return;
    if (!this._configureTransition().useNativeDriver) return;
    if (Object.keys(animatedValue._listeners).length === 0) {
      animatedValue.addListener(emptyFunction);
    }
  }

  getChildContext() {
    return {
      route: this.props.navigation.state.routes[
        this.props.navigation.state.index].routeName,
      onSceneReady: this._onSceneReady,
      getTransitionConfig: this._getSceneTransitionConfiguration,
    };
  }

  render() {
    return (
      <Transitioner
        configureTransition={this._configureTransition}
        render={this._render.bind(this)}
        navigation={this.props.navigation}
        descriptors={this.props.descriptors}
        onTransitionStart={this._onTransitionStart}
      />
    );
  }

  _transitionItemsViewOnLayout() {
    this._layoutsReady = true;
    this._checkScenesAndLayouts();
  }

  _onSceneReady(key: string) {
    if (!this._scenesReadyResolveFunc) { return; }
    // check if this is a scene we are waiting for
    const sceneRenderInfo = this._scenes.find(sri => sri.key === key);
    if (sceneRenderInfo) sceneRenderInfo.isMounted = true;
    this._checkScenesAndLayouts();
  }

  _checkScenesAndLayouts() {
    if (this._layoutsReady && !this._scenes.find(sri => !sri.isMounted)) {
      if (this._scenesReadyResolveFunc) {
        this._scenesReadyResolveFunc();

        this._scenesReadyPromise = new Promise(resolve =>
          this._scenesReadyResolveFunc = resolve);
      }
    }
  }

  _onTransitionStart(): Promise<void> | void {
    if (this._scenesReadyPromise) {
      return this._scenesReadyPromise;
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps;
  }

  _configureTransition(props, prevProps) {
    let sceneTransitionConfig = {};
    if (props) {
      let moveForward = true;
      if (prevProps && prevProps.index > props.index) {
        moveForward = false;
      }
      const { scene } = moveForward ? props : prevProps;
      const { options } = scene.descriptor;
      if (options && options.transitionConfig) {
        sceneTransitionConfig = options.transitionConfig;
      }
    }
    return {
      timing: Animated.timing,
      duration: 650,
      easing: Easing.inOut(Easing.poly(4)),
      ...this.props.transitionConfig,
      ...sceneTransitionConfig,
      isInteraction: true,
      useNativeDriver: true,
    };
  }

  _reset(position, resetToIndex, duration) {
    const animation = Animated.timing(position, {
      toValue: resetToIndex,
      duration,
      easing: Easing.EaseInOut,
      useNativeDriver: position.__isNative,
    });
    animation.start()
    this._animations.push(animation);
  }

  _goBack(navigation, position, scenes, backFromIndex, duration, resetConfig) {
    if (this.props.navigation.state.index === 0) {
      this._reset(...resetConfig);
      return;
    }

    const toValue = this.props.navigation.state.index - 1;

    const animation = Animated.timing(position, {
      toValue,
      duration,
      easing: Easing.EaseInOut,
      useNativeDriver: position.__isNative,
    });
    animation.start(({finished}) => {
      if(finished){
        const backFromScene = scenes.find(s => s.index === (toValue));
        if (!this._isResponding && backFromScene) {
          this.props.navigation.navigate(
            this.props.navigation.state.routes[toValue].routeName,
          )
        }
      }
    });
    this._animations.push(animation);
  }

  _goNext(navigation, position, scenes, backFromIndex, duration, resetConfig) {
    if (this.props.navigation.state.routes.length <= this.props.navigation.state.index + 1) {
      this._reset(...resetConfig);
      return;
    }
    const toValue = this.props.navigation.state.index + 1;

    const animation = Animated.timing(position, {
      toValue,
      duration,
      easing: Easing.EaseInOut,
      useNativeDriver: position.__isNative,
    })
    animation.start(({finished}) => {
      if(finished){
        const nextScenePresent = scenes.find(s => s.index === toValue);
        if (!this._isResponding && nextScenePresent) {
          this.props.navigation.navigate(
            this.props.navigation.state.routes[toValue].routeName,
          )
        }
      }
    });
    this._animations.push(animation);
  }

  _render(props) {
    if(_isEqual(props, this.oldProps)){
      return this.transitioner;
    }
    this.oldProps = props;
    this._layoutsReady = false;
    const { position } = props;
    const { scene, layout } = props;
    const { navigation } = scene.descriptor;

    this._animatedSubscribeForNativeAnimation(props.position);
    this._updateSceneArray(props.scenes);

    let { index } = props.scene;
    let toRoute = props.scene.route.routeName;
    let fromRoute = index > 0 ? props.scenes[index-1].route.routeName : null;


    const handlers = this.getPanResponderHandlers(position, index,
      scene, layout, navigation, props);

    const scenes = props.scenes.map(scene => this._renderScene({ ...props, scene }));

    this.transitioner = (<CarouselTransitionItemsView
      {...handlers}
      navigation={this.props.navigation}
      style={this.props.style}
      progress={props.position}
      fromRoute={fromRoute}
      toRoute={toRoute}
      index={index}
      onLayout={this._transitionItemsViewOnLayout}
    >
      {scenes}
    </CarouselTransitionItemsView>)
    return (
      this.transitioner
    );
  }

  getPanResponderHandlers(position, index, scene, layout, navigation, props) {
    const { mode = 'card' } = this.props;
    const isVertical = mode !== 'card';
    const { options } = scene.descriptor;
    const gestureDirectionInverted = options.gestureDirection === 'inverted';
    if(this._panResponder) {
      const handle = this._panResponder.getInteractionHandle();
      if(handle)
        InteractionManager.clearInteractionHandle(handle);
    }
    this._panResponder = PanResponder.create({
        onPanResponderTerminate: () => {
          this._isResponding = false;
          this._reset(position, index, 0);
        },
        onPanResponderGrant: () => {
          position.stopAnimation(value => {
            this._isResponding = true;
            this._gestureStartValue = value;
            this._animations.forEach((animation)=>{
              animation.stop();
            });
            this._animations = [];
          });
        },
        onMoveShouldSetPanResponder: (event, gesture) => {
          if(!this._layoutsReady){
            return false;
          }
          if (index !== scene.index) {
            return false;
          }
          const currentDragDistance = gesture[isVertical ? 'dy' : 'dx'];
          const axisLength = isVertical
            ? layout.height.__getValue()
            : layout.width.__getValue();
          const axisHasBeenMeasured = !!axisLength;
          const hasDraggedEnough = Math.abs(currentDragDistance) > RESPOND_THRESHOLD;
          const shouldSetResponder = hasDraggedEnough && axisHasBeenMeasured;
          return shouldSetResponder;
        },
        onPanResponderMove: (event, gesture) => {
          const startValue = this._gestureStartValue;
          const axis = isVertical ? 'dy' : 'dx';
          const axisDistance = isVertical
            ? layout.height.__getValue() * 0.75
            : layout.width.__getValue();
          const currentValue = (I18nManager.isRTL && axis === 'dx') !== gestureDirectionInverted
            ? startValue + gesture[axis] / axisDistance
            : startValue - gesture[axis] / axisDistance;
          const value = clamp(index-1, currentValue, index+1);
          position.setValue(value);
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (event, gesture) => {
          if (!this._isResponding) {
            return;
          }
          this._isResponding = false;
          const axisDistance = isVertical ? layout.height.__getValue() : layout.width.__getValue();
          const movementDirection = gestureDirectionInverted ? -1 : 1;
          const movedDistance = Math.abs(movementDirection * gesture[isVertical ? 'dy' : 'dx']);
          const gestureVelocity = movementDirection * gesture[isVertical ? 'vy' : 'vx'];
          const defaultVelocity = axisDistance / ANIMATION_DURATION;

          const velocity = Math.max(Math.abs(gestureVelocity), defaultVelocity);

          const resetDuration = gestureDirectionInverted ? (axisDistance - movedDistance) / velocity : movedDistance / velocity;

          const goBackDuration = gestureDirectionInverted ? movedDistance / velocity : (axisDistance - movedDistance) / velocity;

          const goNextDuration = gestureDirectionInverted ? -movedDistance / velocity : (axisDistance + movedDistance) / velocity;
          position.stopAnimation(value => {
            if (gestureVelocity > 0.5) {
              this._goBack(navigation, position, props.scenes, index, goBackDuration, [position, index, resetDuration]);

              return;
            }
            if (gestureVelocity < -0.5) {
              this._goNext(navigation, position, props.scenes, index, goNextDuration, [position, index, resetDuration]);

              return;
            }
            if (value <= index-POSITION_THRESHOLD) {
              this._goBack(navigation, position, props.scenes, index, goBackDuration, [position, index, resetDuration]);
              return;
            }
            if (value >= index+POSITION_THRESHOLD) {
              this._goNext(navigation, position, props.scenes, index, goNextDuration, [position, index, resetDuration]);
              return;
            }
            this._reset(position, index, resetDuration);

          });
        },
      });
    return this._panResponder.panHandlers;
  }

  _renderScene(transitionProps) {
    const { scene, scenes } = transitionProps;
    const { index } = scene;
    const { navigation } = scene.descriptor;
    const SceneView = scene.descriptor.getComponent();

    return (
      <TransitionRouteView
        style={[styles.scene, this.getAnimatingStyle(transitionProps.position, index, scenes.length)]}
        key={transitionProps.scene.route.key}
        route={scene.route.routeName}
        sceneKey={scene.key}
      >
        <SceneView
          navigation={navigation}
          screenProps={this.props.screenProps}
        />
      </TransitionRouteView>
    );
  }

  getAnimatingStyle(position: Animated.Value, index: number, numberOfScreens) {
    return {
      opacity: position.interpolate({
        inputRange: [index - 1, index, index + 1],
        outputRange: [1, 1, 1],
      }),
      transform: [{
        translateX: position.interpolate({
          inputRange: [-1, numberOfScreens],
          outputRange: [screenWidth * (index + 1), screenWidth*(index - numberOfScreens)],
        })
      }]
    };
  }

  _updateSceneArray(scenes: Array<any>) {
    scenes.forEach(scene => {
      if (!this._scenes.find(sri => sri.key === scene.key)) {
        this._scenes = [...this._scenes, { key: scene.key, isMounted: false }];
      }
    });

    const toDelete = [];
    this._scenes.forEach(sri => {
      if (!scenes.find(scene => scene.key === sri.key)) { toDelete.push(sri); }
    });

    toDelete.forEach(sri => {
      const index = this._scenes.indexOf(sri);
      this._scenes = [...this._scenes.slice(0, index), ...this._scenes.slice(index + 1)];
    });
  }

  _getSceneTransitionConfiguration(routeName: string, navigation: any) {
    const route = navigation.state;
    const descriptor = this.props.descriptors;
    const props = { navigation, scene: { route, descriptor } };
    return this._configureTransition(props);
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scene: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sceneContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FluidTransitioner;
