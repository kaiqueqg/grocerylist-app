import React from 'react';
import { StyleSheet, View, StatusBar} from 'react-native';
import Table from './src/Table/Table';
import storage from './src/Storage/Storage';
import { GroceryList, User, UserPrefs } from './src/Types';
import log from './src/Log/Log';
import { ThemePalette, dark, paper, white } from './src/Colors';

interface Props{
}

interface States{
  groceryList: GroceryList,
  isLogged: boolean,
  isServerUp: boolean,
  userPrefs: UserPrefs,
  user: User | null,
  token: string | null,
  theme: ThemePalette,
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);
    
    this.state = {
      groceryList: {categories: [], items: [], deletedCategories: [], deletedItems: []},
      isLogged: false,
      isServerUp: true,
      user: null,
      userPrefs: { hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false, showOnlyItemText: false, theme: 'white'},
      token: null,
      theme: white,
    }
  }

  componentDidMount(): void {
    this.loadLogin();
    this.loadUserPrefs();
    this.loadGroceryList();
    this.loadTheme();
  }
  
  loadTheme = async () => {
    const prefs = await storage.readUserPrefs();

    if (prefs) {
      if(prefs.theme === 'paper')
        this.setState({theme: paper});
      else if(prefs.theme === 'white')
        this.setState({theme: white});
      else 
        this.setState({theme: dark});
    }
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
      if(!userPrefs){
        const newPrefs = { 
          hideQuantity: false, 
          shouldCreateNewItemWhenCreateNewCategory: false,
          showOnlyItemText: false,
          theme: 'dark'
        };
        storage.writeUserPrefs(newPrefs);
        this.setState({ userPrefs: newPrefs });
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
    this.redrawCallback();
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
        showOnlyItemText: false,
        theme: 'dark',
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
    this.loadTheme();

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

  getContent = (): 'default' | 'light-content' | 'dark-content' => {
    const { userPrefs }= this.state;
    if(userPrefs.theme === 'dark') return 'light-content';
    if(userPrefs.theme === 'white') return 'dark-content';
    if(userPrefs.theme === 'paper') return 'dark-content';

    return 'dark-content';
  }

  render(): React.ReactNode {
    const { isLogged, userPrefs, user, groceryList, theme } = this.state;

    return(
      <View style={styles(theme).container}>
        {user !== null && 
          <Table theme={theme} user={user} redrawCallback={this.redrawCallback} groceryList={groceryList} isLogged={isLogged} isLoggedCallback={this.isLoggedCallback} userPrefs={userPrefs} userPrefsChanged={this.userPrefsChanged}></Table>
        }
        <StatusBar backgroundColor={theme.backgroundcolor} barStyle={this.getContent()}/>
      </View>
    )
  }
}

const styles = (theme: ThemePalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundcolor,
    justifyContent: 'center',
  },
});

export default App;

