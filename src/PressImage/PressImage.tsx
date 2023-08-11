import React from "react";
import { Pressable, ViewStyle, Image, ImageStyle, ImageSourcePropType } from "react-native";

interface P{
  style: any,
  onPress: () => void,
  source: ImageSourcePropType,
}

interface S{}

class PressImage extends React.Component<P, S>{
  constructor(props: P){
    super(props);

    this.state = {
      
    }
  }

  render(): React.ReactNode {
    return(
      <Pressable onPress={this.props.onPress}>
        <Image style={this.props.style as ImageStyle} source={this.props.source}></Image>
      </Pressable>
    )
  }
}

export default PressImage