import axios from 'axios';
import {replace} from './RootNavigation';
import * as constant from '../Utils/Constants';

const API = axios.create({
  baseURL: constant.baseUri.slice(0, -1),
  timeout: 100000,
  delayed: true,
});

// Add request interceptor
API.interceptors.request.use(request => {
  request.metadata = { startTime: new Date() };

  if (__DEV__) {
    // console.log('Starting Request', JSON.stringify(request, null, 2));
  }

  if (request.delayed) {
    return new Promise(resolve => setTimeout(() => resolve(request), 600));
  }

  return request;
});

// Add response interceptor to log time taken
API.interceptors.response.use(
  response => {
    const { startTime } = response.config.metadata;
    const endTime = new Date();
    const duration = endTime - startTime;

    if (__DEV__) {
      console.log(
        `✅ [Response Time]: ${duration} ms for ${response.config.url}`
      );
    }

    return response;
  },
  error => {
    if (error.config && error.config.metadata && error.response) {
      const { startTime } = error.config.metadata;
      const endTime = new Date();
      const duration = endTime - startTime;

      if (__DEV__) {
        console.log(
          `❌ [Error Time]: ${duration} ms for ${error.config.url}`
        );
      }
    }

    if (__DEV__) {
      console.log('Failed Request', JSON.stringify(error.response, null, 2));
    }

    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 401)
    ) {
      replace('login');
    }

    return Promise.reject(error);
  }
);

export default API;
