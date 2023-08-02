import React, { RefObject } from 'react';
import { Item } from '../../Types';
import request from '../../Requests/RequestFactory'
import Toast from 'react-native-toast-message';
import Loading from '../../Loading/Loading';
import { Text, StyleSheet, Image, View, Pressable, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData, Alert } from 'react-native';
import colors from '../../Colors';
import storage from '../../Storage/Storage';
import { KeyValuePair } from '@react-native-async-storage/async-storage/lib/typescript/types';
import { ToastAndroid } from 'react-native';

interface Props{
  item: Item,
  updateItemsDisplay: () => Promise<void>, 
  isPair: boolean,
  baseUrl: string,
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

  displayConfirmDeleteRow = () => {
    //* for now, no confirmation
    // toast.warning('Are you sure?', {
    //   closeButton: <button className='btn btn-primary' onClick={this.deleteItem}>YES</button>,
    //   autoClose: 5000,
    //   draggable: false,
    //   pauseOnHover: false,
    // });

    this.deleteItem();
  }

  deleteItem = async () =>{
    await storage.deleteItem(this.props.item.id);
    this.props.updateItemsDisplay();
  }

  changeIsChecked = async () => {
    const newItem: Item = { ...this.props.item, isChecked: !this.props.item.isChecked};
    
    await storage.updateItem(newItem);
    this.props.updateItemsDisplay();
  }

  textPress = () => {
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

    let uniqueItem = true;
    const allItems = await storage.readGroceryList();

    if(allItems !== null){
      for(let i = 0; i < allItems.items.length && uniqueItem; i++){
        if(textValue === allItems.items[i].text) uniqueItem = false;
      }
    }

    if(uniqueItem) {
      const newItem: Item = {...item, text: textValue};
      await storage.updateItem(newItem);

      this.setState({isEditing: false});
      this.props.updateItemsDisplay();
    }
    else{
      //TODO some warning
      this.setState({isEditing: false});
    }
  }

  cancelEdit = () => {
    this.setState({isEditing: false, textValue: this.props.item.text});
  }

  render(): React.ReactNode {
    const { isPair, item } = this.props;
    const {  isEditing, textValue } = this.state;

    return(
        <View style={isPair? [styles.itemRowContainer, {backgroundColor: colors.bluedark}] : [styles.itemRowContainer, {backgroundColor: colors.blue}]}>
          {isEditing ?
          <React.Fragment>
            <Pressable onPress={this.deleteItem}>
              <Image style={styles.checkedUncheckedImage} source={require('../../../public/images/trash.png')}/>
            </Pressable>
            <TextInput style={styles.itemTextInput} value={textValue} autoFocus={true} onChangeText={this.textInputChange} onSubmitEditing={this.textInputEnter} autoCapitalize="characters"></TextInput>
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