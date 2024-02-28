import React from "react";
import { ScrollView, StyleSheet, Text, Pressable, View, TextInput } from "react-native";
import colors from "../Colors";
import log from "../Log/Log";
import PressText from "../PressText/PressText";
import storage from "../Storage/Storage";
import { User, UserPrefs } from "../Types";

interface P{
  logout: () => void,
  userPrefsChanged: () => void,
}

interface S{
  userPrefs: UserPrefs,
  email: string,
  username: string,
  password: string,
  user: User|null,
}

class UserView extends React.Component<P, S>{
  constructor(props: P){
    super(props);
    this.state ={
      userPrefs: {
        hideQuantity: false,
        shouldCreateNewItemWhenCreateNewCategory: false,
        
      },
      email: '',
      username: '',
      password: '',
      user: null,
    }

    this.loadUserPrefs();
    this.loadUser();
  }

  loadUser = async () => { 
    const user: User|null = await storage.readUser();

    if(user !== null) {
      this.setState({
        user
      });
    }
  }

  loadUserPrefs = async () => {
    const userPrefs: UserPrefs|null = await storage.readUserPrefs();

    if(userPrefs !== null) {
      this.setState({
        userPrefs
      });
    }
    else{
      this.setState({
        userPrefs: {
          hideQuantity: false,
          shouldCreateNewItemWhenCreateNewCategory: false,
        }
      })
    }
  }

  //!bad solution
  changeShould = () => {
    const newUserPrefs: UserPrefs = {
      ...this.state.userPrefs, shouldCreateNewItemWhenCreateNewCategory: !this.state.userPrefs.shouldCreateNewItemWhenCreateNewCategory
    }
    
    storage.writeUserPrefs(newUserPrefs);
    this.setState({userPrefs: newUserPrefs});
    this.props.userPrefsChanged();
  }

  //!bad solution
  changeHide = () => {
    const newUserPrefs: UserPrefs = {
      ...this.state.userPrefs, hideQuantity: !this.state.userPrefs.hideQuantity
    }
    
    storage.writeUserPrefs(newUserPrefs);
    this.setState({userPrefs: newUserPrefs});
    this.props.userPrefsChanged();
  }

  render(): React.ReactNode {
    const { user, userPrefs } = this.state;

    return(
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.userView}>
        <Text style={styles.header}>USER:</Text>
        <View style={styles.userContainer}>
          <View style={styles.userView}>
            <Text style={styles.userTextDef}>Email:</Text>
            <Text style={styles.userText}>{user === null? "no user": user.Email}</Text>
          </View>
          <View style={styles.userView}>
            <Text style={styles.userTextDef}>Username:</Text>
            <Text style={styles.userText}>{user === null? "no user": user.Username}</Text>
          </View>
          <View style={styles.userView}>
            <Text style={styles.userTextDef}>Role:</Text>
            <Text style={styles.userText}>{user === null? "no user": user.Role}</Text>
          </View>
          <View style={styles.userView}>
            <Text style={styles.userTextDef}>Status:</Text>
            <Text style={styles.userText}>{user === null? "no user": user.Status}</Text>
          </View>
        </View>
        <Text style={styles.header}>SETTINGS:</Text>
        <View style={styles.optionsView}>
          <PressText style={userPrefs.shouldCreateNewItemWhenCreateNewCategory? styles.optionContainerOn:styles.optionContainer} textStyle={userPrefs.shouldCreateNewItemWhenCreateNewCategory?styles.optionsTextOn:styles.optionsText} onPress={this.changeShould} text={'Create new Item new I create a new category.'}></PressText>
          <PressText style={userPrefs.hideQuantity?styles.optionContainerOn:styles.optionContainer} textStyle={userPrefs.hideQuantity?styles.optionsTextOn:styles.optionsText} onPress={this.changeHide} text={'Hide quantity.'}></PressText>
        </View>
        <View style={styles.logoutView}>
          <PressText text={'Logout'} textStyle={styles.logoutButtonText} style={styles.logoutButton} onPress={this.props.logout}></PressText>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  contentContainer:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header:{
    color: 'grey',
    fontSize: 30,
    paddingTop: 20,
    paddingLeft: 10,
    width: '100%',
  },
  userContainer: {
    flexGrow: 1,
    width: '100%',
    paddingLeft: 20,
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'green', 
  },
  userView: {
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: 'blue', 
  },
  userTextDef:{
    flexGrow: 1,
    width: '50%',
    color: 'beige',
  },
  userText: {
    flexGrow: 1,
    width: '50%',
    color: 'beige',
    // borderWidth: 1,
    //borderColor: 'grey',
  },
  optionsView: {
    flexGrow: 6,
    paddingTop: 10,
    //justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'yellow', 
  },
  optionContainer:{
    flexDirection: 'row',
    margin: 3,
    borderStyle: "dashed",
    borderColor: colors.beigedark,
    borderRadius: 2,
    borderWidth: 1,
  },
  optionContainerOn:{
    flexDirection: 'row',
    margin: 3,
    borderStyle: "solid",
    borderColor: colors.beige,
    borderRadius: 2,
    borderWidth: 1,
  },
  optionsText: {
    margin: 10,
    color: colors.beigedark,
  },
  optionsTextOn: {
    margin: 10,
    color: colors.beige,
  },
  logoutView:{
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    borderRadius: 2,
    alignItems: 'center',
    width: '80%',
    margin: 10,
    color: colors.beige,
    backgroundColor: colors.red,
    padding: 10
  },
  logoutButtonText: {
    fontSize: 18,
  },
});

export default UserView