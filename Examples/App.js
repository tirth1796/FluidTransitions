/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import { createStackNavigator } from 'react-navigation';

import HomeScreen from './src/HomeScreen';
import SharedElements from './src/SharedElements';
import AppearingElements from './src/AppearingElements';
import ImageTransition from './src/ImageTransition';
import LayoutTransition from './src/LayoutTransition';
import Onboarding from './src/Onboarding';
import OnboardingCarousel from './src/OnboardingCarousel';
import ShoeShop from './src/ShoeShop';
import FlatList from './src/FlatList';
import AnimatedProperty from './src/AnimatedProperty';
import AnimatedPropertyCarousel from './src/AnimatedPropertyCarousel';
import Playground from './src/Playground';
import TabNav from './src/TabNav';

const ExampleNavigator = createStackNavigator({
  home: { screen: HomeScreen, navigationOptions: { title: 'Fluid Transitions' } },
  shared: { screen: SharedElements },
  appear: { screen: AppearingElements },
  image: { screen: ImageTransition },
  layout: { screen: LayoutTransition },
  onboarding: { screen: Onboarding },
  onboardingC: { screen: OnboardingCarousel },
  shoes: { screen: ShoeShop },
  flatlist: { screen: FlatList },
  animatedProperty: { screen: AnimatedProperty },
  animatedPropertyC: { screen: AnimatedPropertyCarousel },
  playground: { screen: TabNav },
});

class MyApp extends React.Component<any> {
  render() {
    return (
      <ExampleNavigator />
    );
  }
}

export default MyApp;
