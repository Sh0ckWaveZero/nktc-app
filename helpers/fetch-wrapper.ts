import getConfig from 'next/config';

import { userService } from '../services';

const { publicRuntimeConfig } = getConfig();

const get = async (url: RequestInfo) => {
  const requestOptions = {
    method: 'GET',
    headers: authHeader(url)
  };
  const res = await fetch(url, requestOptions).then(handleResponse);
  return res;
}

const post = async (url: RequestInfo, body: any) => {
  const requestOptions: any = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(url) },
    credentials: 'include',
    body: JSON.stringify(body)
  };
  const res = await fetch(url, requestOptions).then(handleResponse);
  return res;
}

const put = async (url: RequestInfo, body: any) => {
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(url) },
    body: JSON.stringify(body)
  };
  const res = await fetch(url, requestOptions).then(handleResponse);
  return res;
}

// prefixed with underscored because delete is a reserved word in javascript
const _delete = async (url: RequestInfo) => {
  const requestOptions = {
    method: 'DELETE',
    headers: authHeader(url)
  };
  const res = await fetch(url, requestOptions).then(handleResponse);
  return res;
}

// helper functions
const authHeader = (url: RequestInfo): any => {
  // return auth header with jwt if user is logged in and request is to the api url
  const user = userService.userValue;
  const isLoggedIn = user && user.token;
  const isApiUrl = url.toString().startsWith(publicRuntimeConfig.apiUrl);
  if (isLoggedIn && isApiUrl) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
}

const handleResponse = (response: any) => {
  return response?.text().then((text: any) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      if ([401, 403].includes(response.status) && userService.userValue) {
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        userService.logout();
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}


export const fetchWrapper = {
  get,
  post,
  put,
  delete: _delete
};
