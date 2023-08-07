import { Alert, ToastAndroid } from 'react-native';
import log from '../Log/Log';
import storage from '../Storage/Storage';

const errorsWithMessageInResponse = [400, 401, 404, 409, 500, 503];

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

  const controller = new AbortController();
  const { signal } = controller;

  //Abort it and "throw" error.
  const timeoutId = setTimeout(() => {
    controller.abort();
    if(fError != undefined) fError();
  }, 2000);

  try {
    const response = await fetch(endpoint, { headers, method, mode: 'cors', body: body, signal });

    //Don't need to abort it.
    clearTimeout(timeoutId);

    // If there was a response but not successful and it has a message, pop it
    if(response !== undefined && errorsWithMessageInResponse.includes(response.status)){
      const message = await response.text();
      log.pop(message);
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

export default request;