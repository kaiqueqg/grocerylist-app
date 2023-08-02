import React, {useRef} from 'react';
import { StyleSheet, Animated, Easing, View } from 'react-native';

interface Props{
  imageSize?: number,
  margin?: number
}
interface States{
}

class Loading extends React.Component<Props, States>{
  rotateValue: Animated.Value;

  constructor(props: Props){
    super(props);

    this.rotateValue = new Animated.Value(0);
  }

  componentDidMount() {
    // Start the rotation animation when the component mounts
    this.startRotation();
  }

  componentWillUnmount() {
    // Clean up the animation when the component unmounts
    this.rotateValue.stopAnimation();
  }

  startRotation = () => {
    Animated.loop(
      Animated.timing(this.rotateValue, {
        toValue: 1,
        duration: 700, // 1 second per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  render(): React.ReactNode {
    const { imageSize, margin } = this.props;

    const dynamicStyle = StyleSheet.create({
      imageContainer: {
        width: imageSize === undefined? 30:imageSize,
        height: imageSize === undefined? 30:imageSize,
        margin: margin === undefined? 5:margin,
      }
    });

    const rotate = this.rotateValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return(
      <View style={dynamicStyle.imageContainer}>
        <Animated.Image 
            style={[styles.image, { transform: [{rotate}] }]}
            source={require('../../public/images/refresh.png')}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})

export default Loading