import React from "react";
import { Pressable, TextStyle, Text } from "react-native";

interface P{
  style: any,
  text: string,
  onPress: () => void,
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
        <Text style={this.props.style as TextStyle}>{this.props.text}</Text>
      </Pressable>
    )
  }
}

export default PressImage