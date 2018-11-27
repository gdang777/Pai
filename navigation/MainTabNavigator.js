import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LinksScreen from '../screens/LinksScreen';
import TrackScreen from '../screens/TrackScreen';
import BarCode from '../screens/BarCode';
import Info from '../screens/Info';






const LoginStack = createStackNavigator({
  Login: LoginScreen,
});

const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
});

ProfileStack.navigationOptions = {
  // Name of tabs on nav bar
  tabBarLabel: 'Profile',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const BarStack = createStackNavigator({
  Bars: BarCode,
  Links: LinksScreen
});

const LinksStack = createStackNavigator({
  Links: LinksScreen,
  Track: TrackScreen,
  Info : Info,
});

LinksStack.navigationOptions = {
  // Name of tabs on nav bar
  tabBarLabel: 'Connections',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      onPress={() => {

      }}
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-contacts' : 'md-link'}
    />
  ),
};


export default createBottomTabNavigator({

  ProfileStack,
  LinksStack,
});
