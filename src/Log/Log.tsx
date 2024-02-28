import { Alert, ToastAndroid } from "react-native";
import { LogLevel } from "../Types";

const currentLogLevel = LogLevel.Dev;

const log = {
  dev(method: string, ...texts: any[]) {
    if (currentLogLevel <= LogLevel.Dev) {
      const formattedTexts = texts.map(text => {
        if (text !== null && typeof text === 'object' && !Array.isArray(text)) {
          return JSON.stringify(text, null, 2); //if object, prettyfy
        } else {
          return text;
        }
      });
  
      console.log(`[DEV] [${method}]`, ...formattedTexts);
    }
  },
  war(method: string, ...texts: any[]){
    if (currentLogLevel <= LogLevel.Warn) {
      const formattedTexts = texts.map(text => {
        if (text !== null && typeof text === 'object' && !Array.isArray(text)) {
          return JSON.stringify(text, null, 2); //if object, prettyfy
        } else {
          return text;
        }
      });
  
      console.log(`[WAR] [${method}]`, ...formattedTexts);
    }
  },
  err(method: string, ...texts: any[]){
    if (currentLogLevel <= LogLevel.Error) {
      const formattedTexts = texts.map(text => {
        if (text !== null && typeof text === 'object' && !Array.isArray(text)) {
          return JSON.stringify(text, null, 2); //if object, prettyfy
        } else {
          return text;
        }
      });
  
      console.log(`[ERR] [${method}]`, ...formattedTexts);
    }
  },
  pop(text: string|null|undefined){
    if(text !== '' && text !== null && text !== undefined) ToastAndroid.show(text, ToastAndroid.SHORT);
  },
  poop(text: string|null|undefined){
    if(text !== '' && text !== null && text !== undefined) ToastAndroid.show(text, ToastAndroid.LONG);
  },
  alert(text: string|null|undefined){
    if(text !== '' && text !== null && text !== undefined) Alert.alert(text);
  },
}

export default log;