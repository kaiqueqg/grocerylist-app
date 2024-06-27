import React from 'react';
import { Item, User, UserPrefs } from '../../Types';
import { Text, StyleSheet, Image, View, Pressable, TextInput, Keyboard } from 'react-native';
import { ThemePalette } from '../../Colors';
import storage from '../../Storage/Storage';
import log from '../../Log/Log';
import PressImage from '../../PressImage/PressImage';
import ItemDetailRow from './ItemDetailRow';
import * as Haptics from 'expo-haptics';
import PressText from '../../PressText/PressText';

interface P{
  theme: ThemePalette,
  user: User,
  item: Item,
  userPrefs: UserPrefs,
  redrawCallback: () => void,
  isPair: boolean,
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
      textValue: this.props.item.Text,
      quantityValue: this.props.item.Quantity,
      quantityUnitValue: this.props.item.QuantityUnit,
      goodPriceValue: this.props.item.GoodPrice,
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
    await storage.deleteItem(this.props.item.ItemId);
    this.props.redrawCallback();
  }

  changeIsChecked = async () => {
    const newItem: Item = { ...this.props.item, IsChecked: !this.props.item.IsChecked};
    
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
      const newItem: Item = {...item, Text: textValue, Quantity: quantityValue, QuantityUnit: quantityUnitValue, GoodPrice: goodPriceValue};
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
    this.setState({isEditing: false, textValue: this.props.item.Text});
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
      await storage.updateItem({...this.props.item, Quantity: this.props.item.Quantity+1});
      this.props.redrawCallback();
    }
  }

  decreaseQuantity = async () => {
    if(!this.props.isLocked && this.props.item.Quantity > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await storage.updateItem({...this.props.item, Quantity: this.props.item.Quantity-1});
      this.props.redrawCallback();
    }
  }

  getDisplayText = () => {
    const { item, userPrefs } = this.props;
    let displayText = '';
    if(!userPrefs.hideQuantity && item.Quantity) {
      displayText = item.Quantity +"x ";
    }

    displayText += item.Text

    if(!userPrefs.showOnlyItemText && item.GoodPrice && item.QuantityUnit && item.GoodPrice != '$'){
      displayText += ' (' + item.GoodPrice + ' - ' + item.QuantityUnit + ')';
    }

    return displayText;
  }

  render(): React.ReactNode {
    const { isPair, item, userPrefs, theme } = this.props;
    const { isEditing } = this.state;

    let minusTintColor = item.Quantity > 1? (item.IsChecked? theme.icontintfade : theme.icontint) : theme.icontintfade;
    return(
      isEditing ?
        //* EDITING
        <View style={isPair? [styles(theme).itemRowDetailContainer, {backgroundColor: theme.backgroundcolor}] : [styles(theme).itemRowDetailContainer, {backgroundColor: theme.backgroundcolordark}]}>
          <PressImage style={styles(theme).trashImage} onPress={this.deleteItem} source={require('../../../public/images/trash.png')}></PressImage>
          <View style={styles(theme).detailsContainer}>
            <ItemDetailRow theme={theme} infoText='Text:' text={item.Text} changeValue={this.textInputChange} handleTextEnter={this.textInputEnter} autoFocus={true}></ItemDetailRow>
            {!userPrefs.showOnlyItemText && 
            <>
              <ItemDetailRow theme={theme} keyboardType='numeric' infoText='Quantity:' text={item.Quantity.toString()} changeValue={this.quantityChange} handleTextEnter={this.textInputEnter}></ItemDetailRow>
              <ItemDetailRow theme={theme} infoText='Good Price:' text={item.GoodPrice} changeValue={this.goodPriceChange} handleTextEnter={this.textInputEnter}></ItemDetailRow>
              <ItemDetailRow theme={theme} infoText='Quantity Unit:' text={item.QuantityUnit} changeValue={this.quantityUnitChange} handleTextEnter={this.textInputEnter}></ItemDetailRow>
            </>}
          </View>
          <PressImage style={[styles(theme).checkedUncheckedImage, {tintColor: theme.onlineicontint}]} onPress={this.textInputEnter} source={require('../../../public/images/done.png')}></PressImage>
          <PressImage style={[styles(theme).checkedUncheckedImage, {tintColor: theme.offlineicontint}]} onPress={this.cancelEdit} source={require('../../../public/images/cancel.png')}></PressImage>
        </View>
        :
        //* VIEWING
        <View style={isPair? [styles(theme).itemRowContainer, {backgroundColor: theme.lineonebk}] : [styles(theme).itemRowContainer, {backgroundColor: theme.linetwobk}]}>
          <React.Fragment>
            {!userPrefs.hideQuantity && <PressImage style={[styles(theme).minusPlusImage, {tintColor: minusTintColor}]} onPress={this.decreaseQuantity} source={require('../../../public/images/minus.png')}></PressImage>}
            {!userPrefs.hideQuantity && <PressImage style={[styles(theme).minusPlusImage, {tintColor: item.IsChecked? theme.icontintfade : theme.icontint}]} onPress={this.increaseQuantity} source={require('../../../public/images/add.png')}></PressImage>}
            <PressText text={this.getDisplayText()} textStyle={[styles(theme).itemText, item.IsChecked? styles(theme).itemTextFade : undefined]} style={styles(theme).pressableItemText} onPress={this.textPress}></PressText>
            {item.IsChecked?
              <PressImage style={[styles(theme).checkedUncheckedImage, {tintColor: item.IsChecked? theme.icontintfade : theme.icontint}]} onPress={this.changeIsChecked} source={require('../../../public/images/checked.png')}></PressImage>
              :
              <PressImage style={[styles(theme).checkedUncheckedImage, {tintColor: item.IsChecked? theme.icontintfade : theme.icontint}]} onPress={this.changeIsChecked} source={require('../../../public/images/unchecked.png')}></PressImage>
            }
          </React.Fragment>
        </View>
    )
  }
}

const styles = (theme: ThemePalette) => StyleSheet.create({
  itemRowContainer: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    borderStyle: 'solid',
    borderColor: theme.boxborder,
    alignItems: 'center',
  },
  itemRowDetailContainer: {
    width: '100%',
    flexDirection: 'row',
    borderStyle: 'solid',
    borderColor: theme.boxborder,
    alignItems: 'center',
  },
  checkedUncheckedImage: {
    marginVertical: 10,
    marginHorizontal: 7,
    width: 25,
    height: 25,
  },
  trashImage:{
    marginVertical: 10,
    marginHorizontal: 15,
    width: 25,
    height: 25,
    tintColor: theme.icontint
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
    fontWeight: 'bold',
    color: theme.textcolor,
    paddingLeft: 10,
  },
  itemTextFade: {
    fontWeight: 'normal',
    color: theme.textcolorfade,
  },
  itemTextInput: {
    flex: 1,
    paddingLeft: 5,
    borderColor: theme.boxborder,
    borderWidth: 1,
    borderRadius: 2,
    color: theme.textcolor
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    verticalAlign: 'middle',
    marginBottom: 5,
  }
});

export default ItemRow;