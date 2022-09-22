import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AudioList from '../screens/AudioList';
import PlayList from '../screens/PlayList';
import AudioDownload from '../screens/AudioDownload';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {StyleSheet} from 'react-native';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarHideOnKeyboard: true,
    headerTitle: '',
    tabBarStyle: { position: 'absolute'},

    tabBarBackground: () => (
      <BlurView  intensity={'500'} style={StyleSheet.absoluteFill} />
      ),
  }}>
      <Tab.Screen name="Music" component={AudioList} options={{
        tabBarIcon: ({size, color}) => (
          <Ionicons name="ios-musical-notes-sharp" size={size} color={color} />
        )
      }}/>
      <Tab.Screen name='Download'  component={AudioDownload} options={{
        tabBarIcon: ({size, color}) => (
          <Feather name="download" size={size} color={color}/>
        )
      }} />
      <Tab.Screen name='PlayLists' component={PlayList} options={{
        tabBarIcon: ({size, color}) => (
          <MaterialCommunityIcons name="playlist-music" size={size} color={color} />
        )
      }}/>
      
  </Tab.Navigator>
);}

const styles = StyleSheet.create({});
export default AppNavigator;