// class localStorageService.ts
export class LocalStorageService {
  // set token in local storage
  setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  // get token from local storage
  getToken() {
    // is used to check if the code is running on the server or client
    // if the code is running on the server, window will not be defined
    // so we need to check if window is defined or not
    // if window is not defined, we will return null
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
  }

  // remove token from local storage
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
}
