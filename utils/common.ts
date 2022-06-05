export const isEmpty = obj => [Object, Array].includes((obj || {}).constructor) && !Object.entries((obj || {})).length;

export const isClient = () => typeof window !== 'undefined';

export const isServer = () => typeof window === 'undefined';