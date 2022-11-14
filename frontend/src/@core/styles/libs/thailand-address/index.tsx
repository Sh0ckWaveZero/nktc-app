import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ThailandAddressValue,
  typeaheadAddressContext,
  TypeaheadAddressContextData,
  useAddressTypeaheadContext,
} from './context';
import { DataSourceItem, useThailandAddressDataSource } from './use-thailand-addr';

const fieldMap: {
  [key in keyof ThailandAddressValue]: 'd' | 's' | 'p' | 'po';
} = {
  district: 'd',
  province: 'p',
  postalCode: 'po',
  subdistrict: 's',
};

type SuggestionPanelPropTypes = {
  ds: DataSourceItem[];
  shouldVisible: boolean;
  onDataSourceItemSelected?: (ds: ThailandAddressValue) => void;
  containerProps?: JSX.IntrinsicElements['ul'];
  optionItemProps?: JSX.IntrinsicElements['li'];
  highlightedItemIndex?: number;
  onOptionMouseEnter?: (i: number) => void;
};
const SuggestionPanel = ({
  ds,
  shouldVisible,
  onDataSourceItemSelected,
  containerProps,
  optionItemProps,
  highlightedItemIndex,
  onOptionMouseEnter,
}: SuggestionPanelPropTypes) => {
  const onClick = (i: number) => (evt: React.MouseEvent) => {
    evt.stopPropagation();
    onDataSourceItemSelected?.(ThailandAddressValue.fromDataSourceItem(ds[i]));
  };
  const onOptionMouseEnterCallback = (i: number) => () => {
    onOptionMouseEnter?.(i);
  };
  if (!shouldVisible) {
    return null;
  }
  if (ds.length === 0) {
    return null;
  }
  return (
    <ul {...containerProps}>
      {ds.map((d, i) => {
        return (
          <li
            {...optionItemProps}
            className={`${highlightedItemIndex === i ? 'highlighted ' : ''}${optionItemProps?.className || ''}`}
            onMouseDown={onClick(i)}
            onMouseEnter={onOptionMouseEnterCallback(i)}
            key={d.po + '_' + i}
          >{`${d.s} ${d.d} ${d.p} ${d.po}`}</li>
        );
      })}
    </ul>
  );
};

const AddressInputField = (fieldName: keyof ThailandAddressValue) => {
  const InputComponent = (
    innerProps: Omit<JSX.IntrinsicElements['input'], 'value' | 'onChange'> & {
      containerProps?: JSX.IntrinsicElements['div'];
    },
  ) => {
    const {
      value,
      searchByField,
      onInputFieldChange,
      setSuggestions,
      suggestions,
      setShouldDisplaySuggestion,
      setSuggestionContainerElem,
      setHighlightedItemIndex,
      highlightedItemIndex,
      onValueChange,
    } = useAddressTypeaheadContext();
    const onInputChange = useCallback(
      (evt: React.ChangeEvent<HTMLInputElement>) => {
        onInputFieldChange(fieldName, evt.currentTarget.value);
        if (!evt.currentTarget.value) {
          setSuggestions([]);
          return;
        }
        setSuggestions(searchByField(fieldMap[fieldName], evt.currentTarget.value));
        setHighlightedItemIndex(-1);
      },
      [onInputFieldChange, searchByField, setSuggestions, setHighlightedItemIndex],
    );

    const suggestPanelContainerRef = useRef<HTMLDivElement>(null);

    const onKeydown = useCallback(
      (evt: React.KeyboardEvent) => {
        if (evt.key === 'Escape') {
          return setShouldDisplaySuggestion(false);
        } else if (evt.key === 'ArrowUp') {
          return setHighlightedItemIndex(highlightedItemIndex > 0 ? highlightedItemIndex - 1 : 0);
        } else if (evt.key === 'ArrowDown') {
          return setHighlightedItemIndex(
            highlightedItemIndex < suggestions.length - 1 ? highlightedItemIndex + 1 : suggestions.length - 1,
          );
        } else if (evt.key === 'Enter') {
          onValueChange?.(ThailandAddressValue.fromDataSourceItem(suggestions[highlightedItemIndex]));
          return setShouldDisplaySuggestion(false);
        }
      },
      [setShouldDisplaySuggestion, setHighlightedItemIndex, highlightedItemIndex, suggestions, onValueChange],
    );
    const onBlur = useCallback(() => {
      setShouldDisplaySuggestion(false);
    }, [setShouldDisplaySuggestion]);
    const onFocus = useCallback(() => {
      setShouldDisplaySuggestion(true);
      setSuggestionContainerElem(suggestPanelContainerRef.current);
    }, [setShouldDisplaySuggestion, setSuggestionContainerElem]);

    const { containerProps, ...inputProps } = innerProps;

    return (
      <div {...containerProps}>
        <input
          {...inputProps}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={onInputChange}
          value={value[fieldName]}
          onKeyDown={onKeydown}
          className={inputProps.className}
        />
        <div ref={suggestPanelContainerRef} />
      </div>
    );
  };
  InputComponent.displayName = fieldName + 'InputField';

  return InputComponent;
};

export type ThailandAddressTypeaheadPropTypes = {
  value?: ThailandAddressValue;
  onValueChange?: (nextVal: ThailandAddressValue) => void;
  children: React.ReactNode;

  /**
   * custom dataSource will replace the default dataSource
   * @see DataSourceItem to provide a right format
   */
  dataSource?: DataSourceItem[];
};

export const ThailandAddressTypeahead = ({
  children,
  value,
  onValueChange,
  dataSource,
}: ThailandAddressTypeaheadPropTypes) => {
  const [suggestions, setSuggestions] = useState<DataSourceItem[]>([]);
  const { searchByField } = useThailandAddressDataSource(dataSource);
  const [suggestionContainerElem, setSuggestionContainerElem] = useState<Element | null>(null);
  const [shouldDisplaySuggestion, setShouldDisplaySuggestion] = useState(false);
  const [highlightedItemIndex, setHighlightedItemIndex] = useState(0);

  const onInputFieldChange = useCallback(
    (fieldName: keyof ThailandAddressValue, inputValue: string) => {
      const nextVal = value ? { ...value } : ThailandAddressValue.empty();
      nextVal[fieldName] = inputValue;
      onValueChange?.(nextVal);
    },
    [value, onValueChange],
  );

  const contextData = useMemo<TypeaheadAddressContextData>(() => {
    return {
      value: value || {
        district: '',
        postalCode: '',
        province: '',
        subdistrict: '',
      },
      searchByField,
      onInputFieldChange,
      onValueChange,
      suggestionContainerElem,
      setSuggestionContainerElem,
      suggestions,
      setSuggestions,
      shouldDisplaySuggestion,
      setShouldDisplaySuggestion,
      highlightedItemIndex,
      setHighlightedItemIndex,
    };
  }, [
    value,
    searchByField,
    onInputFieldChange,
    onValueChange,
    suggestionContainerElem,
    suggestions,
    shouldDisplaySuggestion,
    highlightedItemIndex,
  ]);

  return <typeaheadAddressContext.Provider value={contextData}>{children}</typeaheadAddressContext.Provider>;
};

export type DefaultSuggestionPanelPropTypes = {
  containerProps?: SuggestionPanelPropTypes['containerProps'];
  optionItemProps?: SuggestionPanelPropTypes['optionItemProps'];
};
const DefaultSuggestionPanel = ({ containerProps, optionItemProps }: DefaultSuggestionPanelPropTypes) => {
  const {
    suggestionContainerElem,
    suggestions,
    shouldDisplaySuggestion,
    onValueChange,
    highlightedItemIndex,
    setHighlightedItemIndex,
  } = useAddressTypeaheadContext();

  if (!suggestionContainerElem) {
    return null;
  }
  return createPortal(
    <SuggestionPanel
      ds={suggestions}
      shouldVisible={shouldDisplaySuggestion}
      onDataSourceItemSelected={onValueChange}
      containerProps={containerProps}
      optionItemProps={optionItemProps}
      highlightedItemIndex={highlightedItemIndex}
      onOptionMouseEnter={setHighlightedItemIndex}
    />,
    suggestionContainerElem,
  );
};

type CustomSuggestionPanelPropTypes = {
  children: (
    ds: ThailandAddressValue[],
    shouldVisible: boolean,
    onSuggestionSelected: (nextVal: ThailandAddressValue) => void,
  ) => React.ReactNode;
};
export const CustomSuggestionPanel = ({ children }: CustomSuggestionPanelPropTypes) => {
  const { suggestionContainerElem, suggestions, shouldDisplaySuggestion, onValueChange } = useAddressTypeaheadContext();

  const onSuggestionSelected = useCallback(
    (nextVal: ThailandAddressValue) => {
      onValueChange?.(nextVal);
    },
    [onValueChange],
  );

  const ds = useMemo(() => {
    return suggestions.map(ThailandAddressValue.fromDataSourceItem);
  }, [suggestions]);

  if (!suggestionContainerElem) {
    return null;
  }

  return createPortal(children(ds, shouldDisplaySuggestion, onSuggestionSelected), suggestionContainerElem);
};

export const SubdistrictInput = AddressInputField('subdistrict');
export const ProvinceInput = AddressInputField('province');
export const DistrictInput = AddressInputField('district');
export const PostalCodeInput = AddressInputField('postalCode');
export const Suggestion = DefaultSuggestionPanel;
export const CustomSuggestion = CustomSuggestionPanel;

ThailandAddressTypeahead.SubdistrictInput = SubdistrictInput;
ThailandAddressTypeahead.DistrictInput = DistrictInput;
ThailandAddressTypeahead.ProvinceInput = ProvinceInput;
ThailandAddressTypeahead.PostalCodeInput = PostalCodeInput;
ThailandAddressTypeahead.SubdistrictInput = SubdistrictInput;

ThailandAddressTypeahead.Suggestion = DefaultSuggestionPanel;
ThailandAddressTypeahead.CustomSuggestion = CustomSuggestionPanel;

export { ThailandAddressValue };
