import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, ToastAndroid } from "react-native";
import { Category, GroceryList, Item, LoginModel } from "../Types";


const storage = {

  randomId(){
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset.charAt(randomIndex);
    }
    return randomString;
  },

  async writeGroceryList(data: GroceryList){
    await AsyncStorage.setItem('@grocerylistapp:data', JSON.stringify(data));
  },
  
  async readGroceryList(){
    const data = await AsyncStorage.getItem('@grocerylistapp:data');
  
    if(data !== null){
      try {
        const parsedData: GroceryList = JSON.parse(data);
        return parsedData;
      } catch (err) {
        Alert.alert('Error while getting the saved. (Parsing json)');
      }
    }
  
    return null;
  },

  async readItemsOnCategory(id: string){
    const data: GroceryList|null = await this.readGroceryList();
    if(data !== null) {
      let items: Item[] = [];
      data.items.map((item) => { 
        if(item.myCategory === id) {
          items = [...items, item];
        }
      });
      return items;
    }
  },

  async insertItem(item: Item){
    const data: GroceryList|null = await  this.readGroceryList();

    if(data !== null){
      let uniqueItem: Item[] = data.items.filter((i) => i.text === item.text && i.id != item.id && i.myCategory === item.myCategory);

      if(uniqueItem.length === 0){
        data.items.push(item);
        this.writeGroceryList(data);
      }
      else{
        ToastAndroid.show('Item already exist!', ToastAndroid.SHORT);
      }
    }
    else{
      //TODO warn
    }
  },

  async insertCategory(category: Category){
    const data: GroceryList|null = await  this.readGroceryList();

    if(data !== null){
      let uniqueCategory: Category[] = data.categories.filter((c) => c.text === category.text && c.id != category.id);

      if(uniqueCategory.length === 0){
        data.categories.push(category);
        this.writeGroceryList(data);
      }
      else{
        ToastAndroid.show('Category already exist!', ToastAndroid.SHORT);
      }
    }
    else{
      //TODO warn
    }
  },

  async updateCategory(category: Category){
    const data: GroceryList|null = await this.readGroceryList();

    if(data !== null){
      let uniqueCategory: Category[] = data.categories.filter((c) => c.text === category.text && c.id != category.id);

      if(uniqueCategory.length === 0){
        const newData = data.categories.map((c) => {
          if(c.id === category.id){
            return category;
          }
          else{
            return c;
          }
        });
        this.writeGroceryList({...data, categories: newData });
      }
      else{
        ToastAndroid.show('Category already exist!', ToastAndroid.SHORT);
      }
    }
  },

  async updateItem(item: Item){
    const data: GroceryList|null = await this.readGroceryList();

    if(data !== null){
      let uniqueItem: Item[] = data.items.filter((i) => i.text === item.text && i.id != item.id && i.myCategory === item.myCategory);

      if(uniqueItem.length === 0){
        const newData = data.items.map((i) => {
          if(i.id == item.id){
            return item;
          }
          else{
            return i;
          }
        });
        this.writeGroceryList({...data, items: newData});
      }
      else{
        ToastAndroid.show('Item already exist!', ToastAndroid.SHORT);
      }
    }
  },

  async deleteCategory(categoryId: string) {
    const data: GroceryList|null = await this.readGroceryList();

    if (data !== null) {
        const newData = data.categories.filter((c) => c.id !== categoryId);
        this.writeGroceryList({ ...data, categories: newData });
    }
  },

  async deleteItem(itemId: string){
    const data: GroceryList|null = await this.readGroceryList();

    if (data !== null) {
        const newData = data.items.filter((i) => i.id !== itemId);
        this.writeGroceryList({ ...data, items: newData });
    }
  },
  
  async writeBaseUrl(baseUrl: string){
    await AsyncStorage.setItem('@grocerylistapp:baseurl', JSON.stringify(baseUrl));
  },
  
  async readBaseUrl(){
    try {
      const baseUrl = await AsyncStorage.getItem('@grocerylistapp:baseurl');
    
      if(baseUrl === null){
        //TODO what to do here? popup error? set a default and return default?
        return null;
      }
      else{
        const parsedBaseUrl: string = JSON.parse(baseUrl);
        return parsedBaseUrl;
      }
    } catch (err) {
      //TODO error pop up?
      return null
    }
  },
  
  async writeJwtToken(token: string){
    await AsyncStorage.setItem('@grocerylistapp:jwt', JSON.stringify(token));
  },
  
  async readJwtToken(){
    try {
      const loginModelJson = await AsyncStorage.getItem('@grocerylistapp:jwt');
    
      if(loginModelJson === null){
        //TODO what to do here? popup error? set a default and return default?
        return null;
      }
      else{
        const parsedLoginModel: LoginModel = JSON.parse(loginModelJson);
        return parsedLoginModel.token;
      }
    } catch (err) {
      //TODO error pop up?
      return null
    }
  },

  async deleteJwtToken(){
    try {
      await AsyncStorage.removeItem('@grocerylistapp:jwt');
    } catch (error) {
      //TODO some warning
    }
  },
}

export default storage;