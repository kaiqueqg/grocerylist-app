import React from 'react';
import { StyleSheet, View, StatusBar} from 'react-native';
import Table from './src/Table/Table';
import colors from './src/Colors';
import storage from './src/Storage/Storage';
import { GroceryList, User, UserPrefs } from './src/Types';
import log from './src/Log/Log';

interface Props{
}

interface States{
  groceryList: GroceryList,
  isLogged: boolean,
  isServerUp: boolean,
  userPrefs: UserPrefs,
  user: User | null,
  token: string | null,
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      groceryList: {categories: [], items: [], deletedCategories: [], deletedItems: []},
      isLogged: false,
      isServerUp: true,
      user: null,
      userPrefs: { hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false},
      token: null,
    }
  }

  componentDidMount(): void {
    this.loadLogin();
    this.loadUserPrefs();
    this.loadGroceryList();
  }

  loadGroceryList = async () => {
    try {
      const groceryList = await storage.readGroceryList();

      if(groceryList !== null){
        this.setState({groceryList});
      }
    } catch (err) {
      log.err('loadGroceryList', err);
    }
  }

  loadLogin = async () => {
    try {
      const token = await storage.readJwtToken();
      let user = await storage.readUser();

      if(user === null){
        user = this.getFakeUser();
        await storage.writeUser(user);
      }

      this.setState({
        user: user,
        token: token,
        isLogged: token !== null
      });
   } catch (err) {
     log.err('loadLogin', err);
   }
  }

  loadUserPrefs = async () => {
    try {
      const userPrefs = await storage.readUserPrefs();
      if(userPrefs === null){
       storage.writeUserPrefs({ hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false});
       this.setState({
         userPrefs: { hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false}
       });
      }
      else{
       this.setState({
         userPrefs
       });
      }
   } catch (err) {
     log.err('loadUserPrefs', 'Error loading user preferences: ', err);
   }
  }

  userPrefsChanged = () => {
    this.loadUserPrefs();
  }

  getFakeUser = () => {
    const fakeUser: User = {
      UserId: "0000000000000000000000000000000000000000",
      Email: "t3v34v27245b47457b47@b47b34b7437b4b47b4.com",
      Password: "b347b3b8n36m35m5n63n3n5n8535n835m68m53m3",
      Username: "Guest",
      Role: "Basic",
      Status: 'Active',
      userPrefs: {
        hideQuantity: true,
        shouldCreateNewItemWhenCreateNewCategory: false,
      }
    }
    
    return fakeUser;
  }

  isLoggedCallback = async (value: boolean) => {
    this.setState({
      isLogged: value,
    });
  }

  redrawCallback = async () => {
    const newData: GroceryList|null = await storage.readGroceryList();
    if(newData === null)
    {
      log.err('app.redrawCallback',  'grocery list null');
      await storage.writeGroceryList({categories:  [], items: [], deletedCategories: [], deletedItems: []});
      this.setState({groceryList: {categories:  [], items: [], deletedCategories: [], deletedItems: []}});
    }
    else{
      const user = await storage.readUser();
      this.setState({groceryList: newData, user});
    }
  }

  render(): React.ReactNode {
    const { isLogged, userPrefs, user, groceryList } = this.state;

    return(
      <View style={styles.container}>
        {user !== null && <Table user={user} redrawCallback={this.redrawCallback} groceryList={groceryList} isLogged={isLogged} isLoggedCallback={this.isLoggedCallback} userPrefs={userPrefs} userPrefsChanged={this.userPrefsChanged}></Table>}
        <StatusBar backgroundColor={colors.bluedark} barStyle="light-content"/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bluedark,
    justifyContent: 'center',
  },
});

export default App;

