import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import log from "../Log/Log";
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
    try {
      await AsyncStorage.setItem('@grocerylistapp:data', JSON.stringify(data));
    } catch (err) {
      log.error('[writeGroceryList] catching writing grocery list.');
      return null;
    }
  },
  
  async readGroceryList(){
    try {
      const data = await AsyncStorage.getItem('@grocerylistapp:data');
    
      if(data !== null){
        try {
          const parsedData: GroceryList = JSON.parse(data);
          return parsedData;
        } catch (err) {
          log.error('[readGroceryList] Error parsing json');
        }
      }
      log.dev('[readGroceryList] returning null')
      return null;
    } catch (err) {
      log.error('[readGroceryList] catching reading grocery list.');
      return null;
    }
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

  async getItemWithSameText(text: string, myCategory: string){
    const data: GroceryList|null = await this.readGroceryList();

    if(data !== null) return data.items.find((item: Item) => { return item.text === text && item.myCategory === myCategory });
    return undefined;
  },

  async insertItem(item: Item){
    const data: GroceryList|null = await this.readGroceryList();

    if(data !== null){
      let uniqueItem: Item[] = data.items.filter((i) => i.text === item.text && i.id != item.id && i.myCategory === item.myCategory);

      if(uniqueItem.length === 0){
        data.items.push(item);
        this.writeGroceryList(data);
      }
      else{
        log.pop('Item already exist!');
      }
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
        log.pop('Category already exist!');
      }
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
        log.pop('Category already exist!');
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
        log.pop('Item already exist!');
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
        log.dev('[readBaseUrl] no base url, setting default');
        return 'http://localhost:5000/api';
      }
      else{
        const parsedBaseUrl: string = JSON.parse(baseUrl);
        return parsedBaseUrl;
      }
    } catch (err) {
      log.error('[readBaseUrl] catching reading base url.');
      log.pop('Error reading base url.');
      return 'http://localhost:5000/api';
    }
  },
  
  async writeJwtToken(token: string){
    try {
      await AsyncStorage.setItem('@grocerylistapp:jwt', JSON.stringify(token));
    } catch (err) {
      log.error('[readJwtToken] catching writing jwt token.');
      log.pop('Error getting saved login info.');
    }
  },
  
  async readJwtToken(){
    try {
      const loginModelJson = await AsyncStorage.getItem('@grocerylistapp:jwt');
    
      if(loginModelJson === null){
        return null;
      }
      else{
        const parsedLoginModel: LoginModel = JSON.parse(loginModelJson);
        return parsedLoginModel.token;
      }
    } catch (err) {
      log.error('[readJwtToken] catching reading jwt token.');
      return null
    }
  },

  async deleteJwtToken(){
    try {
      await AsyncStorage.removeItem('@grocerylistapp:jwt');
    } catch (error) {
      log.error('[readJwtToken] catching deleting jwt token.');
    }
  },
}

export default storage;