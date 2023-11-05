import { LocalStorageContext } from '@/context/LocalStorageContext';
import { useContext } from 'react';

export const useLocalStorage = () => useContext(LocalStorageContext);
