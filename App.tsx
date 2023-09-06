import React from 'react';
import { StyleSheet, View, StatusBar} from 'react-native';
import Table from './src/Table/Table';
import colors from './src/Colors';
import storage from './src/Storage/Storage';
import { UserPrefs } from './src/Types';

interface Props{
}

interface States{
  isLogged: boolean,
  isServerUp: boolean,
  baseUrl: string,
  userPrefs: UserPrefs,
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      isLogged: false,
      isServerUp: true,
      baseUrl: '',
      userPrefs: { hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false}
    }
  }

  componentDidMount(): void {
    this.loadBaseUrl();
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
        isLogged: token !== null
      });
   } catch (err) {
     console.error('Error loading login: ', err);
   }
  }

  loadBaseUrl = async () => {
    try {
       const baseUrlFromKey = await storage.readBaseUrl();
       if(baseUrlFromKey === null){
        storage.writeBaseUrl('http://localhost:5000/api');
        this.setState({
          baseUrl: 'http://localhost:5000/api'
        });
       }
       else{
        this.setState({
          baseUrl: baseUrlFromKey
        });
       }
    } catch (err) {
      console.error('Error loading base url: ', err);
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
     console.error('Error loading user preferences: ', err);
   }
  }

  isLoggedCallback = (value: boolean) => {
    this.setState({
      isLogged: value
    });
  }

  render(): React.ReactNode {
    const { isLogged, baseUrl, userPrefs } = this.state;

    return(
      <View style={styles.container}>
        <Table baseUrl={baseUrl} isLogged={isLogged} isLoggedCallback={this.isLoggedCallback} userPrefs={userPrefs} userPrefsChanged={this.userPrefsChanged}></Table>
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

