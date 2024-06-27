import React from "react";
import { KeyboardTypeOptions } from "react-native";
import { Pressable, Image, StyleSheet, TextInput, Text, View } from "react-native";
import { ThemePalette } from "../../Colors";
import log from "../../Log/Log";
import PressImage from "../../PressImage/PressImage";
import { Item, UserPrefs } from '../../Types';

interface P{
  infoText: string,
  text: string,
  changeValue: (value: string) => void,
  handleTextEnter: () => void,
  keyboardType?: KeyboardTypeOptions,
  autoFocus?: boolean,
  theme: ThemePalette
}

interface S{
  text: string,
}

class ItemDetailRow extends React.Component<P,S>{
  constructor(props: P){
    super(props);
    
    this.state = {
      text: this.props.text,
    }
  }

  handleTextChange = (value: string) => {
    this.props.changeValue(value);
    this.setState({ text: value });
  }

  render(): React.ReactNode {
    const { theme } = this.props;
    return(
      <View style={styles(theme).itemDetailRowContainer}>
        <Text style={styles(theme).itemText}>{this.props.infoText}</Text>
        <TextInput 
          style={styles(theme).itemTextInput}
          value={this.state.text}
          keyboardType={this.props.keyboardType === undefined? 'default' : this.props.keyboardType}
          onChangeText={this.handleTextChange}
          onSubmitEditing={this.props.handleTextEnter}
          autoCapitalize="characters"
          autoFocus={this.props.autoFocus === undefined? false: this.props.autoFocus}>
        </TextInput>
      </View>
    )
  }
}

const styles = (theme: ThemePalette) => StyleSheet.create({
  itemDetailRowContainer:{
    flex: 1,
    flexDirection: 'column',
  },
  itemText: {
    fontSize: 10,
    color: theme.textcolor,
    margin: 5,
  },
  itemTextInput: {
    flex: 1,
    height: 40,
    paddingLeft: 5,
    borderColor: theme.boxborder,
    borderWidth: 1,
    borderRadius: 2,
    color: theme.textcolor,
  }
});

export default ItemDetailRow