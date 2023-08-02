import { Alert, ToastAndroid } from 'react-native';
import storage from '../Storage/Storage';

const errors = [400, 401, 404, 409, 500, 503];

async function request(
  endpoint: string, 
  method: string, 
  body?: string,
  fError?: () => void): Promise<any>
{
  const headers: {[key: string]: string} = {};
  headers['Content-Type'] = 'application/json';

  const token = await storage.readJwtToken();
  if(token !== null){
    headers['Authorization'] = "Bearer " + token;
  }

  try {
    const response = await fetch(endpoint, {
      headers,
      method,
      mode: 'cors',
      body: body
    });
    if(response !== undefined && errors.includes(response.status)){
      const message = await response.text();
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }

    return response;
  } catch (error) {
    if(fError !== undefined) fError();
    else ToastAndroid.show("Untreated error..." + error, ToastAndroid.SHORT);
    return undefined;
  }
}

export default request;