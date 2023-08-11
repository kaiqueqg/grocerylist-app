import React from "react";
import { KeyboardTypeOptions } from "react-native";
import { Pressable, Image, StyleSheet, TextInput, Text, View } from "react-native";
import colors from "../../Colors";
import log from "../../Log/Log";
import PressImage from "../../PressImage/PressImage";
import { Item } from '../../Types';

interface P{
  infoText: string,
  text: string,
  changeValue: (value: string) => void,
  handleTextEnter: () => void,
  keyboardType?: KeyboardTypeOptions,
  autoFocus?: boolean,
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
    return(
      <View style={styles.itemDetailRowContainer}>
        <Text style={styles.itemText}>{this.props.infoText}</Text>
        <TextInput 
          style={styles.itemTextInput}
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

const styles = StyleSheet.create({
  itemDetailRowContainer:{
    flex: 1,
    flexDirection: 'row',
  },
  itemText: {
    flex: 1,
    verticalAlign: 'middle',
    color: colors.beige,
    paddingLeft: 10,
  },
  checkedUncheckedImage: {
    margin: 10,
    width: 25,
    height: 25,
  },
  itemTextInput: {
    flex: 1,
    paddingLeft: 5,
    borderColor: colors.beigedark,
    borderWidth: 1,
    borderRadius: 2,
    color: colors.beige
  }
});

export default ItemDetailRow