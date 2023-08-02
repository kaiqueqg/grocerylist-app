import React from "react";
import { ToastAndroid } from "react-native";
import { StyleSheet, Alert, Button, TextInput, View, Pressable , Text } from "react-native";
import Toast from "react-native-toast-message";
import colors from "../Colors";
import Loading from "../Loading/Loading";
import request from '../Requests/RequestFactory';
import storage from '../Storage/Storage';
import { User } from "../Types";

interface Props{
  baseUrl: string,
  isLoggedCallback: (value: boolean) => void,
}

interface States{
  baseUrl: string,
  username: string,
  password: string,
  isLogging: boolean,
  isLogged: boolean,
}

class Login extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      baseUrl: this.props.baseUrl,
      username: '',
      password: '',
      isLogging: false,
      isLogged: false,
    };
  }

  componentDidMount(): void {
    this.checkIfLoggedIn();
  }

  checkIfLoggedIn = async () => {
    const token: string|null = await storage.readJwtToken();
    this.setState({
      isLogged: token !== null
    });
  }

  parseJwt = (token :string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  handleUsernameChange = (value: string) => {
    this.setState({
      username: value
    });
  }

  handlePasswordChange = (value: string) => {
    this.setState({
      password: value
    });
  }

  handleBaseUrlChange = (value: string) => {
    this.setState({
      baseUrl: value
    });
  }

  handleBaseUrlEnter = async () => {
    try {
      await storage.writeBaseUrl(this.state.baseUrl);
      
    } catch (err) {
      ToastAndroid.show("Error saving api url!", ToastAndroid.SHORT);
    }
  }

  login = () => {
    const { username, password } = this.state;
    
    if(username.trim() === ""){
      ToastAndroid.show("Type username to login!", ToastAndroid.SHORT);
      return;
    }

    if(password.trim() === ""){
      ToastAndroid.show("Type password to login!", ToastAndroid.SHORT);
      return;
    }

    const user: User = {
      username: username,
      password: password
    };

    const fetchData = async () => {
      this.setState({ isLogging: true })
      try {
        const response = await request(this.state.baseUrl + '/Login', 'POST', JSON.stringify(user), async () => {
          const isUpResponse = await request(this.state.baseUrl + '/IsUp', 'GET');

          if(isUpResponse !== undefined && isUpResponse.ok){
            ToastAndroid.show("Server is up but login doesn't!", ToastAndroid.SHORT);
          }
          else{
            ToastAndroid.show("Server is down!", ToastAndroid.SHORT);
          }
        });
        if(response !== undefined) {
          if(response.ok){
            const jsonData = await response.json();
            storage.writeJwtToken(jsonData);
            this.props.isLoggedCallback(true);

            this.setState({ isLogged: true});
          }
        }
      } catch (error) {
        Alert.alert('Error: ' + error);
      }
      setTimeout(() => {
      this.setState({ isLogging: false });
    }, 1000); 
    };
    fetchData();
  }

  logout = async () => {
    ToastAndroid.show('logout', ToastAndroid.SHORT);
    await storage.deleteJwtToken();
    this.props.isLoggedCallback(false);

    this.setState({ isLogged: false });
  }

  render(): React.ReactNode {
    const { isLogged } = this.state;

    return(
      <View style={styles.loggingContainer}>
        {isLogged? 
        <Pressable style={styles.logoutButton} onPress={this.logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
        :
        <React.Fragment>
          <Text style={styles.grocerylistText}>
            GROCERY LIST
          </Text>
          <TextInput placeholder={this.props.baseUrl} placeholderTextColor={colors.placeholderTextColor} style={styles.usernamepassword} onChangeText={this.handleBaseUrlChange} onSubmitEditing={this.handleBaseUrlEnter}></TextInput>
          <TextInput placeholder="Username" placeholderTextColor={colors.placeholderTextColor} style={styles.usernamepassword} onChangeText={this.handleUsernameChange}></TextInput>
          <TextInput placeholder="Password" placeholderTextColor={colors.placeholderTextColor} style={styles.usernamepassword} secureTextEntry={true} onChangeText={this.handlePasswordChange}></TextInput>
          <Pressable style={styles.loginButton} onPress={this.login}>
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>
        </React.Fragment>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loggingContainer:{
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
    alignItems: 'center'
  },
  grocerylistText: {
    fontSize: 25,
    marginBottom: 30,
    width: '90%',
    color: colors.beige,
    textAlign: 'center',
  },
  usernamepassword: {
    width: '90%',
    margin: 10,
    color: colors.beige,
    backgroundColor: colors.blue,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 2,
    padding: 10
  },
  loginButton: {
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    margin: 10,
    color: colors.beige,
    backgroundColor: colors.bluelight,
    padding: 10
  },
  loginButtonText: {
    fontSize: 18,
  },
  logoutButton: {
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    margin: 10,
    color: colors.beige,
    backgroundColor: colors.red,
    padding: 10
  },
  logoutButtonText: {
    fontSize: 18,
  },
});

export default Login;