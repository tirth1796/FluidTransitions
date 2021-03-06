/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, View, Animated } from 'react-native';
import { createSwipeNavigator, Transition } from 'swipe-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animated: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedElement: {
    width: 150,
    height: 150,
    borderRadius: 0,
  },
  text: {
    margin: 40,
    textAlign: 'center',
  },
});

class SpinningCube extends PureComponent {
  render() {
    if (this.props.progress) {
      const spin = this.props.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['180deg', '0deg', '180deg'],
      });

      const background = this.props.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [this.props.startColor, this.props.endColor],
      });

      const border = this.props.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 75, 0],
      });

      const scale = this.props.progress.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [1, 0.5, 0.5, 1],
      });

      return (
        <View style={styles.animated}>
          <Animated.View style={[styles.animatedElement,
            {
              transform: [{ rotate: spin }, { scale }],
              backgroundColor: background,
              borderRadius: border,
            }]}
          />
        </View>
      );
    }
    return (
      <View style={styles.animated}>
        <Animated.View style={[styles.animatedElement, { backgroundColor: this.props.startColor }]} />
      </View>
    );
  }
}

SpinningCube.propTypes = {
  progress: PropTypes.object,
  startColor: PropTypes.string,
  endColor: PropTypes.string,
};

const Description = () => (
  <Text style={styles.text}>
    This cube is an animated component that contains a property
    that accepts an interpolation, and will interpolate size,
    border and background color when the interpolation changes. It
    is connected to the Transition through its animated property.
  </Text>
);

const Screen1 = () => (
  <View style={styles.container}>
    <Transition animated="progress" shared="square">
      <SpinningCube startColor="#FF0000" endColor="#00FF00" />
    </Transition>
    <Description />
  </View>
);

const Screen2 = () => (
  <View style={styles.container}>
    <Transition animated="progress" shared="square">
      <SpinningCube startColor="#00FF00" endColor="#0000FF" />
    </Transition>
  </View>
);

const Screen3 = () => (
  <View style={styles.container}>
    <Transition animated="progress" shared="square">
      <SpinningCube prevColor="#00FF00" startColor="#0000FF" endColor="#FF0" />
    </Transition>
  </View>
);

const Navigator = createSwipeNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
}, {
  bounceResistance: 1
});

class AnimatedProperty extends React.Component {
  static router = Navigator.router;
  render() {
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

AnimatedProperty.propTypes = {
  navigation: PropTypes.object,
};

export default AnimatedProperty;
