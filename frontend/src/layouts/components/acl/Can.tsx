import { createContext } from 'react';
import { AnyAbility } from '@casl/ability';
import { createContextualCan } from '@casl/react';

export const AbilityContext = createContext<AnyAbility>(undefined!);

// @ts-expect-error - React 19 compatibility issue with CASL
export default createContextualCan(AbilityContext.Consumer);
