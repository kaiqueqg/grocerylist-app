import React from "react";
import { ScrollView, StyleSheet, Text, Pressable, View, TextInput } from "react-native";
import log from "../Log/Log";
import PressText from "../PressText/PressText";
import storage from "../Storage/Storage";
import { User, UserPrefs } from "../Types";
import { ThemePalette, colorPalette, dark } from "../Colors";

interface P{
  theme: ThemePalette,
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
        showOnlyItemText: false,
        theme: 'dark'
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

    if(userPrefs) {
      this.setState({
        userPrefs
      });
    }
    else{
      this.setState({
        userPrefs: {
          hideQuantity: false,
          shouldCreateNewItemWhenCreateNewCategory: false,
          showOnlyItemText: false,
          theme: 'dark',
        }
      })
    }
  }

  //!bad solution
  changeShould = () => {
    const newUserPrefs: UserPrefs = {
      ...this.state.userPrefs, 
      shouldCreateNewItemWhenCreateNewCategory: !this.state.userPrefs.shouldCreateNewItemWhenCreateNewCategory
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

  changeTheme = () => {
    let newTheme = 'dark';

    if(this.state.userPrefs.theme === 'white') newTheme = 'paper';
    else if(this.state.userPrefs.theme === 'paper') newTheme = 'dark';
    else if(this.state.userPrefs.theme === 'dark') newTheme = 'white';

    const newUserPrefs: UserPrefs = {
      ...this.state.userPrefs, theme: newTheme
    }
    
    storage.writeUserPrefs(newUserPrefs);
    this.setState({userPrefs: newUserPrefs});
    this.props.userPrefsChanged();
  }

  //!bad solution
  changeOnlyText = () => {
    const newUserPrefs: UserPrefs = {
      ...this.state.userPrefs, showOnlyItemText: !this.state.userPrefs.showOnlyItemText
    }
    
    storage.writeUserPrefs(newUserPrefs);
    this.setState({userPrefs: newUserPrefs});
    this.props.userPrefsChanged();
  }

  render(): React.ReactNode {
    const { user, userPrefs } = this.state;
    const { theme } = this.props;

    return(
      <ScrollView contentContainerStyle={styles(theme).contentContainer} style={styles(theme).userView}>
        <Text style={styles(theme).header}>USER:</Text>
        <View style={styles(theme).userContainer}>
          <View style={styles(theme).userView}>
            <Text style={styles(theme).userTextDef}>Email:</Text>
            <Text style={styles(theme).userText}>{user === null? "no user": user.Email}</Text>
          </View>
          <View style={styles(theme).userView}>
            <Text style={styles(theme).userTextDef}>Username:</Text>
            <Text style={styles(theme).userText}>{user === null? "no user": user.Username}</Text>
          </View>
          <View style={styles(theme).userView}>
            <Text style={styles(theme).userTextDef}>Role:</Text>
            <Text style={styles(theme).userText}>{user === null? "no user": user.Role}</Text>
          </View>
          <View style={styles(theme).userView}>
            <Text style={styles(theme).userTextDef}>Status:</Text>
            <Text style={styles(theme).userText}>{user === null? "no user": user.Status}</Text>
          </View>
        </View>
        <Text style={styles(theme).header}>SETTINGS:</Text>
        <View style={styles(theme).optionsView}>
          <PressText style={userPrefs.shouldCreateNewItemWhenCreateNewCategory? styles(theme).optionContainerOn:styles(theme).optionContainer} textStyle={userPrefs.shouldCreateNewItemWhenCreateNewCategory?styles(theme).optionsTextOn:styles(theme).optionsText} onPress={this.changeShould} text={'Create new Item new I create a new category.'}></PressText>
          <PressText style={userPrefs.hideQuantity?styles(theme).optionContainerOn:styles(theme).optionContainer} textStyle={userPrefs.hideQuantity?styles(theme).optionsTextOn:styles(theme).optionsText} onPress={this.changeHide} text={'Hide quantity.'}></PressText>
          <PressText style={userPrefs.showOnlyItemText?styles(theme).optionContainerOn:styles(theme).optionContainer} textStyle={userPrefs.showOnlyItemText?styles(theme).optionsTextOn:styles(theme).optionsText} onPress={this.changeOnlyText} text={'Show only item text.'}></PressText>
          <PressText style={styles(theme).optionContainerOn} textStyle={styles(theme).optionsTextOn} onPress={this.changeTheme} text={this.state.userPrefs.theme}></PressText>
        </View>
        <View style={styles(theme).logoutView}>
          <PressText text={'Logout'} textStyle={styles(theme).logoutButtonText} style={styles(theme).logoutButton} onPress={this.props.logout}></PressText>
        </View>
      </ScrollView>
    )
  }
}

const styles = (theme: ThemePalette) => StyleSheet.create({
  contentContainer:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.backgroundcolor,
  },
  header:{
    color: theme.textcolor,
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
  },
  userView: {
    flexDirection: 'row',
  },
  userTextDef:{
    flexGrow: 1,
    width: '50%',
    color: theme.textcolor,
  },
  userText: {
    flexGrow: 1,
    width: '50%',
    color: theme.textcolor,
  },
  optionsView: {
    flexGrow: 6,
    paddingTop: 10,
  },
  optionContainer:{
    flexDirection: 'row',
    margin: 3,
    borderStyle: "dashed",
    borderColor: theme.boxborderfade,
    borderRadius: 2,
    borderWidth: 1,
  },
  optionContainerOn:{
    flexDirection: 'row',
    margin: 3,
    borderStyle: "solid",
    borderColor: theme.boxborder,
    borderRadius: 2,
    borderWidth: 1,
  },
  optionsText: {
    margin: 10,
    color: theme.textcolorfade,
  },
  optionsTextOn: {
    margin: 10,
    color: theme.textcolor,
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
    backgroundColor: theme.logoutbuttonbk,
    padding: 10
  },
  logoutButtonText: {
    color: theme.backgroundcolor,
    fontSize: 18,
  },
});

export default UserView