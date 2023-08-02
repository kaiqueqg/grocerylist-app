import React from 'react';
import { Alert, Button, StyleSheet, Text, View, StatusBar, Pressable, Image, ToastAndroid } from 'react-native';
import Table from './src/Table/Table';
import Login from './src/Login/Login';
import Loading from './src/Loading/Loading';
import colors from './src/Colors';
import storage from './src/Storage/Storage';

interface Props{
}

interface States{
  isLogged: boolean,
  isServerUp: boolean,
  baseUrl: string
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      isLogged: false,
      isServerUp: true,
      baseUrl: ''
    }
  }

  componentDidMount(): void {
    this.loadBaseUrl();
    this.loadLogin();
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

  isLoggedCallback = (value: boolean) => {
    this.setState({
      isLogged: value
    });
  }

  render(): React.ReactNode {
    const { isLogged, baseUrl } = this.state;

    return(
      <View style={styles.container}>
        <Table baseUrl={baseUrl} isLogged={isLogged} isLoggedCallback={this.isLoggedCallback}></Table>
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

