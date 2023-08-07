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
  myCategory: string
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

export enum ItemsShown { Checked, Unchecked, Both }