import { StyleSheet, View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native';

const SearchAnimation = () => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <LottieView source={require('../app/screens/assets/41252-searching-radius.json')} 
      autoPlay loop/>
    </View>
  )
}

export default SearchAnimation

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 1,
        position: 'absolute',
    },
});