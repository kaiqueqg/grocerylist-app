export interface GroceryList{
  categories: Category[]
  items: Item[]
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

export enum ItemsShown { Checked, Unchecked, Both }

export enum LogLevel { Dev, Warn, Error, None  }