export type ColorPalette = {
  bluedarkerdarker: string,
  bluedarker: string,
  bluedark: string,
  bluedarky: string,
  blue: string,
  bluelighty: string,
  bluelight: string,
  bluelightlight: string,

  beige: string,
  beigelightdark: string,
  beigedark: string,
  beigedarker: string,

  brown: string,
  brownlight: string,

  white: string,

  black: string,
  greydark: string,
  greydarky: string,
  grey: string,
  greylighty: string,
  greylight: string,
  greylighter: string,

  reddarker: string,
  reddark: string,
  red: string,
  redlight: string,
  redlightlight: string,

  greendarker: string,
  greendark: string,
  green: string,
  greenlight: string,

  yellowdark: string,
  yellow: string,
}

export const colorPalette: ColorPalette = {
  bluedarkerdarker: '#1D1D1D',
  bluedarker: '#21242B',
  bluedark: '#282C34',
  bluedarky: '#0D85FE',
  blue: '#689AFF',
  bluelighty: '#8BBEFF',
  bluelight: '#B0D3FE',
  bluelightlight: '#D6E4FD',

  beige: '#F5F5DC',
  beigelightdark: '#B9B9A0',
  beigedark: '#4B4B46',
  beigedarker: '#32322D',

  brown: '#D8AE7E',
  brownlight: '#E0DCB6',

  white: '#FFFFFF',
  black: '#000000',
  greydark: '#3A3A3A',
  greydarky: '#666666',
  grey: '#757575',
  greylighty: '#B0B0B0',
  greylight: '#CCCCCC',
  greylighter: '#E6E6E6',

  reddarker: '#A62121',
  reddark: '#FF0000',
  red: '#FE3A3B',
  redlight: '#FF6D6E',
  redlightlight: '#FEB9B8',

  greendarker: '#52A858',
  greendark: '#52A858',
  green: '#99CE99',
  greenlight: '#A8E3A8',
  
  yellowdark: '#CCC300',
  yellow: '#FFFFAA',
}

export type ThemePalette = {
  backgroundcolordarker: string,
  backgroundcolordark: string,
  backgroundcolor: string,

  lineonebk: string,
  linetwobk: string,

  textcolor: string,
  textcolorfade: string,

  boxborder: string,
  boxborderfade: string,

  loginbuttonbk: string,
  logoutbuttonbk: string,

  icontint: string,
  icontintfade: string,

  actionicontint: string,
  onlineicontint: string,
  inprogressicontint: string,
  offlineicontint: string,
};

export const dark: ThemePalette = {
  backgroundcolordarker: colorPalette.bluedarkerdarker,
  backgroundcolordark: colorPalette.bluedarker,
  backgroundcolor: colorPalette.bluedark,

  lineonebk: colorPalette.bluedark,
  linetwobk: colorPalette.bluedarker,

  textcolor: colorPalette.beige,
  textcolorfade: colorPalette.beigedark,

  boxborder: colorPalette.beige,
  boxborderfade: colorPalette.beigedark,

  loginbuttonbk: colorPalette.bluelight,
  logoutbuttonbk: colorPalette.redlightlight,

  icontint: colorPalette.beige,
  icontintfade: colorPalette.beigedark,

  actionicontint: colorPalette.bluedark,
  onlineicontint: colorPalette.green,
  inprogressicontint: colorPalette.yellow,
  offlineicontint: colorPalette.redlight,
};

export const paper: ThemePalette = {
  backgroundcolordarker: colorPalette.brown,
  backgroundcolordark: colorPalette.brownlight,
  backgroundcolor: colorPalette.beige,

  lineonebk: colorPalette.beige,
  linetwobk: colorPalette.brownlight,

  textcolor: colorPalette.bluedarkerdarker,
  textcolorfade: colorPalette.beigelightdark,

  boxborder: colorPalette.bluedarkerdarker,
  boxborderfade: colorPalette.beigelightdark,

  loginbuttonbk: colorPalette.brown,
  logoutbuttonbk: colorPalette.reddarker,

  icontint: colorPalette.bluedarkerdarker,
  icontintfade: colorPalette.beigelightdark,
  
  actionicontint: colorPalette.bluedark,
  onlineicontint: colorPalette.greendarker,
  inprogressicontint: colorPalette.yellowdark,
  offlineicontint: colorPalette.reddarker,
};

export const white: ThemePalette = {
  backgroundcolordarker: colorPalette.greylight,
  backgroundcolordark: colorPalette.greylighter,
  backgroundcolor: colorPalette.white,

  lineonebk: colorPalette.white,
  linetwobk: colorPalette.greylighter,

  textcolor: colorPalette.black,
  textcolorfade: colorPalette.greylight,

  boxborder: colorPalette.black,
  boxborderfade: colorPalette.greylight,

  loginbuttonbk: colorPalette.blue,
  logoutbuttonbk: colorPalette.redlight,

  icontint: colorPalette.black,
  icontintfade: colorPalette.greylight,
  
  actionicontint: colorPalette.bluedark,
  onlineicontint: colorPalette.greendark,
  inprogressicontint: colorPalette.yellowdark,
  offlineicontint: colorPalette.reddark,
};
