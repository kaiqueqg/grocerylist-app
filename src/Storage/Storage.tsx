import AsyncStorage from "@react-native-async-storage/async-storage";
import log from "../Log/Log";
import { Category, GroceryList, Item, LoginModel, StorageInfo, User, UserPrefs } from "../Types";

type StorageKeys = {
  JwtToken: string,
  GroceryList: string,
  BaseUrl: string,
  DeletedItems: string,
  DeletedCategories: string,
  User: string,
  UserPrefs: string,
};

const keys: StorageKeys = {
  JwtToken: '@grocerylistapp:jwt',
  GroceryList: '@grocerylistapp:data',
  BaseUrl: '@grocerylistapp:baseurl',
  DeletedItems: '@grocerylistapp:deleteditems',
  DeletedCategories: '@grocerylistapp:deletedcategories',
  User: '@grocerylistapp:user',
  UserPrefs: '@grocerylistapp:userprefs',
};

const storage = {

  randomId(){
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < 40; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset.charAt(randomIndex);
    }
    return randomString;
  },

  async writeUser(user: User){
    try {
      await AsyncStorage.setItem(keys.User, JSON.stringify(user));
    } catch (err) {
      log.err('writeUser', 'catch] writing user.');
      return null;
    }
  },

  async readUser(){
    try {
      const user = await AsyncStorage.getItem(keys.User);
      log.dev('readUser', JSON.stringify(user));
      if(user !== null){
        try {
          const parsedUser: User = JSON.parse(user);
          return parsedUser;
        } catch (err) {
          log.err('readUser', 'Error parsing json');
        }
      }
      log.dev('readUser', 'returning null')
      return null;
    } catch (err) {
      log.err('readUser', '[catch] reading user.');
      return null;
    }
  },

  async deleteUser(){
    try {
      await AsyncStorage.removeItem(keys.User);
    } catch (error) {
      log.err('deleteUser', '[catch] deleting user.');
    }
  },

  async writeGroceryList(data: GroceryList){
    try {
      log.dev('writeGroceryList', 'data: ', data);
      await AsyncStorage.setItem(keys.GroceryList, JSON.stringify(data));
    } catch (err) {
      log.err('writeGroceryList', '[catch] writing grocery list.');
      return null;
    }
  },
  
  async readGroceryList(){
    try {
      const data = await AsyncStorage.getItem(keys.GroceryList);
      if(data !== null){
        try {
          const parsedData: GroceryList = JSON.parse(data);
          return parsedData;
        } catch (err) {
          log.err('readGroceryList', 'Error parsing json');
        }
      }
      log.dev('readGroceryList', 'returning null')
      return null;
    } catch (err) {
      log.err('readGroceryList', '[catch] reading grocery list.');
      return null;
    }
  },

  async deleteGroceryList(){
    try {
      await AsyncStorage.removeItem(keys.GroceryList);
    } catch (error) {
      log.err('deleteGroceryList', '[catch] deleting grocery list.');
    }
  },

  async readItemsOnCategory(userIdCategoryId: string){
    const data: GroceryList|null = await this.readGroceryList();
    if(data !== null) {
      let items: Item[] = [];
      data.items.map((item) => { 
        if(item.UserIdCategoryId === userIdCategoryId) {
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
      return i.ItemId !== item.ItemId && i.Text === item.Text && i.UserIdCategoryId === item.UserIdCategoryId
    });
    return undefined;
  },

  async insertItem(item: Item){
    const data: GroceryList|null = await this.readGroceryList();

    if(data !== null){
      let uniqueItem: Item[] = data.items.filter((i) => i.Text === item.Text && i.ItemId != item.ItemId && i.UserIdCategoryId === item.UserIdCategoryId);

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
      let uniqueCategory: Category[] = data.categories.filter((c) => c.Text === category.Text && c.CategoryId != category.CategoryId);

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
      let uniqueCategory: Category[] = data.categories.filter((c) => c.Text === category.Text && c.CategoryId != category.CategoryId);

      if(uniqueCategory.length === 0){
        const newData = data.categories.map((c) => {
          if(c.CategoryId === category.CategoryId){
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
      let uniqueItem: Item[] = data.items.filter((i) => i.Text === item.Text && i.ItemId != item.ItemId && i.UserIdCategoryId === item.UserIdCategoryId);

      if(uniqueItem.length === 0){
        const newData = data.items.map((i) => {
          if(i.ItemId == item.ItemId){
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
      log.err('writeDeletedItems', 'catching writing grocery list.');
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
          log.err('readDeletedItems', 'Error parsing json');
        }
      }
      return [];
    } catch (err) {
      log.err('readDeletedItems', '[catch] reading deleted items.');
      return null;
    }
  },

  async writeDeletedCategories(categories: Category[]){
    try {
      await AsyncStorage.setItem(keys.DeletedCategories, JSON.stringify(categories));
    } catch (err) {
      log.err('writeDeletedCategory', '[catch] writing grocery list.');
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
          log.err('readDeletedCategory', 'Error parsing json');
        }
      }
      return [];
    } catch (err) {
      log.err('readDeletedCategory', '[catch] reading deleted categories.');
      return null;
    }
  },

  async deleteDeletedCategories(){
    try {
      await AsyncStorage.removeItem(keys.DeletedCategories);
    } catch (error) {
      log.err('deleteDeletedCategories', '[catch] deleting deleted categories.');
    }
  },

  async deleteDeletedItems(){
    try {
      await AsyncStorage.removeItem(keys.DeletedItems);
    } catch (error) {
      log.err('deleteDeletedItems', '[catch] deleting deleted items.');
    }
  },

  async deleteCategory(categoryId: string) {
    const data: GroceryList|null = await this.readGroceryList();
    const deletedCategories: Category[]|null = await this.readDeletedCategory();

    if (data !== null) {
      const categoriesToBeDeleted: Category|undefined = data.categories.find((i) => i.CategoryId === categoryId);

      if(categoriesToBeDeleted !== undefined){
        if(deletedCategories !== null) {
          deletedCategories.push(categoriesToBeDeleted);
          this.writeDeletedCategories(deletedCategories);
        }

        const newData = data.categories.filter((category) => category.CategoryId !== categoriesToBeDeleted.CategoryId);
        this.writeGroceryList({ ...data, categories: newData });
      }
    }
  },

  async deleteItem(itemId: string){
    const data: GroceryList|null = await this.readGroceryList();
    const deletedItems: Item[]|null = await this.readDeletedItems();

    if (data !== null) {
      const itemToBeDeleted: Item|undefined = data.items.find((i) => i.ItemId === itemId);

      if(itemToBeDeleted !== undefined){
        if(deletedItems !== null) {
          deletedItems.push(itemToBeDeleted);
          this.writeDeletedItems(deletedItems);
        }

        const newData = data.items.filter((item) => item.ItemId !== itemToBeDeleted.ItemId);
        this.writeGroceryList({ ...data, items: newData });
      }
    }
  },
  
  async writeJwtToken(token: string){
    log.dev('writeJwtToken', 'token: ' + token);
    try {
      await AsyncStorage.setItem(keys.JwtToken, token);
    } catch (err) {
      log.dev('writeJwtToken', '[catch] error: ' + err);
      log.pop('Error getting saved login info.');
    }
  },
  
  async readJwtToken(){
    try {
      const token = await AsyncStorage.getItem(keys.JwtToken);
      if(token === null){
        return null;
      }
      else{
        return token;
      }
    } catch (err) {
      log.war('readJwtToken', '[catch] error: ' + err);
      return null
    }
  },

  async deleteJwtToken(){
    try {
      await AsyncStorage.removeItem(keys.JwtToken);
    } catch (error) {
      log.err('readJwtToken', '[catch] deleting jwt token.');
    }
  },

  async writeUserPrefs(userPrefs: UserPrefs){
    try{
      await AsyncStorage.setItem(keys.UserPrefs, JSON.stringify(userPrefs));
    } catch (err){
      log.err('writeUserPrefs', '[catch] writing user prefs.');
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
      log.err('readJwtToken', '[catch] reading jwt token.');
      return null
    }
  },
}

export default storage;