import { Alert, ToastAndroid } from 'react-native';
import log from '../Log/Log';
import storage from '../Storage/Storage';
import { Category, GroceryList, Item } from '../Types';

const errorsWithMessageInResponse = [400, 401, 404, 409, 500, 503];

const request = async (url: string, endpoint: string, method: string, body?: string, fError?: () => void): Promise<any> => {
  const headers: {[key: string]: string} = {};
  headers['Content-Type'] = 'application/json';

  const token = await storage.readJwtToken();
  if(token !== null) headers['Authorization'] = "Bearer " + token;
  const controller = new AbortController();
  const { signal } = controller;

  //Abort it and "throw" error.
  const timeoutId = setTimeout(() => {
    controller.abort();
    if(fError != undefined) fError();
  }, 10000);

  //log.dev('request', url + endpoint, { headers, method, mode: 'cors', body: body, signal });
  try {
    const response = await fetch(url + endpoint, { headers, method, mode: 'cors', body: body, signal });

    //Don't need to abort it.
    clearTimeout(timeoutId);

    // If there was a response but not successful and it has a message, pop it
    if(response !== undefined && errorsWithMessageInResponse.includes(response.status)){
      const message = await response.text();
      //log.pop('asd' + message);
    }

    return response;
  } 
  catch (error){
    if(fError !== undefined){
      fError();
    }
    else {
      log.pop("Untreated error..." + error);
      log.dev("Error: " + error);
    }

    return undefined;
  }
}

export const identityApi = {
  async isUp(fError?: () => void): Promise<any>{
    return this.requestIdentity('/IsUp', 'GET', undefined, fError);
  },
  async login(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/Login', 'POST', body, fError);
  },
  async getUser(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/GetUser', 'GET', body, fError);
  },
  async getUserList(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/GetUserList', 'GET', body, fError);
  },
  async askToCreate(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/AskToCreate', 'POST', body, fError);
  },
  async requestIdentity(endpoint: string, method: string, body?: string, fError?: () => void): Promise<any>{
    return request('https://68m8rbceac.execute-api.sa-east-1.amazonaws.com/dev', endpoint, method, body, fError);
  },
}

export const grocerylistApi = {
  async isUp(fError?: () => void): Promise<any>{
    return this.requestGroceryList('/IsUp', 'GET', undefined, fError);
  },
  async getCategoryList(fError?: () => void): Promise<any>{
    return this.requestGroceryList('/GetCategoryList', 'GET', undefined, fError);
  },
  async getCategoryItemList(categoryId: string, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/GetCategoryItemList', 'POST', JSON.stringify({CategoryId: categoryId}), fError);
  },
  async getCategory(categoryId: string, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/GetCategory', 'POST', JSON.stringify({CategoryId: categoryId}), fError);
  },
  async putCategory(category: Category, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/PutCategory', 'PUT', JSON.stringify(category), fError);
  },
  async deleteCategory(categoryId: string, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/DeleteCategory', 'DELETE', JSON.stringify({CategoryId: categoryId}), fError);
  },
  async getItem(userIdCategoryId: string, itemId: string, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/GetItem', 'POST', JSON.stringify({UserIdCategoryId: userIdCategoryId, ItemId: itemId}), fError);
  },
  async putItem(item: Item, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/PutItem', 'PUT', JSON.stringify(item), fError);
  },
  async deleteItem(userIdCategoryId: string, itemId: string, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/DeleteItem', 'DELETE', JSON.stringify({UserIdCategoryId: userIdCategoryId, ItemId: itemId}), fError);
  },
  async getGroceryList(fError?: () => void): Promise<any>{
    return this.requestGroceryList('/GetGroceryList', 'GET', undefined, fError);
  },
  async syncGroceryList(groceryList: GroceryList, fError?: () => void): Promise<any>{
    log.dev('groceryList', groceryList);
    return this.requestGroceryList('/SyncGroceryList', 'PUT', JSON.stringify(groceryList), fError);
  },
  async requestGroceryList(endpoint: string, method: string, body?: string, fError?: () => void): Promise<any>{
    return request('https://soi7x4bjkc.execute-api.sa-east-1.amazonaws.com/dev', endpoint, method, body, fError);
  },
}