import React from 'react';
import { Item, UserPrefs } from '../../Types';
import { Text, StyleSheet, Image, View, Pressable, TextInput, Keyboard } from 'react-native';
import colors from '../../Colors';
import storage from '../../Storage/Storage';
import log from '../../Log/Log';
import PressImage from '../../PressImage/PressImage';
import ItemDetailRow from './ItemDetailRow';
import * as Haptics from 'expo-haptics';
import PressText from '../../PressText/PressText';

interface P{
  item: Item,
  userPrefs: UserPrefs,
  redrawCallback: () => void,
  isPair: boolean,
  baseUrl: string,
  isLocked: boolean,
  startFocused: boolean,
  resetStartFocused: () => void,
}

interface S{
  isEditing: boolean,
  textValue: string,
  quantityValue: number,
  quantityUnitValue: string,
  goodPriceValue: string,
}

class ItemRow extends React.Component<P,S>{
  keyboardDidHideListener: any = null;

  constructor(props: P){
    super(props);
    this.state = {
      isEditing: this.props.startFocused,
      textValue: this.props.item.text,
      quantityValue: this.props.item.quantity,
      quantityUnitValue: this.props.item.quantityUnit,
      goodPriceValue: this.props.item.goodPrice,
    }
  }

  componentDidMount(): void {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  }

  componentWillUnmount(): void {
    this.keyboardDidHideListener.remove();
  }

  keyboardDidHide = () => {
    this.props.resetStartFocused();
  }

  deleteItem = async () => {
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

  textInputEnter = async () => {
    const { textValue, quantityUnitValue, quantityValue, goodPriceValue } = this.state;
    const { item } = this.props;
    
    this.props.resetStartFocused();

    let uniqueItem: Item|undefined = await storage.getItemWithSameText(item);
    
    if(uniqueItem === undefined) {
      const newItem: Item = {...item, text: textValue, quantity: quantityValue, quantityUnit: quantityUnitValue, goodPrice: goodPriceValue};
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
    this.props.resetStartFocused();
    this.setState({isEditing: false, textValue: this.props.item.text});
  }

  textInputChange = (value: string) => {
    this.setState({ textValue: value.toUpperCase() });
  }

  quantityChange = (value: string) => {
    const n: number = parseInt(value);

    if(n === 0) { log.pop('Zero items??'); this.setState({ quantityValue: 1 }); return; }
    if(n < 1) { log.pop('Negative items to buy??'); this.setState({ quantityValue: 1 }); return; }

    this.setState({quantityValue: n});
  }

  quantityUnitChange = (value: string) => {
    this.setState({quantityUnitValue: value});
  }

  goodPriceChange = (value: string) => {
    this.setState({goodPriceValue: value});
  }

  increaseQuantity = async () => {
    if(!this.props.isLocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await storage.updateItem({...this.props.item, quantity: this.props.item.quantity+1});
      this.props.redrawCallback();
    }
  }

  decreaseQuantity = async () => {
    if(!this.props.isLocked && this.props.item.quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await storage.updateItem({...this.props.item, quantity: this.props.item.quantity-1});
      this.props.redrawCallback();
    }
  }

  render(): React.ReactNode {
    const { isPair, item, userPrefs } = this.props;
    const { isEditing } = this.state;
    let text = item.text;
    let quantity = '1';

    if(!userPrefs.hideQuantity && item.quantity !== null && item.quantity !== undefined) {
      text = item.quantity +"x " + text;
      quantity = item.quantity.toString();
    }
    if(item.goodPrice !== null && item.goodPrice !== undefined && item.goodPrice !== '' && item.goodPrice !== '$') text = text + ' (' + item.goodPrice + ')';

    let minusTintColor = item.quantity > 1? (item.isChecked? colors.beigedark : colors.beige) : colors.grey;

    return(
      isEditing ?
        //* EDITING
        <View style={isPair? [styles.itemRowDetailContainer, {backgroundColor: colors.bluedark}] : [styles.itemRowDetailContainer, {backgroundColor: colors.blue}]}>
          <PressImage style={styles.checkedUncheckedImage} onPress={this.deleteItem} source={require('../../../public/images/trash.png')}></PressImage>
          <View style={styles.detailsContainer}>
            <ItemDetailRow infoText='Text:' text={item.text} changeValue={this.textInputChange} handleTextEnter={this.textInputEnter} autoFocus={true}></ItemDetailRow>
            <ItemDetailRow keyboardType='numeric' infoText='Quantity:' text={item.quantity.toString()} changeValue={this.quantityChange} handleTextEnter={this.textInputEnter}></ItemDetailRow>
            <ItemDetailRow infoText='Good Price:' text={item.goodPrice} changeValue={this.goodPriceChange} handleTextEnter={this.textInputEnter}></ItemDetailRow>
            <ItemDetailRow infoText='Quantity Unit:' text={item.quantityUnit} changeValue={this.quantityUnitChange} handleTextEnter={this.textInputEnter}></ItemDetailRow>
          </View>
          <PressImage style={[styles.checkedUncheckedImage, {tintColor: colors.green}]} onPress={this.textInputEnter} source={require('../../../public/images/done.png')}></PressImage>
          <PressImage style={[styles.checkedUncheckedImage, {tintColor: colors.red}]} onPress={this.cancelEdit} source={require('../../../public/images/cancel.png')}></PressImage>
        </View>
        :
        //* VIEWING
        <View style={isPair? [styles.itemRowContainer, {backgroundColor: colors.bluedark}] : [styles.itemRowContainer, {backgroundColor: colors.blue}]}>
          <React.Fragment>
            {!userPrefs.hideQuantity && <PressImage style={[styles.minusPlusImage, {tintColor: minusTintColor}]} onPress={this.decreaseQuantity} source={require('../../../public/images/minus.png')}></PressImage>}
            {!userPrefs.hideQuantity && <PressImage style={[styles.minusPlusImage, {tintColor: item.isChecked? colors.beigedark : colors.beige}]} onPress={this.increaseQuantity} source={require('../../../public/images/add.png')}></PressImage>}
            <PressText text={text} textStyle={[styles.itemText, {color: item.isChecked? colors.beigedark : colors.beige}]} style={styles.pressableItemText} onPress={this.textPress}></PressText>
            {item.isChecked?
              <PressImage style={[styles.checkedUncheckedImage, {tintColor: item.isChecked? colors.beigedark : colors.beige}]} onPress={this.changeIsChecked} source={require('../../../public/images/checked.png')}></PressImage>
              :
              <PressImage style={[styles.checkedUncheckedImage, {tintColor: item.isChecked? colors.beigedark : colors.beige}]} onPress={this.changeIsChecked} source={require('../../../public/images/unchecked.png')}></PressImage>
            }
          </React.Fragment>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  itemRowContainer: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    borderStyle: 'solid',
    borderColor: 'white',
    alignItems: 'center',
  },
  itemRowDetailContainer: {
    width: '100%',
    flexDirection: 'row',
    borderStyle: 'solid',
    borderColor: 'white',
    alignItems: 'center',
  },
  checkedUncheckedImage: {
    margin: 10,
    width: 25,
    height: 25,
  },
  minusPlusImage: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 0,
    width: 15,
    height: 15,
  },
  smallChevronImage: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 10,
    width: 15,
    height: 15,
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
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    verticalAlign: 'middle',
  }
});

export default ItemRow;