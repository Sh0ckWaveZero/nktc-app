import { LocalStorageService } from '@/services/localStorageService';
import React, { ReactNode, createContext } from 'react';
import { LocalStorageValuesType } from './types';

const defaultProvider: LocalStorageValuesType = {
  getToken: () => null,
  removeToken: () => null,
  setToken: (token: string) => null,
};

const LocalStorageContext = createContext(defaultProvider);

type Props = {
  children: ReactNode;
};

const LocalStorageProvider = ({ children }: Props) => {
  const localStorageService = new LocalStorageService();

  const values = {
    getToken: () => localStorageService.getToken(),
    removeToken: () => localStorageService.removeToken(),
    setToken: (token: string) => localStorageService.setToken(token),
  };

  return <LocalStorageContext.Provider value={values}> {children} </LocalStorageContext.Provider>;
};

export { LocalStorageContext, LocalStorageProvider };
