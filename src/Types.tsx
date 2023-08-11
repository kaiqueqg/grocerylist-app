export interface GroceryList{
  categories: Category[]
  items: Item[]
  deletedCategories: Category[]|null
  deletedItems: Item[]|null
}

export interface Category{
  id: string,
  text: string,
  isOpen: boolean
}

export interface Item{
  id: string,
  text: string,
  isChecked: boolean,
  myCategory: string,
  quantity: number,
  quantityUnit: string,
  goodPrice: string,
}

export interface User{
  id?: number,
  username: string,
  password?: string,
  email?: string,
  role?: string
}

export interface LoginModel{
  user?: User,
  token: string,
  errorMessage: string
}

export interface StorageInfo<T>{
  ok: boolean,
  msg?: string,
  data?: T,
}

export enum ItemsShown { Checked, Unchecked, Both }