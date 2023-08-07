import React from 'react';
import { Item, Category, ItemsShown } from '../../Types';
import ItemRow from '../ItemRow/ItemRow';
import { Text, StyleSheet, Image, View, Pressable, Alert, TextInput } from 'react-native';
import colors from '../../Colors';
import storage from '../../Storage/Storage';
import log from '../../Log/Log';

interface Props{
  category: Category,
  items: Item[],
  redrawCallback: () => void,
  baseUrl: string,
  itemsShown: ItemsShown,
  isLocked: boolean,
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
  constructor(props: Props){
    super(props);
    this.state = {
      isEditing: false,
      isDeleting: false,
      textValue: this.props.category.text,
      isSavingText: false,
      isCreatingNewItem: false,
      isRequestingItems: false,
    };
  }

  confirmDeleteCategory = () => {
    Alert.alert('', 'Do you really want to delete?', [
      { text: 'NO', onPress: () => { this.setState({ isEditing: false}) }},
      { text: 'YES', onPress: this.deleteCategory }
    ]);
  }

  deleteCategory = async () => {
    await storage.deleteCategory(this.props.category.id);
    this.props.redrawCallback();
  }

  addNewItem = async () => {
    if(this.props.isLocked){
      log.pop("List is locked");
      return;
    }

    const { category } = this.props;
    const newItem: Item = {
      id: storage.randomId(),
      text: '',
      isChecked: false,
      myCategory: category.id === ''? category.text : category.id
    };
    await storage.insertItem(newItem);

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
    this.setState({ textValue: value.toUpperCase() });
  }

  textInputEnter = async () => {
    const newText: string = this.state.textValue.toUpperCase();
    const { category } = this.props;
    if(newText !== category.text) {
      const newCategory: Category = {...category, text: newText};
      await storage.updateCategory(newCategory);

      this.setState({isEditing: false});
      this.props.redrawCallback();
    }
    else{
      this.setState({isEditing: false});
    }
  }

  changeItemsDisplay = async () => {
    const newCategory: Category = { ...this.props.category, isOpen: !this.props.category.isOpen};
    await storage.updateCategory(newCategory);

    this.props.redrawCallback();
  }

  shoudShowItem = (item: Item) =>{
    const { itemsShown } = this.props;
    return (itemsShown === ItemsShown.Both || ((item.isChecked && itemsShown === ItemsShown.Checked) || (!item.isChecked && itemsShown === ItemsShown.Unchecked)))
  }

  cancelEdit = () => {
    this.setState({isEditing: false, textValue: this.props.category.text });
  }

  render(): React.ReactNode {
    const { category, items, itemsShown } = this.props;
    const { isEditing, textValue } = this.state;

    //TODO improve
    const categoryItems: Item[] = items.filter((item) => {return item.myCategory === category.id});
    const displayItems: Item[] = categoryItems.filter((item) => {return (this.shoudShowItem(item))});
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
            (category.isOpen ? 
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
              <Text style={styles.rowText}>{category.text}</Text>
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
              <Image style={[styles.chevronAddImage, {tintColor: colors.beigelightdark}]} source={require('../../../public/images/add.png')}/>
            </Pressable>}
        </View>
        {category.isOpen &&
            items.map((item: Item, index: number) => (
              item.myCategory === category.id && 
              this.shoudShowItem(item) &&
              <ItemRow key={'item' + item.id} item={item} baseUrl={this.props.baseUrl} redrawCallback={this.props.redrawCallback} isPair={index % 2===0} isLocked={this.props.isLocked}></ItemRow>
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
    tintColor: colors.beigelightdark,
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