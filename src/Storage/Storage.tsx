import AsyncStorage from "@react-native-async-storage/async-storage";
import log from "../Log/Log";
import { Category, GroceryList, Item, LoginModel, StorageInfo, UserPrefs } from "../Types";

type StorageKeys = {
  JwtToken: string,
  GroceryList: string,
  BaseUrl: string,
  DeletedItems: string,
  DeletedCategories: string,
  UserPrefs: string,
};

const keys: StorageKeys = {
  JwtToken: '@grocerylistapp:jwt',
  GroceryList: '@grocerylistapp:data',
  BaseUrl: '@grocerylistapp:baseurl',
  DeletedItems: '@grocerylistapp:deleteditems',
  DeletedCategories: '@grocerylistapp:deletedcategories',
  UserPrefs: '@grocerylistapp:userprefs',
};

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
      await AsyncStorage.setItem(keys.GroceryList, JSON.stringify(data));
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

  async getItemWithSameText(item: Item){
    const data: GroceryList|null = await this.readGroceryList();

    if(data !== null) return data.items.find((i: Item) => 
    { 
      return i.id !== item.id && i.text === item.text && i.myCategory === item.myCategory
    });
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
        return uniqueItem[0];
      }
    }
  },

  async insertCategory(category: Category){
    const data: GroceryList|null = await  this.readGroceryList();

    if(data !== null){
      let uniqueCategory: Category[] = data.categories.filter((c) => c.text === category.text && c.id != category.id);

      if(uniqueCategory.length === 0){
        data.categories.unshift(category);
        this.writeGroceryList(data);
      }
      else{
        log.pop('Category already exist!');
      }
    }
  },

  async updateCategory(category: Category){
    const data: GroceryList|null = await this.readGroceryList();
    let info: StorageInfo<Category> = { ok: false };

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
        info = { ok: true };
      }
      else{
        info = { ok: false, msg: 'Category already exist!'};
      }
    }

    return info;
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

  async writeDeletedItems(items: Item[]){
    try {
      await AsyncStorage.setItem(keys.DeletedItems, JSON.stringify(items));
    } catch (err) {
      log.error('[writeDeletedItems] catching writing grocery list.');
      return null;
    }
  },

  async readDeletedItems(){
    try {
      const data = await AsyncStorage.getItem(keys.DeletedItems);
    
      if(data !== null){
        try {
          const parsedData: Item[] = JSON.parse(data);
          return parsedData;
        } catch (err) {
          log.error('[readDeletedItems] Error parsing json');
        }
      }
      return [];
    } catch (err) {
      log.error('[readDeletedItems] catching reading deleted items.');
      return null;
    }
  },

  async writeDeletedCategories(categories: Category[]){
    try {
      await AsyncStorage.setItem(keys.DeletedCategories, JSON.stringify(categories));
    } catch (err) {
      log.error('[writeDeletedCategory] catching writing grocery list.');
      return null;
    }
  },

  async readDeletedCategory(){ 
    try {
      const data = await AsyncStorage.getItem(keys.DeletedCategories);
    
      if(data !== null){
        try {
          const parsedData: Category[] = JSON.parse(data);
          return parsedData;
        } catch (err) {
          log.error('[readDeletedCategory] Error parsing json');
        }
      }
      return [];
    } catch (err) {
      log.error('[readDeletedCategory] catching reading deleted categories.');
      return null;
    }
  },

  async deleteDeletedCategories(){
    try {
      await AsyncStorage.removeItem(keys.DeletedCategories);
    } catch (error) {
      log.error('[deleteDeletedCategories] catching deleting deleted categories.');
    }
  },

  async deleteDeletedItems(){
    try {
      await AsyncStorage.removeItem(keys.DeletedItems);
    } catch (error) {
      log.error('[deleteDeletedItems] catching deleting deleted items.');
    }
  },

  async deleteCategory(categoryId: string) {
    const data: GroceryList|null = await this.readGroceryList();
    const deletedCategories: Category[]|null = await this.readDeletedCategory();

    if (data !== null) {
      const categoriesToBeDeleted: Category|undefined = data.categories.find((i) => i.id === categoryId);

      if(categoriesToBeDeleted !== undefined){
        if(deletedCategories !== null) {
          deletedCategories.push(categoriesToBeDeleted);
          this.writeDeletedCategories(deletedCategories);
        }

        const newData = data.categories.filter((category) => category.id !== categoriesToBeDeleted.id);
        this.writeGroceryList({ ...data, categories: newData });
      }
    }
  },

  async deleteItem(itemId: string){
    const data: GroceryList|null = await this.readGroceryList();
    const deletedItems: Item[]|null = await this.readDeletedItems();

    if (data !== null) {
      const itemToBeDeleted: Item|undefined = data.items.find((i) => i.id === itemId);

      if(itemToBeDeleted !== undefined){
        if(deletedItems !== null) {
          deletedItems.push(itemToBeDeleted);
          this.writeDeletedItems(deletedItems);
        }

        const newData = data.items.filter((item) => item.id !== itemToBeDeleted.id);
        this.writeGroceryList({ ...data, items: newData });
      }
    }
  },
  
  async writeBaseUrl(baseUrl: string){
    await AsyncStorage.setItem(keys.BaseUrl, JSON.stringify(baseUrl));
  },
  
  async readBaseUrl(){
    try {
      const baseUrl = await AsyncStorage.getItem(keys.BaseUrl);
    
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
      await AsyncStorage.setItem(keys.JwtToken, JSON.stringify(token));
    } catch (err) {
      log.error('[readJwtToken] catching writing jwt token.');
      log.pop('Error getting saved login info.');
    }
  },
  
  async readJwtToken(){
    try {
      const loginModelJson = await AsyncStorage.getItem(keys.JwtToken);
      if(loginModelJson === null){
        return null;
      }
      else{
        const parsedLoginModel: LoginModel = JSON.parse(loginModelJson);
        return parsedLoginModel;
      }
    } catch (err) {
      log.error('[readJwtToken] catching reading jwt token.');
      return null
    }
  },

  async deleteJwtToken(){
    try {
      await AsyncStorage.removeItem(keys.JwtToken);
    } catch (error) {
      log.error('[readJwtToken] catching deleting jwt token.');
    }
  },

  async writeUserPrefs(userPrefs: UserPrefs){
    try{
      await AsyncStorage.setItem(keys.UserPrefs, JSON.stringify(userPrefs));
    } catch (err){
      log.error('[writeUserPrefs] catching writing user prefs.');
      log.pop('Error getting user preferences.');
    }
  },

  async readUserPrefs(){
    try {
      const userPrefs = await AsyncStorage.getItem(keys.UserPrefs);
    
      if(userPrefs === null){
        return null;
      }
      else{
        const parsedUserPrefs: UserPrefs = JSON.parse(userPrefs);
        return parsedUserPrefs;
      }
    } catch (err) {
      log.error('[readJwtToken] catching reading jwt token.');
      return null
    }
  },
}

export default storage;