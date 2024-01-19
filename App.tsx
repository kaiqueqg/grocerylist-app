import React from 'react';
import { StyleSheet, View, StatusBar} from 'react-native';
import Table from './src/Table/Table';
import colors from './src/Colors';
import storage from './src/Storage/Storage';
import { User, UserPrefs } from './src/Types';
import log from './src/Log/Log';

interface Props{
}

interface States{
  isLogged: boolean,
  isServerUp: boolean,
  userPrefs: UserPrefs,
  user: User,
  token: string | null,
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      isLogged: false,
      isServerUp: true,
      user: { 
        UserId: storage.randomId(),
        Email: 'fake@fake.com',
        Username: 'Fake',
        Password: 'Fake',
        Role: 'Admin',
        Status: 'Active',
        userPrefs: {
          hideQuantity: true,
          shouldCreateNewItemWhenCreateNewCategory: false
        },
      },
      userPrefs: { hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false},
      token: null,
    }
  }

  componentDidMount(): void {
    this.loadLogin();
    this.loadUserPrefs();
  }

  userPrefsChanged = () => {
    this.loadUserPrefs();
  }

  loadLogin = async () => {
    try {
      const token = await storage.readJwtToken();
      this.setState({
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

  isLoggedCallback = (value: boolean) => {
    this.setState({
      isLogged: value
    });
  }

  render(): React.ReactNode {
    const { isLogged, userPrefs, user } = this.state;

    return(
      <View style={styles.container}>
        <Table user={user} isLogged={isLogged} isLoggedCallback={this.isLoggedCallback} userPrefs={userPrefs} userPrefsChanged={this.userPrefsChanged}></Table>
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

