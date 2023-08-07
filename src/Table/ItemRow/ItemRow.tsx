import React from 'react';
import { Item } from '../../Types';
import { Text, StyleSheet, Image, View, Pressable, TextInput } from 'react-native';
import colors from '../../Colors';
import storage from '../../Storage/Storage';
import log from '../../Log/Log';

interface Props{
  item: Item,
  redrawCallback: () => void, 
  isPair: boolean,
  baseUrl: string,
  isLocked: boolean,
}

interface States{
  isEditing: boolean,
  textValue: string
}

class ItemRow extends React.Component<Props,States>{
  constructor(props: Props){
    super(props);

    this.state = {
      isEditing: false,
      textValue: this.props.item.text
    }
  }

  deleteItem = async () =>{
    await storage.deleteItem(this.props.item.id);
    this.props.redrawCallback();
  }

  changeIsChecked = async () => {
    const newItem: Item = { ...this.props.item, isChecked: !this.props.item.isChecked};
    
    await storage.updateItem(newItem);
    this.props.redrawCallback();
  }

  textPress = () => {
    if(this.props.isLocked){
      log.pop("List is locked");
      return;
    }

    if(!this.state.isEditing) {
      this.setState({
        isEditing: true
      });
    }
  }

  textInputChange = (value: string) => {
    this.setState({
      textValue: value.toUpperCase()
    });
  }

  textInputEnter = async () => {
    const { textValue } = this.state;
    const { item } = this.props;
    
    let uniqueItem: Item|undefined = await storage.getItemWithSameText(textValue, item.myCategory);
    
    if(uniqueItem === undefined) {
      
      const newItem: Item = {...item, text: textValue};
      await storage.updateItem(newItem);

      this.setState({isEditing: false});
      this.props.redrawCallback();
    }
    else{
      log.pop("There's another item with the same text");
      this.setState({isEditing: false});
    }
  }

  cancelEdit = () => {
    this.setState({isEditing: false, textValue: this.props.item.text});
  }

  render(): React.ReactNode {
    const { isPair, item } = this.props;
    const { isEditing, textValue } = this.state;

    return(
        <View style={isPair? [styles.itemRowContainer, {backgroundColor: colors.bluedark}] : [styles.itemRowContainer, {backgroundColor: colors.blue}]}>
          {isEditing ?
          <React.Fragment>
            <Pressable onPress={this.deleteItem}>
              <Image style={styles.checkedUncheckedImage} source={require('../../../public/images/trash.png')}/>
            </Pressable>
            <TextInput style={styles.itemTextInput} value={textValue} autoFocus={true} onChangeText={this.textInputChange} onSubmitEditing={this.textInputEnter} autoCapitalize="characters"></TextInput>
            <Pressable onPress={this.textInputEnter}>
              <Image style={[styles.checkedUncheckedImage, {tintColor: colors.green}]} source={require('../../../public/images/done.png')}/>
            </Pressable>
            <Pressable onPress={this.cancelEdit}>
              <Image style={[styles.checkedUncheckedImage, {tintColor: colors.red}]} source={require('../../../public/images/cancel.png')}/>
            </Pressable>
          </React.Fragment>
          :
          <React.Fragment>
            <Pressable style={styles.pressableItemText} onPress={this.textPress}>
              <Text style={[styles.itemText, {color: item.isChecked? colors.beigedark : colors.beige}]}> {item.text} </Text>
            </Pressable>
            {item.isChecked?
              <Pressable onPress={this.changeIsChecked}>
                <Image style={[styles.checkedUncheckedImage, {tintColor: colors.beigedark}]} source={require('../../../public/images/checked.png')}/>
              </Pressable>
              :
              <Pressable onPress={this.changeIsChecked}>
                <Image style={styles.checkedUncheckedImage} source={require('../../../public/images/unchecked.png')}/>
              </Pressable>}
          </React.Fragment>
          }
        </View>
    );
  }
}

const styles = StyleSheet.create({
  itemRowContainer: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    borderStyle: 'solid',
    borderColor: 'white',
  },
  checkedUncheckedImage: {
    margin: 10,
    width: 25,
    height: 25,
  },
  pressableItemText: {
    flex: 1,
  },
  itemText: {
    flex: 1,
    verticalAlign: 'middle',
    color: colors.beige,
    paddingLeft: 10,
  },
  itemTextInput: {
    flex: 1,
    paddingLeft: 5,
    borderColor: colors.beige,
    borderWidth: 1,
    borderRadius: 2,
    color: colors.beige
  }
});

export default ItemRow;