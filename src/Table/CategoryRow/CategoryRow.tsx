import React, { RefObject } from 'react';
import { Item, Category, ItemsShown } from '../../Types';
import Toast from 'react-native-toast-message';
import request from '../../Requests/RequestFactory'
import ItemRow from '../ItemRow/ItemRow';
import Loading from '../../Loading/Loading';
import { Text, StyleSheet, Image, View, Pressable, Alert, TextInput, ToastAndroid } from 'react-native';
import colors from '../../Colors';
import storage from '../../Storage/Storage';

interface Props{
  category: Category,
  redrawCallback: () => void,
  baseUrl: string,
  itemsShown: ItemsShown
}

interface States{
  isEditing: boolean,
  isDeleting: boolean,
  textValue: string,
  isSavingText: boolean,
  isCreatingNewItem: boolean,
  isRequestingItems: boolean,
  items: Item[]
}

class CategoryRow extends React.Component<Props, States>{
  inputRef: RefObject<TextInput> = React.createRef();

  constructor(props: Props){
    super(props);
    this.state = {
      isEditing: false,
      isDeleting: false,
      textValue: this.props.category.text,
      isSavingText: false,
      isCreatingNewItem: false,
      isRequestingItems: false,
      items: [],
    };
  }

  async componentDidMount(): Promise<void> {
    const newItems: Item[]|undefined = await storage.readItemsOnCategory(this.props.category.id);
    if(newItems !== undefined) {
      this.setState({ items: newItems});
    }
  }

  confirmDeleteCategory = () => {
    Alert.alert('', 'Do you really want to delete?', [
      { text: 'YES', onPress: this.deleteCategory },
      { text: 'NO', onPress: () => { this.setState({ isEditing: false});}}
    ]);
  }

  deleteCategory = async () => {
    
    await storage.deleteCategory(this.props.category.id);
    this.props.redrawCallback();
  }

  addNewItem = async () => {
    const { category } = this.props;
    const newItem: Item = {
      id: storage.randomId(),
      text: '',
      isChecked: false,
      myCategory: category.id === ''? category.text : category.id
    };
    await storage.insertItem(newItem);

    this.updateItemsDisplay();
  }

  textPress = () => {
    const { category } = this.props;

    setTimeout(() => {
      this.inputRef.current?.focus();
      this.inputRef.current?.setNativeProps({text: category.text });
    }, 100);

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

  updateItemsDisplay = async () => {
    const { category } = this.props;
    const newItems: Item[]|undefined = await storage.readItemsOnCategory(category.id === '' ? category.text: category.id);
    if(newItems !== undefined) {
      this.setState({
        items: newItems
      });
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
    this.setState({isEditing: false});
  }

  render(): React.ReactNode {
    const { category, itemsShown } = this.props;
    const { items, isEditing } = this.state;

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
                <Image style={styles.chevronImage} source={require('../../../public/images/down-chevron.png')}/>
              </Pressable>
              :
              <Pressable onPress={this.changeItemsDisplay}>
                <Image style={styles.chevronImage} source={require('../../../public/images/up-chevron.png')}/>
              </Pressable>)
          }
          {isEditing?
            <TextInput style={styles.categoryTextInput} ref={this.inputRef} onChangeText={this.textInputChange} onSubmitEditing={this.textInputEnter} autoCapitalize="characters"></TextInput>
            :
            <Pressable style={styles.pressableRowText} onPress={this.textPress}>
              <Text style={styles.rowText}>{category.text}</Text>
            </Pressable>
          }
          {isEditing?
            <Pressable onPress={this.cancelEdit}>
              <Image style={[styles.cancelImage, {tintColor: colors.red}]} source={require('../../../public/images/cancel.png')}/>
            </Pressable>
          :
            <Pressable onPress={this.addNewItem}>
              <Image style={[styles.chevronImage, {opacity: category.isOpen? 1:0}]} source={require('../../../public/images/add.png')}/>
            </Pressable>
          }
        </View>
        {category.isOpen &&
            items.map((item: Item, index: number) => (
              item.myCategory === category.id && 
              this.shoudShowItem(item) &&
              <ItemRow key={'item' + item.id} item={item} baseUrl={this.props.baseUrl} updateItemsDisplay={this.updateItemsDisplay} isPair={index % 2===0}></ItemRow>
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
  chevronImage:{
    margin: 10,
    width: 20,
    height: 20
  },
  cancelImage:{
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