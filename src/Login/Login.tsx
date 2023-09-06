import React from "react";
import { StyleSheet, TextInput, View, Pressable, Text, Image} from "react-native";
import colors from "../Colors";
import Loading from "../Loading/Loading";
import log from "../Log/Log";
import request from '../Requests/RequestFactory';
import storage from '../Storage/Storage';
import { LoginModel, User } from "../Types";
import UserView from "./UserView";

interface P{
  baseUrl: string,
  isLoggedCallback: (value: boolean) => void,
  userPrefsChanged: () => void,
}

interface S{
  baseUrl: string,
  isEditingBaseUrl: boolean,
  username: string,
  password: string,
  isLogging: boolean,
  isLogged: boolean,
}

class Login extends React.Component<P, S>{
  constructor(props: P){
    super(props);

    this.state = {
      baseUrl: this.props.baseUrl,
      isEditingBaseUrl: false,
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

  baseUrlDone = async () => {
    try {
      await storage.writeBaseUrl(this.state.baseUrl);

      this.setState({ isEditingBaseUrl: false });
    } catch (err) {
      log.pop("Error saving api url!");
    }
  }

  baseUrlCancel = () => {
    this.setState({ isEditingBaseUrl: false, baseUrl: this.props.baseUrl });
  }

  login = () => {
    const { username, password } = this.state;
    
    if(username.trim() === ""){
      log.pop("Type username to login!");
      return;
    }

    if(password.trim() === ""){
      log.pop("Type password to login!");
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
          const isUpResponse = await request(this.state.baseUrl + '/IsUp', 'GET', undefined, () => {});

          if(isUpResponse !== undefined && isUpResponse.ok){
            log.pop("Server is up but login doesn't!");
          }
          else{
            log.pop("Server is down!");
          }
        });
        if(response !== undefined) {
          if(response.ok){
            const jsonData: LoginModel = await response.json();
            storage.writeJwtToken(jsonData.token);
            storage.writeUserPrefs(jsonData.user?.userPrefs? jsonData.user?.userPrefs:{hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false});
            this.props.isLoggedCallback(true);

            this.setState({ isLogged: true});
          }
        }
      } catch (error) {
        log.error('[fetchData] Error: ' + error);
      }
      setTimeout(() => {
      this.setState({ isLogging: false });
    }, 1000); 
    };
    fetchData();
  }

  logout = async () => {
    log.pop('logout');
    await storage.deleteJwtToken();
    this.props.isLoggedCallback(false);

    this.setState({ isLogged: false });
  }

  baseUrlEdit = () => {
    this.setState({ isEditingBaseUrl: true });
  }

  render(): React.ReactNode {
    const { isLogged, isLogging, baseUrl, isEditingBaseUrl } = this.state;

    return(
      <View style={styles.loggingContainer}>
        {isLogged?
        <UserView logout={this.logout} userPrefsChanged={this.props.userPrefsChanged}></UserView>
        :
        <React.Fragment>
          <Text style={styles.grocerylistText}>
            GROCERY LIST
          </Text>
          {isEditingBaseUrl?
            <View style={styles.baseUrlTextInputContainer}>
              <TextInput style={styles.baseUrlTextInput} value={this.state.baseUrl} placeholder={this.props.baseUrl} placeholderTextColor={colors.placeholderTextColor} onChangeText={this.handleBaseUrlChange} onSubmitEditing={this.baseUrlDone}></TextInput>
              <Pressable style={styles.baseUrlDoneCancelButton} onPress={this.baseUrlDone}>
                <Image style={styles.baseUrlDoneCancelImage} source={require('../../public/images/done.png')}></Image>
              </Pressable>
              <Pressable style={styles.baseUrlDoneCancelButton} onPress={this.baseUrlCancel}>
                <Image style={styles.baseUrlDoneCancelImage} source={require('../../public/images/cancel.png')}></Image>
              </Pressable>
            </View>
            :
            <View style={styles.baseUrlTextInputContainer}>
              <Text style={styles.baseUrlText}>{baseUrl}</Text>
              <Pressable style={styles.baseUrlEditButton} onPress={this.baseUrlEdit}>
                <Image style={styles.baseUrlEditImage} source={require('../../public/images/edit.png')}></Image>
              </Pressable>
            </View>
          }
          <TextInput placeholder="Username" placeholderTextColor={colors.placeholderTextColor} style={styles.usernamepassword} onChangeText={this.handleUsernameChange}></TextInput>
          <TextInput placeholder="Password" placeholderTextColor={colors.placeholderTextColor} style={styles.usernamepassword} secureTextEntry={true} onChangeText={this.handlePasswordChange}></TextInput>
          {isLogging?
          <Loading></Loading>
          :
          <Pressable style={styles.loginButton} onPress={this.login}>
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>}
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
  baseUrlText: {
    width: '85%',
    color: colors.beige,
    padding: 10,
  },
  baseUrlTextInputContainer:{
    flexDirection: 'row',
    width: '90%',
    margin: 10,
    color: colors.beige,
  },
  baseUrlTextInput:{
    width: '70%',
    margin: 0,
    padding: 10,
    color: colors.beige,
    backgroundColor: colors.blue,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 2,
  },
  baseUrlDoneCancelImage: {
    width: 10,
    height: 10,
  },
  baseUrlEditImage:{
    width: 20,
    height: 20,
  },
  baseUrlEditButton:{
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '15%',
    padding: 10,
  },
  baseUrlDoneCancelButton: {
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '15%',
    padding: 10,
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
});

export default Login;