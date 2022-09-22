import { StyleSheet, View } from 'react-native'
import React from 'react'
import LottieView from 'lottie-react-native';

const DownloadAnimation = () => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <LottieView source={require('../app/screens/assets/lf20_bzwoh5zn.json')} 
      autoPlay loop/>
    </View>
  )
}

export default DownloadAnimation

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 1,
        position: 'absolute',
    },
});