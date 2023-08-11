import React from 'react';
import { GroceryList, Category, ItemsShown, Item } from '../Types';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, ImageStyle, } from 'react-native';
import CategoryRow from './CategoryRow/CategoryRow';
import request from '../Requests/RequestFactory';
import colors from '../Colors';
import storage from '../Storage/Storage';
import Loading from '../Loading/Loading';
import Login from '../Login/Login';
import log from '../Log/Log';
import PressImage from '../PressImage/PressImage';

interface P{
  baseUrl: string,
  isLogged: boolean,
  isLoggedCallback: (value: boolean) => void,
}

interface S{
  data: GroceryList,
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
      data: { categories: [], items: [], deletedCategories: [], deletedItems: [] },
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
    this.readGroceryList();
  }

  resetStartFocused = () => { 
    this.categoryIdThatWasJustAdded = ''; 
  }

  isServerUp = async () => {
    this.setState({
      isTestingServerUp: true
    }, async () => {
        const response = await request(this.props.baseUrl + '/IsUp', 'GET', undefined, () => {

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

  readGroceryList = async () => {
    const data = await storage.readGroceryList();
    if(data != null){
      this.setState({
        data
      });
    }
    else{
      await storage.writeGroceryList({categories: [], items: []});
      this.setState({data: {categories: [], items: []}});
    }
  }

  user = async () => {
    this.setState({isLoggingIn: !this.state.isLoggingIn});
  }

  uploadGroceryList = async () => {
    this.setState({
      isUploading: true
    }, async () => {
      const data: GroceryList|null = await storage.readGroceryList();
      const deletedCategories: Category[]|null = await storage.readDeletedCategory();
      const deletedItems: Item[]|null = await storage.readDeletedItems();
      if(data !== null && deletedCategories !== null && deletedItems !== null) {
        const uploadData: GroceryList = {...data, deletedCategories: deletedCategories, deletedItems: deletedItems};

        const response = await request(this.props.baseUrl + '/SyncGroceryList', 'PUT', JSON.stringify(uploadData), async () => {
          this.setState({ isUploading: false });
          const response = await request(this.props.baseUrl + '/IsUp', 'GET', undefined, () => {
            log.pop('Server is down!');
            this.setState({ isServerUp: false });
          });
        });
  
        if(response !== undefined && response.ok){
          const data: GroceryList = await response.json();
          storage.writeGroceryList(data);
          storage.deleteDeletedCategories();
          storage.deleteDeletedItems();
  
          setTimeout(() => {
            this.setState({ isUploading: false, doneUpload: true }, () => {
              this.redrawCallback();
            });

            setTimeout(() => {
              this.setState({ doneUpload: false });
            }, 2000);
          }, 500);
        }
      }
    });
  }

  downloadGroceryList = async () => {
    this.setState({
      isDownloading: true
    }, async () => {
      const response = await request(this.props.baseUrl + '/GetGroceryList', 'GET', undefined, async () => {
        this.setState({ isDownloading: false });
        const response = await request(this.props.baseUrl + '/IsUp', 'GET', undefined, () => {
          log.pop('Server is down!');
          this.setState({ isServerUp: false });
        });
      });
      
      if(response !== undefined && response.ok){
        const data: GroceryList = await response.json();
        storage.writeGroceryList(data);

        setTimeout(() => {
          this.setState({ isDownloading: false, doneDownload: true }, () => {
            this.redrawCallback();
          });

          setTimeout(() => {
            this.setState({ doneDownload: false });
          }, 2000);
        }, 500);
      }
    });
  }

  addNewCategory = async () => {
    if(this.state.isLocked){
      log.pop("List is locked");
      return;
    }

    let newCategory: Category = {
      id: storage.randomId(),
      text: '',
      isOpen: true,
    }

    await storage.insertCategory(newCategory);
    this.readGroceryList();
    this.categoryIdThatWasJustAdded = newCategory.id;
  }

  redrawCallback = async () => {
    const newData: GroceryList|null = await storage.readGroceryList();
    if(newData !== null)
    {
      this.setState({data: newData});
    }
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

  devDeleteAll = async () => {
    const newData = {categories: [], items: []};
    await storage.writeGroceryList(newData);
    this.setState({
      data: newData
    });
  }

  lockUnlock = () => {
    this.setState({ isLocked: !this.state.isLocked });
    this.redrawCallback();
  }

  render() {
    const { 
      data, 
      itemsShown,
      isDownloading,
      doneDownload,
      isUploading,
      doneUpload,
      isLoggingIn,
      isTestingServerUp,
      isLocked,
    } = this.state;

    return(
      <View style={styles.tableContainer}>
        {isLoggingIn?
          <Login baseUrl={this.props.baseUrl} isLoggedCallback={this.props.isLoggedCallback}></Login>
          :
          <ScrollView style={styles.tableBody} keyboardShouldPersistTaps={'always'}>
            <View style={styles.tableHeaderContainer}>
              <Image style={[styles.tableHeaderImage, {opacity: 0}]} source={require('../../public/images/doubledown-chevron.png')}/>
              <Pressable style={styles.tableHeaderText}>
                <Text style={styles.tableHeaderText}>GROCERY LIST</Text>
              </Pressable>
              <Pressable onPress={this.addNewCategory}>
                <Image style={styles.tableHeaderImage} source={require('../../public/images/add.png')} />
              </Pressable>
            </View>
            {data.categories.length === 0 ?
              <View style={styles.tableNoCategoryContainer}>
                <Text style={styles.tableNoCategoryText}>LIST IS EMPTY</Text>
              </View>
              :
              data.categories.map((category) => (
                <CategoryRow 
                  key={'category' + category.id} 
                  category={category} 
                  items={ data.items.filter((item) => {return item.myCategory === category.id}) }
                  redrawCallback={this.redrawCallback} 
                  baseUrl={this.props.baseUrl} 
                  itemsShown={itemsShown}
                  isLocked={isLocked}
                  startFocused={this.categoryIdThatWasJustAdded === category.id}
                  resetStartFocused={this.resetStartFocused}></CategoryRow>
              ))
            }
          </ScrollView>
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
                    <Pressable onPress={this.uploadGroceryList}>
                    {isUploading?
                      <Loading style={{width: 30, height: 30, margin: 10}}></Loading>
                      :
                      <Image style={[styles.bottomImage, {tintColor: doneUpload? colors.green:colors.beige}]} source={require('../../public/images/upload.png')}></Image>
                    }
                    </Pressable>
                    <Pressable onPress={this.downloadGroceryList}>
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
                    <Pressable onPress={this.isServerUp}>
                      <Image style={[styles.bottomImage, {tintColor: colors.red}]} source={require('../../public/images/cloud-offline.png')}></Image>
                    </Pressable>
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
  tableBody: {
  },
  tableHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    borderBottomColor: colors.beige,
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
  },
  bottomLeftContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderColor: colors.bluedarker,
    backgroundColor: colors.blue,
    width: '50%',
  },
  bottomRightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderColor: colors.bluedarker,
    backgroundColor: colors.blue,
    width: '50%',
  },
  bottomImage: {
    margin: 10,
    width: 30,
    height: 30,
  },
  bottonLoading: {
    margin: 15,
    width: 45,
    height: 45
  },
});

export default Table;