/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import { createStackNavigator } from 'react-navigation';

import HomeScreen from './src/HomeScreen';
import Onboarding from './src/Onboarding';
import OnboardingCarousel from './src/OnboardingCarousel';
import AnimatedProperty from './src/AnimatedProperty';
import AnimatedPropertyCarousel from './src/AnimatedPropertyCarousel';

const ExampleNavigator = createStackNavigator({
  home: { screen: HomeScreen, navigationOptions: { title: 'Fluid Transitions' } },
  onboarding: { screen: Onboarding },
  onboardingC: { screen: OnboardingCarousel },
  animatedProperty: { screen: AnimatedProperty },
  animatedPropertyC: { screen: AnimatedPropertyCarousel },
});

const MyApp = () => (
  <ExampleNavigator />
);

export default MyApp;
