import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from "./app/Navigation/AppNavigation";
import {StyleSheet} from 'react-native';


export default function App() {
  const MyTheme = {
    dark: false,
    colors: {
      primary: 'purple',
      text: 'black',
      border: 'transparent',
    },
  };
  return ( 
    <NavigationContainer  theme={MyTheme}>
      <AppNavigator/>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({});