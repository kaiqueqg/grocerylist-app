import React from "react";
import { StyleSheet, TextInput, View, Pressable, Text, Image} from "react-native";
import colors from "../Colors";
import Loading from "../Loading/Loading";
import log from "../Log/Log";
import { identityApi } from "../Requests/RequestFactory";
import storage from '../Storage/Storage';
import { LoginModel, User, Response } from "../Types";
import UserView from "./UserView";

interface P{
  isLoggedCallback: (value: boolean) => void,
  userPrefsChanged: () => void,
  redrawCallback: () => void,
}

interface S{
  email: string,
  password: string,
  isLogging: boolean,
  isLogged: boolean,
}

class Login extends React.Component<P, S>{
  constructor(props: P){
    super(props);

    this.state = {
      email: '',
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

  handleEmailChange = (value: string) => {
    this.setState({
      email: value
    });
  }

  handlePasswordChange = (value: string) => {
    this.setState({
      password: value
    });
  }

  login = async () => {
    const { email: email, password: password } = this.state;
    
    const loginBody = { Email: email.trim(), Password: password.trim() };

    if(loginBody.Email === ""){
      log.pop("Type email to login!");
      return;
    }

    if(loginBody.Password === ""){
      log.pop("Type password to login!");
      return;
    }

    this.setState({ isLogging: true })
    try {
      const response = await identityApi.login(JSON.stringify(loginBody), async () => {
        const isUpResponse = await identityApi.isUp();
        if(isUpResponse !== undefined && isUpResponse.ok){
          log.pop("Server is up but login doesn't respond!");
        }
        else{
          log.pop("Server is down!");
        }
      });

      if(response !== undefined && response !== null) {
        const responseLoginModel: Response<LoginModel> = await response.json();
        if(responseLoginModel.Data !== null && responseLoginModel.Data !== undefined && responseLoginModel.Data.User !== undefined && responseLoginModel.Data.Token !== undefined){
          storage.writeUser(responseLoginModel.Data.User);
          storage.writeJwtToken(responseLoginModel.Data.Token);
          storage.writeUserPrefs(responseLoginModel.Data.User.userPrefs? responseLoginModel.Data.User.userPrefs:{hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false});
          this.props.isLoggedCallback(true);
          this.setState({ isLogged: true});
        }
        else{
          log.dev('login', responseLoginModel);
          log.pop(responseLoginModel.Message);
        }
      }
      else{
        log.dev('login', response);
        log.pop('Response of login was undefined or null.');
      }
    } 
    catch (err) {
      log.err('login', err);
      log.pop(`Login response "catch" error.`);
    }
    setTimeout(() => {
      this.setState({ isLogging: false });
    }, 1000); 
  }

  logout = async () => {
    await storage.deleteJwtToken();
    await storage.deleteGroceryList();
    this.props.isLoggedCallback(false);
    this.props.redrawCallback();

    this.setState({ isLogged: false });
  }

  render(): React.ReactNode {
    const { isLogged, isLogging } = this.state;
    
    return(
      <View style={styles.loggingContainer}>
        {isLogged?
        <UserView logout={this.logout} userPrefsChanged={this.props.userPrefsChanged}></UserView>
        :
        <React.Fragment>
          <Text style={styles.grocerylistText}>
            GROCERY LIST
          </Text>
          <TextInput placeholder="Email" placeholderTextColor={colors.placeholderTextColor} style={styles.emailpassword} onChangeText={this.handleEmailChange}></TextInput>
          <TextInput placeholder="Password" placeholderTextColor={colors.placeholderTextColor} style={styles.emailpassword} secureTextEntry={true} onChangeText={this.handlePasswordChange}></TextInput>
          {isLogging?
          <Loading style={{width: 30, height: 30, margin: 10}}></Loading>
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
  emailpassword: {
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