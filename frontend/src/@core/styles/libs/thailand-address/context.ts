import { createContext, useContext } from 'react';
import { DataSourceItem, useThailandAddressDataSource } from './use-thailand-addr';

/**
 * About Thailand address format
 * @see https://en.wikipedia.org/wiki/Thai_addressing_system#:~:text=With%20the%20exception%20of%20the,Road
 */
export type ThailandAddressValueType = {
  /**
   * @description tambon (ตำบล), khwaeng (แขวง)
   */
  subdistrict: string;

  /**
   * @description tambon (ตำบล), khwaeng (แขวง)
   */
  district: string;
  /**
   * @description changwat (จังหวัด)
   */
  province: string;
  postalCode: string;
};

export type ThailandAddressValue = ThailandAddressValueType;

export const ThailandAddressValueHelper = {
  empty: (): ThailandAddressValue => ({
    district: '',
    postalCode: '',
    province: '',
    subdistrict: '',
  }),
  fromDataSourceItem: (ds: DataSourceItem): ThailandAddressValue => {
    return {
      district: ds.d,
      postalCode: ds.po,
      province: ds.p,
      subdistrict: ds.s,
    };
  },
};

export type TypeaheadAddressContextData = {
  value: ThailandAddressValue;
  onValueChange?: (nextVal: ThailandAddressValue) => void;
  onInputFieldChange: (fieldName: keyof ThailandAddressValue, inputText: string) => void;
  searchByField: ReturnType<typeof useThailandAddressDataSource>['searchByField'];

  suggestionContainerElem: Element | null;
  setSuggestionContainerElem: (e: Element | null) => void;

  suggestions: DataSourceItem[];
  setSuggestions: (ds: DataSourceItem[]) => void;

  shouldDisplaySuggestion: boolean;
  setShouldDisplaySuggestion: (v: boolean) => void;

  highlightedItemIndex: number;
  setHighlightedItemIndex: (v: number) => void;
};

export const typeaheadAddressContext = createContext<TypeaheadAddressContextData | null>(null);

export function useAddressTypeaheadContext() {
  const ctx = useContext(typeaheadAddressContext);
  if (!ctx) {
    throw new Error('invalid context provider, make sure you place this component under ThailandAddressTypeahead');
  }
  return ctx;
}
