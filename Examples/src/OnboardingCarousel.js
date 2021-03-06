import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

import { Transition, createSwipeNavigator } from 'swipe-transitions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  text: {
    textAlign: 'center',
  },
  textBold: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
  },
  circlesContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  figureContainer: {
    margin: 14
  },
});

const Circle = props => (
  <View
    style={[styles.figureContainer, {
      backgroundColor: props.background,
      width: props.size,
      height: props.size,
      borderRadius: props.size / 2
    }]}
  />
);

Circle.propTypes = {
  background: PropTypes.string,
  size: PropTypes.number,
};

const Square = props => (
  <View style={[styles.figureContainer, {
    backgroundColor: props.background,
    width: props.size,
    height: props.size,
  }]}
  />
);

Square.propTypes = {
  background: PropTypes.string,
  size: PropTypes.number,
};

const topColors = {
  screen1: '#AA3939',
  screen2: '#2E4272',
  screen3: '#88CC88',
};

// registerTransitionType('scale', getScaleTransition);
// registerTransitionType('top', getTopTransition);
// registerTransitionType('bottom', getBottomTransition);
// registerTransitionType('left', getLeftTransition);
// registerTransitionType('right', getRightTransition);
// registerTransitionType('horizontal', getHorizontalTransition);
// registerTransitionType('vertical', getVerticalTransition);
// registerTransitionType('flip', getFlipTransition);
// registerTransitionType('none', ()=> ({}));

const Screen1 = () => (
  <View style={styles.container}>
    <View style={[styles.top, { backgroundColor: topColors.screen1 }]}>
      <Transition appear="left">
        <Circle background="#D46A6A" size={140} />
      </Transition>
      <View style={styles.circlesContainer}>
        <Transition appear="horizontal" delay>
          <Circle background="#550000" size={40} />
        </Transition>
        <Transition appear="horizontal" delay>
          <Circle background="#550000" size={40} />
        </Transition>
        <Transition appear="horizontal" delay>
          <Circle background="#550000" size={40} />
        </Transition>
      </View>
    </View>
    <View style={styles.content}>
      <Transition appear="horizontal">
        <View>
          <Text style={styles.textBold}>Welcome to this demo!</Text>
          <Text style={styles.text}>
            It shows you how to build some cool transitions to use
            in your onboarding screens.
          </Text>
        </View>
      </Transition>
    </View>
  </View>
);

const Screen2 = () => (
  <View style={styles.container}>
    <View style={[styles.top, { backgroundColor: topColors.screen2 }]}>
      <Transition appear="horizontal">
        <Square background="#4F628E" size={140} />
      </Transition>
      <View style={styles.circlesContainer}>
        <Transition appear="scale" delay>
          <Square background="#061539" size={40} />
        </Transition>
        <Transition appear="scale" delay>
          <Square background="#061539" size={40} />
        </Transition>
        <Transition appear="scale" delay>
          <Square background="#061539" size={40} />
        </Transition>
      </View>
    </View>
    <View style={styles.content}>
      <Transition appear="horizontal">
        <View>
          <Text style={styles.textBold}>This is the second page</Text>
          <Text style={styles.text}>
            Here are some more individual transitions!
          </Text>
        </View>
      </Transition>
    </View>
  </View>
);

const Screen3 = () => (
  <View style={styles.container}>
    <View style={[styles.top, { backgroundColor: topColors.screen3 }]}>
      <Transition appear="horizontal">
        <Circle background="#2D882D" size={140} />
      </Transition>
      <View style={styles.circlesContainer}>
        <Transition appear="top" delay>
          <Circle background="#550000" size={40} />
        </Transition>
        <Transition appear="top" delay>
          <Circle background="#550000" size={40} />
        </Transition>
        <Transition appear="top" delay>
          <Circle background="#550000" size={40} />
        </Transition>
      </View>
    </View>
    <View style={styles.content}>
      <Transition appear="horizontal">
        <View>
          <Text style={styles.textBold}>This is the last page</Text>
          <Text style={styles.text}>Navigate back to see the reversed transitions.</Text>
        </View>
      </Transition>
    </View>
  </View>
);

const Navigator = createSwipeNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
});

class Onboarding extends React.Component {
  static router = Navigator.router;
  render() {
    return (
      <Navigator navigation={this.props.navigation} />
    );
  }
}

Onboarding.propTypes = {
  navigation: PropTypes.object,
};

export default Onboarding;
