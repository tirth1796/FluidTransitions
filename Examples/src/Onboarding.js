import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Button, StyleSheet } from 'react-native';

import { FluidNavigator, Transition } from 'react-navigation-fluid-transitions';

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
  footer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 16,
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

const Screen1 = props => (
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
    <View style={styles.footer}>
      <Transition appear="horizontal">
        <Button title="Next" onPress={() => props.navigation.navigate('screen2')} />
      </Transition>
    </View>
  </View>
);

Screen1.propTypes = {
  navigation: PropTypes.object,
};

const Screen2 = props => (
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
    <View style={styles.footer}>
      <Transition appear="horizontal">
        <Button title="Back" onPress={() => props.navigation.goBack()} />
      </Transition>
      <Transition appear="horizontal">
        <Button title="Next" onPress={() => props.navigation.navigate('screen3')} />
      </Transition>
    </View>
  </View>
);

Screen2.propTypes = {
  navigation: PropTypes.object,
};

const Screen3 = props => (
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
    <View style={styles.footer}>
      <Transition appear="horizontal">
        <Button title="Back" onPress={() => props.navigation.goBack()} />
      </Transition>
    </View>
  </View>
);

Screen3.propTypes = {
  navigation: PropTypes.object,
};

const Navigator = FluidNavigator({
  screen1: { screen: Screen1 },
  screen2: { screen: Screen2 },
  screen3: { screen: Screen3 },
}, {
  mode: 'card',
  navigationOptions: {
    gesturesEnabled: true,
  },
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

