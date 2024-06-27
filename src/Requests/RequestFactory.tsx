import { Alert, ToastAndroid } from 'react-native';
import log from '../Log/Log';
import storage from '../Storage/Storage';
import { Category, GroceryList, Item, LoginModel, Response } from '../Types';

const errorsWithMessageInResponse = [400, 401, 404, 409, 500, 503];

const request = async (url: string, endpoint: string, method: string, body?: string, fError?: () => void): Promise<any> => {
  const headers: {[key: string]: string} = {};
  headers['Content-Type'] = 'application/json';

  const token = await storage.readJwtToken();
  if(token !== null) headers['Authorization'] = "Bearer " + token;
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => {
    controller.abort();
    if(fError != undefined) fError();
  }, 10000);

  try {
    const response = await fetch(url + endpoint, { headers, method, mode: 'cors', body: body, signal });
    clearTimeout(timeoutId);

    if(response !== undefined && errorsWithMessageInResponse.includes(response.status)){
      const message = await response.text();
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
  async isUp(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/IsUp', 'GET', body, fError);
  },
  async login(body?: string, fError?: () => void): Promise<LoginModel|null>{
    return this.requestIdentity<LoginModel|null>('/Login', 'POST', body, fError);
  },
  async getUser(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/GetUser', 'GET', body, fError);
  },
  async askToCreate(body?: string, fError?: () => void): Promise<any>{
    return this.requestIdentity('/AskToCreate', 'POST', body, fError);
  },
  async requestIdentity<T>(endpoint: string, method: string, body?: string, fError?: () => void): Promise<T|null>{
    try {
      const resp = await request('https://68m8rbceac.execute-api.sa-east-1.amazonaws.com/dev', endpoint, method, body, fError);

      if(resp){
        const respData: Response<T> = await resp.json();
        if(!respData.WasAnError && respData.Data){
          return respData.Data;
        }
        else{
          log.dev('Response data:', respData)
          log.pop(respData.Message);
        }
      }
    } catch (err) {
      log.err('Error: ', endpoint, err);
    }
    return null;
  },
}

export const grocerylistApi = {
  async isUp(fError?: () => void): Promise<any>{
    return this.requestGroceryList('/IsUp', 'GET', undefined, fError);
  },
  async getCategoryList(fError?: () => void): Promise<Response<Category[]>>{
    return this.requestGroceryList('/GetCategoryList', 'GET', undefined, fError);
  },
  async getCategoryItemList(categoryId: string, fError?: () => void): Promise<Response<Item[]>>{
    return this.requestGroceryList('/GetCategoryItemList', 'POST', JSON.stringify({CategoryId: categoryId}), fError);
  },
  async getCategory(categoryId: string, fError?: () => void): Promise<Response<Category>>{
    return this.requestGroceryList('/GetCategory', 'POST', JSON.stringify({CategoryId: categoryId}), fError);
  },
  async putCategory(category: Category, fError?: () => void): Promise<Response<Category>>{
    return this.requestGroceryList('/PutCategory', 'PUT', JSON.stringify(category), fError);
  },
  async deleteCategory(categoryId: string, fError?: () => void): Promise<Response<boolean>>{
    return this.requestGroceryList('/DeleteCategory', 'DELETE', JSON.stringify({CategoryId: categoryId}), fError);
  },
  async getItem(userIdCategoryId: string, itemId: string, fError?: () => void): Promise<Response<Item>>{
    return this.requestGroceryList('/GetItem', 'POST', JSON.stringify({UserIdCategoryId: userIdCategoryId, ItemId: itemId}), fError);
  },
  async putItem(item: Item, fError?: () => void): Promise<Response<Item>>{
    return this.requestGroceryList('/PutItem', 'PUT', JSON.stringify(item), fError);
  },
  async deleteItem(userIdCategoryId: string, itemId: string, fError?: () => void): Promise<Response<boolean>>{
    return this.requestGroceryList('/DeleteItem', 'DELETE', JSON.stringify({UserIdCategoryId: userIdCategoryId, ItemId: itemId}), fError);
  },
  async getGroceryList(fError?: () => void): Promise<Response<GroceryList>>{
    return this.requestGroceryList('/GetGroceryList', 'GET', undefined, fError);
  },
  async syncGroceryList(groceryList: GroceryList, fError?: () => void): Promise<any>{
    return this.requestGroceryList('/SyncGroceryList', 'PUT', JSON.stringify(groceryList), fError);
  },
  async requestGroceryList(endpoint: string, method: string, body?: string, fError?: () => void): Promise<any>{
    try {
      const resp = await request('https://soi7x4bjkc.execute-api.sa-east-1.amazonaws.com/dev', endpoint, method, body, fError);

      if(resp){
        const respData: Response<any> = await resp.json();
        if(!respData.WasAnError && respData.Data){
          return respData.Data;
        }
        else{
          log.dev('Response data:', respData)
        }
      }
    } catch (err) {
      log.err('Error: ', endpoint, err);
    }
    return null;
  },
}