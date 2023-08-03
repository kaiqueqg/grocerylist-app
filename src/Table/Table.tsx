import React from 'react';
import { GroceryList, Category, ItemsShown } from '../Types';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, } from 'react-native';
import CategoryRow from './CategoryRow/CategoryRow';
import request from '../Requests/RequestFactory';
import colors from '../Colors';
import storage from '../Storage/Storage';
import Loading from '../Loading/Loading';
import Login from '../Login/Login';
import log from '../Log/Log';

interface Props{
  baseUrl: string,
  isLogged: boolean,
  isLoggedCallback: (value: boolean) => void,
}

interface States{
  data: GroceryList,
  isServerUp: boolean,
  itemsShown: ItemsShown,
  isDownloading: boolean,
  isUploading: boolean,
  isSaving: boolean,
  isLoggingIn: boolean,
  showingInfo: boolean,
}

class Table extends React.Component<Props, States> {

  constructor(props: Props){
    super(props);

    this.state = {
      data: { categories: [], items: [] },
      isServerUp: true,
      itemsShown: ItemsShown.Both,
      isDownloading: false,
      isUploading: false,
      isSaving: false,
      isLoggingIn: false,
      showingInfo: false,
    }
  }

  componentDidMount(): void {
    this.readGroceryList();
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
      const data = await storage.readGroceryList();

      const response = await request(this.props.baseUrl + '/SaveGroceryList', 'PUT', JSON.stringify(data), async () => {
        const response = await request(this.props.baseUrl + '/IsUp', 'GET', undefined, () => {
          this.setState({ isServerUp: false });
        });
      });

      if(response !== undefined && response.ok){
        log.pop('Upload done.');
        const data: GroceryList = await response.json();
        storage.writeGroceryList(data);

        setTimeout(() => {
          this.setState({ isUploading: false }, () => {
            this.redrawCallback();
          });
        }, 500);
      }
    });
  }

  downloadGroceryList = async () => {
    this.setState({
      isDownloading: true
    }, async () => {
      const response = await request(this.props.baseUrl + '/GetGroceryList', 'GET', undefined, async () => {
        const response = await request(this.props.baseUrl + '/IsUp', 'GET', undefined, () => {
          this.setState({ isServerUp: false });
        });
      });
      
      if(response !== undefined && response.ok){
        const data: GroceryList = await response.json();
        storage.writeGroceryList(data);

        setTimeout(() => {
          this.setState({ isDownloading: false }, () => {
            this.redrawCallback();
          });
        }, 500);
      }
    });
  }

  addNewCategory = async () => {
    let newCategory: Category = {
      id: storage.randomId(),
      text: '',
      isOpen: false
    }

    await storage.insertCategory(newCategory);

    this.readGroceryList();
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

  render() {
    const { 
      data, 
      itemsShown,
      isDownloading,
      isUploading,
      isLoggingIn,
    } = this.state;

    return(
      <View style={styles.tableContainer}>
        {isLoggingIn?
          <Login baseUrl={this.props.baseUrl} isLoggedCallback={this.props.isLoggedCallback}></Login>
          :
          <ScrollView style={styles.tableBody}>
            <View style={styles.tableHeaderContainer}>
              <Image style={[styles.tableHeaderImage, {opacity: 0}]} source={require('../../public/images/up-chevron.png')}/>
              <Pressable style={styles.tableHeaderText}>
                <Text style={styles.tableHeaderText}>GROCERY LIST</Text>
              </Pressable>
              <Pressable onPress={this.addNewCategory}>
                <Image style={styles.tableHeaderImage} source={require('../../public/images/add.png')} />
              </Pressable>
            </View>
            {data.categories.map((category) => (
              <CategoryRow 
                key={'category' + category.id} 
                category={category} 
                items={ data.items.filter((item) => {return item.myCategory === category.id}) }
                redrawCallback={this.redrawCallback} 
                baseUrl={this.props.baseUrl} 
                itemsShown={itemsShown}></CategoryRow>
            ))}
          </ScrollView>}
        <View style={styles.bottomContainer}>
          <View style={styles.bottomLeftContainer}>
            <Pressable onPress={this.user}>
              {this.props.isLogged?
                <Image style={[styles.bottomImage, {tintColor: colors.green}]} source={require('../../public/images/user.png')}></Image>
                :
                <Image style={[styles.bottomImage, {tintColor: colors.red}]} source={require('../../public/images/user.png')}></Image>
              }
            </Pressable>
            {this.props.isLogged?
              <React.Fragment>
                <Pressable onPress={this.uploadGroceryList}>
                {isUploading?
                  <Loading imageSize={30} margin={10}></Loading>
                  :
                  <Image style={styles.bottomImage} source={require('../../public/images/upload.png')}></Image>
                }
              </Pressable>
              <Pressable onPress={this.downloadGroceryList}>
                {isDownloading? 
                  <Loading imageSize={30} margin={10}></Loading>
                  :
                  <Image style={styles.bottomImage} source={require('../../public/images/download.png')}></Image>
                }
              </Pressable>
              </React.Fragment>
              :
              <Image style={[styles.bottomImage, {tintColor: colors.red}]} source={require('../../public/images/cloud-offline.png')}></Image>
            }
          </View>
          <View style={styles.bottomRightContainer}>
            <Pressable onPress={this.changeItemsShown}>
              {itemsShown === ItemsShown.Both && <Image style={styles.bottomImage} source={require('../../public/images/checkedunchecked.png')}></Image>}
              {itemsShown === ItemsShown.Checked && <Image style={styles.bottomImage} source={require('../../public/images/checked.png')}></Image>}
              {itemsShown === ItemsShown.Unchecked && <Image style={styles.bottomImage} source={require('../../public/images/unchecked.png')}></Image>}
            </Pressable>
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