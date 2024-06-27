import { Breakpoints } from "../types";

export enum COLORS {
  categories = '#395895',
  white = '#ffffff',
  sidebar = '#f2f2f2',
  silver = '#aaaaaa',
  plotline = '#bbbbbb',
  monthBorder = '#dedede',
  lightGrey = '#cccccc',
  mediumGrey = '#999999',
  mainBackground = '#ebefe3',
  icon_default = '#666666',
  table = '#f6f7f9',
  today = '#2d72d2',
  text = '#444444',
  expense = '#990000',
  income = '#009900',
  logo = '#589539',
  ledgerEven = '#ecf3fe',
  ledgerHover = '#ddeedd',
};

export const BREAKPOINTS: Breakpoints = {
  large: { bottom: 1170, top: 3000 },
  medium: { bottom: 800, top: 1169 },
  small: { bottom: 0, top: 799 }
}

export const PAID_SYMBOL = 10003;
export const STAT_PLACEHOLDER = '&mdash;';
