import * as React from 'react';
import { GroceryList, Category, ItemsShown, Item, UserPrefs, User, Response, Codes } from '../Types';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, ImageStyle, FlatList, Alert, } from 'react-native';
import CategoryRow from './CategoryRow/CategoryRow';
import colors from '../Colors';
import storage from '../Storage/Storage';
import Loading from '../Loading/Loading';
import Login from '../Login/Login';
import log from '../Log/Log';
import PressImage from '../PressImage/PressImage';
import { grocerylistApi } from '../Requests/RequestFactory';

interface P{
  groceryList: GroceryList,
  user: User,
  userPrefs: UserPrefs,
  isLogged: boolean,
  isLoggedCallback: (value: boolean) => void,
  userPrefsChanged: () => void,
  redrawCallback: () => void,
}

interface S{
  isServerUp: boolean,
  isTestingServerUp: boolean,
  itemsShown: ItemsShown,
  isDownloading: boolean,
  doneDownload: boolean,
  isUploading: boolean,
  doneUpload: boolean,
  isSaving: boolean,
  isLoggingIn: boolean,
  showingInfo: boolean,
  isLocked: boolean,
  isAllOpen: boolean,
}

class Table extends React.Component<P, S> {
  categoryIdThatWasJustAdded = '';

  constructor(props: P){
    super(props);

    this.state = {
      isServerUp: true,
      isTestingServerUp: false,
      itemsShown: ItemsShown.Both,
      isDownloading: false,
      doneDownload: false,
      isUploading: false,
      doneUpload: false,
      isSaving: false,
      isLoggingIn: false,
      showingInfo: false,
      isLocked: false,
      isAllOpen: false,
    }
  }

  componentDidMount(): void {
    //storage.deleteGroceryList();
  }

  resetStartFocused = () => { 
    this.categoryIdThatWasJustAdded = ''; 
  }

  isServerUp = async () => {
    this.setState({
      isTestingServerUp: true
    }, async () => {
        const response = await grocerylistApi.isUp(() => {

        log.pop('Server is down!');
        setTimeout(() => {
          this.setState({ isServerUp: false, isTestingServerUp: false });
        }, 500);
      });
      if(response != undefined && response.ok){
        setTimeout(() => {
          this.setState({ isServerUp: true, isTestingServerUp: false });
        }, 500);
      }
    });
  }

  user = async () => {
    this.setState({isLoggingIn: !this.state.isLoggingIn});
  }

  syncGroceryList = async () => {
    this.setState({ isUploading: true});
    let groceryList = await storage.readGroceryList();
    if(groceryList === null) return;

    const deletedCategories = await storage.readDeletedCategory();
    const deletedItems = await storage.readDeletedItems();
    groceryList.deletedCategories = deletedCategories;
    groceryList.deletedItems = deletedItems;

    try {
      const response = await grocerylistApi.syncGroceryList(groceryList, async () => {
        this.setState({ isDownloading: false });
        await grocerylistApi.isUp(() => {
          log.pop('Server is down!');
          this.setState({ isServerUp: false });
        });
      });
      if(response !== undefined && response !== null){
        const responseGroceryList: Response<GroceryList> = await response.json();
        
        if(responseGroceryList.Data !== null && responseGroceryList.Data !== undefined){
          storage.writeGroceryList(responseGroceryList.Data);
          storage.deleteDeletedCategories();
          storage.deleteDeletedItems();
          this.props.redrawCallback();
        } 
        else{
          log.dev('syncGroceryList', responseGroceryList.Message);
          log.pop(responseGroceryList.Message);
        }
      }
      else{
        log.dev('syncGroceryList', 'Response of SyncGroceryList was undefined or null.');
        log.pop(`Response of SyncGroceryList was undefined or null.`);
      }
    } catch (err) {
      log.err('syncGroceryList', err);
      log.pop(`SyncGroceryList error.`);
    }

    this.setState({ isUploading: false });
  }

  getGroceryList = async () => {
    this.setState({ isDownloading: true});

    try {
      log.dev('1');
      const response = await grocerylistApi.getGroceryList(async () => {
        this.setState({ isDownloading: false });
        await grocerylistApi.isUp(() => {
          log.pop('Server is down!');
          this.setState({ isServerUp: false });
        });
      });
      log.dev('2');
      //! problem with response
      if(response === undefined || response === null){ 
        log.dev('getGroceryList', 'Response of GetGroceryList was undefined or null.');
        log.pop(`Response of GetGroceryList was undefined or null.`);
        return;
      }

      log.dev('1');

      const responseGroceryList: Response<GroceryList> = await response.json();
      //! response not ok
      if(responseGroceryList.Code !== Codes.OK && responseGroceryList.Code !== Codes.NoContent){ log.pop(responseGroceryList.Message); return;}
      //! problem with data
      if(responseGroceryList.Data === null || responseGroceryList.Data === undefined){
        log.dev('getGroceryList', responseGroceryList.Message);
        log.pop(responseGroceryList.Message);
        return;
      }

      //*happy path
      log.dev('table.getGroceryList', responseGroceryList);
      log.dev('table.getGroceryList', 'user', this.props.user);
      storage.writeGroceryList(responseGroceryList.Data);
      this.props.redrawCallback();
    } 
    catch (err) {
      log.err('getGroceryList', err);
      log.pop(`GetGroceryList response "catch" error.`);
    }

    this.setState({ isDownloading: false });
  }

  addNewCategory = async () => {
    const { isLocked } = this.state;
    const { user } = this.props;

    if(isLocked){
      log.pop("List is locked");
      return;
    }

    const categoryId = storage.randomId();
    let newCategory: Category = {
      UserId: user.UserId,
      CategoryId: categoryId,
      Text: '',
      IsOpen: true,
    }
    await storage.insertCategory(newCategory);

    if(this.props.userPrefs.shouldCreateNewItemWhenCreateNewCategory) {
      const newItem: Item = {
        UserIdCategoryId: user.UserId + newCategory.CategoryId,
        ItemId: storage.randomId(),
        Text: '',
        IsChecked: false,
        GoodPrice: '$',
        Quantity: 1,
        QuantityUnit: '',
      };
      await storage.insertItem(newItem);
    }

    this.props.redrawCallback();
    this.categoryIdThatWasJustAdded = newCategory.CategoryId;
  }

  changeItemsShown = () => {
    const { itemsShown } = this.state;
    if(itemsShown === ItemsShown.Both) this.setState({ itemsShown: ItemsShown.Checked });
    else if(itemsShown === ItemsShown.Checked) this.setState({ itemsShown: ItemsShown.Unchecked });
    else if(itemsShown === ItemsShown.Unchecked) this.setState({ itemsShown: ItemsShown.Both });
  }

  showInfo = () => {
    this.setState({ showingInfo: !this.state.showingInfo})
  }

  devConfirmDeleteAll = async () => {
    Alert.alert('', 'Do you really want to delete?', [
      { text: 'NO', onPress: () => { return }},
      { text: 'YES', onPress: this.devDeleteAll }
    ]);
    
  }

  devDeleteAll = async () => {
    const newData = {categories: [], items: [], deletedCategories: [], deletedItems: []};
    await storage.writeGroceryList(newData);
    this.props.redrawCallback();
  }

  lockUnlock = () => {
    this.setState({ isLocked: !this.state.isLocked });
    this.props.redrawCallback();
  }

  render() {
    const { 
      itemsShown,
      isDownloading,
      doneDownload,
      isUploading,
      doneUpload,
      isLoggingIn,
      isTestingServerUp,
      isLocked,
    } = this.state;
    const { groceryList } = this.props;

    let phrase = '';
    if(itemsShown === ItemsShown.Unchecked) phrase = 'No UNCHECKED items to be displayed...';
    else if(itemsShown === ItemsShown.Checked) phrase = 'No CHECKED items to be displayed...';
    else phrase = 'List is empty...';
    return(
      <View style={styles.tableContainer}>
        {isLoggingIn?
          <Login isLoggedCallback={this.props.isLoggedCallback} redrawCallback={this.props.redrawCallback} userPrefsChanged={this.props.userPrefsChanged}></Login>
          :
          <View style={{flex: 1,}}>
            <View style={styles.tableHeaderContainer}>
              <Image style={[styles.tableHeaderImage, {opacity: 0}]} source={require('../../public/images/doubledown-chevron.png')}/>
              <Text style={styles.tableHeaderText} onPress={this.devConfirmDeleteAll}>GROCERY LIST</Text>
              <PressImage style={styles.tableHeaderImage} source={require('../../public/images/add.png')} onPress={this.addNewCategory}></PressImage>
            </View>
            <View style={styles.tableBodyContainer}>
              <FlatList data={this.props.groceryList.categories} renderItem={({item: category}) => (
                <CategoryRow
                  user={this.props.user}
                  key={'category' + category.CategoryId}
                  category={category} 
                  items={groceryList.items === null? 
                    []
                    :
                    groceryList.items.filter((item) => 
                    {
                      return item.UserIdCategoryId.slice(-40) === category.CategoryId;
                    })
                   }
                  redrawCallback={this.props.redrawCallback} 
                  itemsShown={itemsShown}
                  isLocked={isLocked}
                  startFocused={this.categoryIdThatWasJustAdded === category.CategoryId}
                  resetStartFocused={this.resetStartFocused}
                  userPrefs={this.props.userPrefs}></CategoryRow>
              )}></FlatList>
            </View>
          </View>
        }
        <View style={styles.bottomContainer}>
              <View style={styles.bottomLeftContainer}>
                {isLoggingIn?
                  <PressImage style={[styles.bottomImage, {tintColor: colors.beige}]} source={require('../../public/images/menu.png')} onPress={this.user}></PressImage>
                  :
                  <View style={{flexDirection: 'row'}}>
                    <PressImage style={[styles.bottomImage, {tintColor: this.props.isLogged? colors.green : colors.red}]} source={require('../../public/images/user.png')} onPress={this.user}></PressImage>
                    {this.props.isLogged && this.state.isServerUp?
                      <React.Fragment>
                        <Pressable onPress={this.syncGroceryList}>
                        {isUploading?
                          <Loading style={{width: 30, height: 30, margin: 10}}></Loading>
                          :
                          <Image style={[styles.bottomImage, {tintColor: doneUpload? colors.green:colors.beige}]} source={require('../../public/images/upload.png')}></Image>
                        }
                        </Pressable>
                        <Pressable onPress={this.getGroceryList}>
                          {isDownloading? 
                            <Loading style={{width: 30, height: 30, margin: 10}}></Loading>
                            :
                            <Image style={[styles.bottomImage, {tintColor: doneDownload? colors.green:colors.beige}]} source={require('../../public/images/download.png')}></Image>
                          }
                        </Pressable>
                      </React.Fragment>
                      :
                      (isTestingServerUp?
                        <Loading style={{width: 30, height: 30, margin: 10}}></Loading>
                        :
                        <PressImage style={[styles.bottomImage, {tintColor: colors.red}]} source={require('../../public/images/cloud-offline.png')} onPress={this.isServerUp}></PressImage>
                      )
                    }
                  </View>
                }
              </View>
              <View style={styles.bottomRightContainer}>
                {!isLoggingIn && 
                <View style={{flexDirection: 'row'}}>
                  {isLocked? 
                    <PressImage style={styles.bottomImage} onPress={this.lockUnlock} source={require('../../public/images/locked.png')}></PressImage>
                    :
                    <PressImage style={styles.bottomImage} onPress={this.lockUnlock} source={require('../../public/images/unlocked.png')}></PressImage>
                  }
                  <Pressable onPress={this.changeItemsShown}>
                    {itemsShown === ItemsShown.Both && <Image style={styles.bottomImage} source={require('../../public/images/checkedunchecked.png')}></Image>}
                    {itemsShown === ItemsShown.Checked && <Image style={styles.bottomImage} source={require('../../public/images/checked.png')}></Image>}
                    {itemsShown === ItemsShown.Unchecked && <Image style={styles.bottomImage} source={require('../../public/images/unchecked.png')}></Image>}
                  </Pressable>
                </View>
                }
              </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    borderBottomColor: colors.bluedarker,
    borderStyle: 'solid',
    borderBottomWidth: 1,
  },
  tableHeaderImage: {
    margin: 10,
    width: 20,
    height: 20
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '100%',
    color: colors.beige,
  },
  tableBodyContainer:{
    flex: 1,
  },
  tableNoCategoryContainer: {
    flex: 1,
    height: 100,
    justifyContent: 'center',
  },
  tableNoCategoryText: {
    textAlign: 'center',
    color: colors.beige,
  },
  bottomContainer: {
    flexDirection: 'row',
    height: 50,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderColor: colors.bluedarker,
    backgroundColor: colors.bluedark,
  },
  bottomLeftContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '50%',
  },
  bottomRightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '50%',
  },
  bottomImage: {
    margin: 10,
    width: 30,
    height: 30,
    tintColor: colors.beige
  },
  bottonLoading: {
    margin: 15,
    width: 45,
    height: 45
  },
});

export default Table;