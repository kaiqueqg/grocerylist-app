import React from 'react';
import { Item, Category, ItemsShown, StorageInfo, UserPrefs, User } from '../../Types';
import ItemRow from '../ItemRow/ItemRow';
import { Text, StyleSheet, Image, View, Pressable, Alert, TextInput, Keyboard } from 'react-native';
import colors from '../../Colors';
import storage from '../../Storage/Storage';
import log from '../../Log/Log';

interface Props{
  category: Category,
  items: Item[],
  user: User,
  userPrefs: UserPrefs,
  redrawCallback: () => void,
  itemsShown: ItemsShown,
  isLocked: boolean,
  startFocused: boolean,
  resetStartFocused: () => void,
}

interface States{
  isEditing: boolean,
  isDeleting: boolean,
  textValue: string,
  isSavingText: boolean,
  isCreatingNewItem: boolean,
  isRequestingItems: boolean,
}

class CategoryRow extends React.Component<Props, States>{
  itemIdThatWasJustAdded = '';
  keyboardDidHideListener: any = '';
  
  constructor(props: Props){
    super(props);
    this.state = {
      isEditing: this.props.startFocused,
      isDeleting: false,
      textValue: this.props.category.Text,
      isSavingText: false,
      isCreatingNewItem: false,
      isRequestingItems: false,
    };
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
  
  confirmDeleteCategory = () => {
    Alert.alert('', 'Do you really want to delete?', [
      { text: 'NO', onPress: () => { this.setState({ isEditing: false}) }},
      { text: 'YES', onPress: this.deleteCategory }
    ]);
  }

  deleteCategory = async () => {
    await storage.deleteCategory(this.props.category.CategoryId);
    this.props.redrawCallback();
  }

  addNewItem = async () => {
    const { category, isLocked, user } = this.props;

    if(isLocked){ log.pop("List is locked"); return; }

    const itemId = storage.randomId();
    const newItem: Item = {
      UserIdCategoryId: user.UserId  + category.CategoryId,
      ItemId: itemId,
      Text: '',
      IsChecked: false,
      GoodPrice: '$',
      Quantity: 1,
      QuantityUnit: '',
    };
    await storage.insertItem(newItem);
    this.props.redrawCallback();
    this.itemIdThatWasJustAdded = newItem.UserIdCategoryId;
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
    this.setState({ textValue: value.toUpperCase() });
  }

  textInputEnter = async () => {
    const newText: string = this.state.textValue.toUpperCase();
    const { category } = this.props;

    this.props.resetStartFocused();

    if(newText !== category.Text) {
      const newCategory: Category = {...category, Text: newText};
      const info: StorageInfo<Category> = await storage.updateCategory(newCategory);

      if(info.ok) {
        this.setState({isEditing: false});
        this.props.redrawCallback();
      }
      else {
        log.pop(info.msg);
      }
    }
    else{
      this.setState({isEditing: false});
    }
  }

  changeItemsDisplay = async () => {
    const newCategory: Category = { ...this.props.category, IsOpen: !this.props.category.IsOpen};
    await storage.updateCategory(newCategory);

    this.props.redrawCallback();
  }

  shouldShowItem = (item: Item) =>{
    const { itemsShown } = this.props;
    const value = (itemsShown === ItemsShown.Both || ((item.IsChecked && itemsShown === ItemsShown.Checked) || (!item.IsChecked && itemsShown === ItemsShown.Unchecked)));
    return value;
  }

  cancelEdit = () => {
    this.props.resetStartFocused();
    this.setState({isEditing: false, textValue: this.props.category.Text });
  }

  resetStartFocused = () => { this.itemIdThatWasJustAdded = ''; }

  read = async () => { return await storage.readUser(); }

  render(): React.ReactNode {
    const { category, items, startFocused, user } = this.props;
    const { isEditing, textValue } = this.state;

    //TODO improve
    const categoryItems: Item[] = items.filter((item) => {
      return item.UserIdCategoryId === user.UserId + category.CategoryId;
    });
    const displayItems: Item[] = categoryItems.filter((item) => {return (this.shouldShowItem(item))});
    const shouldDisplay: boolean = categoryItems.length == 0 || (categoryItems.length > 0 && displayItems.length > 0);

    return(
      (shouldDisplay ? 
      <View>
        <View style={styles.categoryRowContainer}>
          {isEditing?
            <Pressable onPress={this.confirmDeleteCategory}>
              <Image style={styles.trashImage} source={require('../../../public/images/trash.png')}/>
            </Pressable>
            :
            (category.IsOpen ? 
              <Pressable onPress={this.changeItemsDisplay}>
                <Image style={styles.chevronAddImage} source={require('../../../public/images/down-chevron.png')}/>
              </Pressable>
              :
              <Pressable onPress={this.changeItemsDisplay}>
                <Image style={styles.chevronAddImage} source={require('../../../public/images/up-chevron.png')}/>
              </Pressable>)
          }
          {isEditing?
            <TextInput style={styles.categoryTextInput} value={textValue} autoFocus={true} onChangeText={this.textInputChange} onSubmitEditing={this.textInputEnter} autoCapitalize="characters"></TextInput>
            :
            <Pressable style={styles.pressableRowText} onPress={this.textPress}>
              <Text style={styles.rowText}>{category.Text}</Text>
            </Pressable>
          }
          {isEditing?
            <React.Fragment>
              <Pressable onPress={this.textInputEnter}>
                <Image style={[styles.doneCancelImage, {tintColor: colors.green}]} source={require('../../../public/images/done.png')}/>
              </Pressable>
              <Pressable onPress={this.cancelEdit}>
                <Image style={[styles.doneCancelImage, {tintColor: colors.red}]} source={require('../../../public/images/cancel.png')}/>
              </Pressable>
            </React.Fragment>
            :
            <Pressable onPress={this.addNewItem}>
              <Image style={styles.chevronAddImage} source={require('../../../public/images/add.png')}/>
            </Pressable>}
        </View>
        {category.IsOpen &&
            items.map((item: Item, index: number) => (
              item.UserIdCategoryId === (user.UserId + category.CategoryId) && 
              this.shouldShowItem(item) &&
              <ItemRow 
                key={'item' + item.ItemId}
                user={user}
                item={item}
                redrawCallback={this.props.redrawCallback}
                isPair={index % 2===0}
                isLocked={this.props.isLocked}
                startFocused={this.itemIdThatWasJustAdded === item.ItemId}
                resetStartFocused={this.resetStartFocused}
                userPrefs={this.props.userPrefs}></ItemRow>
            )
          )
        }
      </View>
      :
      <View></View>)
    );
  }
}

const styles = StyleSheet.create({
  categoryRowContainer:{
    backgroundColor: colors.bluedarker,
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  chevronAddImage:{
    margin: 7,
    width: 20,
    height: 20,
    tintColor: colors.beige,
  },
  doneCancelImage:{
    margin: 10,
    width: 20,
    height: 20
  },
  trashImage: {
    margin: 10,
    width: 20,
    height: 20
  },
  pressableRowText: {
    flex: 1,
  },
  rowText: {
    textAlign: 'center',
    color: colors.beige,
    fontWeight: 'bold',
  },
  categoryTextInput: {
    flex: 1,
    textAlign: 'center',
    paddingLeft: 5,
    borderColor: colors.beige,
    borderWidth: 1,
    borderRadius: 2,
    color: colors.beige
  }
});

export default CategoryRow