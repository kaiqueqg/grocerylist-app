import React from "react";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import colors from "../Colors";
import log from "../Log/Log";
import PressText from "../PressText/PressText";
import storage from "../Storage/Storage";
import { UserPrefs } from "../Types";

interface P{
  logout: () => void,
  userPrefsChanged: () => void,
}

interface S{
  userPrefs: UserPrefs,
}

class UserView extends React.Component<P, S>{
  constructor(props: P){
    super(props);
    this.state ={
      userPrefs: {
        hideQuantity: false,
        shouldCreateNewItemWhenCreateNewCategory: false,
      }
    }

    this.loadUserPrefs();
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
    const { userPrefs } = this.state;
    return(
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.userView}>
        <View style={styles.optionsView}>
          <PressText style={userPrefs.shouldCreateNewItemWhenCreateNewCategory? styles.optionContainerOn:styles.optionContainer} textStyle={userPrefs.shouldCreateNewItemWhenCreateNewCategory?styles.optionsTextOn:styles.optionsText} onPress={this.changeShould} text={'Create new Item new I create a new category.'}></PressText>
          <PressText style={userPrefs.hideQuantity?styles.optionContainerOn:styles.optionContainer} textStyle={userPrefs.hideQuantity?styles.optionsTextOn:styles.optionsText} onPress={this.changeHide} text={'Hide quantity.'}></PressText>
        </View>
        <View style={{width: '100%', alignItems: 'center'}}>
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
  userView: {
    flex: 1,
    flexDirection: "column",
    width: '100%',
  },
  optionsView: {
    flexGrow: 1,
    justifyContent: 'center',

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