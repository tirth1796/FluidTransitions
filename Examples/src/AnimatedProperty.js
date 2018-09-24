/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet, View, Animated, Button } from 'react-native';
import { createFluidNavigator, Transition } from 'react-navigation-fluid-transitions';

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
  buttonContainer: {
    margin: 40,
    flexDirection: 'row',
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
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
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
        <Animated.View style={[styles.animatedElement,
          {
            backgroundColor: this.props.startColor,
          }]}
        />
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

const Screen1 = props => (
  <View style={styles.container}>
    <Description />
    <Transition animated="progress" shared="square">
      <SpinningCube startColor="#FF0000" endColor="#00FF00" />
    </Transition>
    <Transition appear="horizontal">
      <View style={styles.buttonContainer}>
        <Button title="Next" onPress={() => props.navigation.navigate('screen2')} />
      </View>
    </Transition>
  </View>
);

Screen1.propTypes = {
  navigation: PropTypes.object,
};

const Screen2 = props => (
  <View style={styles.container}>
    <Description />
    <Transition animated="progress" shared="square">
      <SpinningCube startColor="#00FF00" endColor="#0000FF" />
    </Transition>
    <Transition appear="horizontal">
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={() => props.navigation.goBack()} />
        <Button title="Next" onPress={() => props.navigation.navigate('screen3')} />
      </View>
    </Transition>
  </View>
);

Screen2.propTypes = {
  navigation: PropTypes.object,
};

const Screen3 = props => (
  <View style={styles.container}>
    <Description />
    <Transition animated="progress" shared="square">
      <SpinningCube startColor="#0000FF" endColor="#FF0" />
    </Transition>
    <Transition appear="horizontal">
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={() => props.navigation.goBack()} />
      </View>
    </Transition>
  </View>
);

Screen3.propTypes = {
  navigation: PropTypes.object,
};

const Navigator = createFluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
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
