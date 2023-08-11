import { Alert, ToastAndroid } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const log = {
  dev(text: string){
    console.log('[DEV] ' + text);
  },
  info(text: string){
    
  },
  warn(text: string){
    console.log('[ERROR] ' + text);
  },
  error(text: string){

  },
  pop(text: string|null|undefined){
    if(text !== '' && text !== null && text !== undefined) ToastAndroid.show(text, ToastAndroid.SHORT);
  },
  popp(text: string|null|undefined){
    if(text !== '' && text !== null && text !== undefined) ToastAndroid.show(text, ToastAndroid.LONG);
  },
  alert(text: string|null|undefined){
    if(text !== '' && text !== null && text !== undefined) Alert.alert(text);
  },
}


export default log;