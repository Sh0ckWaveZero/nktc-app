import { BehaviorSubject } from 'rxjs';
import getConfig from 'next/config';
import Router from 'next/router'

import { fetchWrapper } from '@/helpers/index';
import { SignInAction } from '@/store/slices/userSlice';

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/users`;
const userSubject = new BehaviorSubject(
    typeof window !== 'undefined' &&
    JSON.parse(localStorage.getItem('user') || '{}')
);

const login = async (credential: SignInAction) => {
    console.log(credential);
    const user = await fetchWrapper.post(`${baseUrl}/authenticate`, credential);
    console.log(user);
    // publish user to subscribers and store in local storage to stay logged in between page refreshes
    userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
}

const logout = () => {
    // remove user from local storage, publish null to user subscribers and redirect to login page
    console.log('logout');
    localStorage.removeItem('user');
    userSubject.next(null);
    Router.push('/login');
}

const getAll = () => {
    return fetchWrapper.get(baseUrl);
}

export const userService = {
    user: userSubject.asObservable(),
    get userValue() { return userSubject.value },
    login,
    logout,
    getAll
};