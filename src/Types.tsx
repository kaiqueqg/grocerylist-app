export interface GroceryList{
  categories: Category[]|null
  items: Item[]|null
  deletedCategories: Category[]|null
  deletedItems: Item[]|null
}

export interface Category{
  UserId: string,
  CategoryId: string,
  Text: string,
  IsOpen: boolean
}

export interface Item{
  UserIdCategoryId: string,
  ItemId: string,
  Text: string,
  IsChecked: boolean,
  Quantity: number,
  QuantityUnit: string,
  GoodPrice: string,
}

export interface User{
  UserId: string,
  Email: string
  Username: string,
  Password: string,
  Role: string,
  Status: string,
  userPrefs: UserPrefs,
}

export interface UserPrefs{
  shouldCreateNewItemWhenCreateNewCategory: boolean,
  hideQuantity: boolean,
}

export interface LoginModel{
  User?: User,
  Token: string,
  ErrorMessage: string
}

export interface StorageInfo<T>{
  ok: boolean,
  msg?: string,
  data?: T,
}

export interface Response<T> {
  Data?: T,
  Message?: string,
  Exception?: string,
  WasAnError: boolean,
  Code?: number,
}

export const Codes = {
  OK: 200,
  Created: 201,
  Accepted: 202,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
}

export enum ItemsShown { Checked, Unchecked, Both }

export enum LogLevel { Dev, Warn, Error, None  }