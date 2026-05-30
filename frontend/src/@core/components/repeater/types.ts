// ** React Imports
import type { ReactNode, ComponentType, JSX } from 'react';

export type RepeaterProps = {
  count: number;
  children(i: number): ReactNode;
  tag?: ComponentType | keyof JSX.IntrinsicElements;
};
