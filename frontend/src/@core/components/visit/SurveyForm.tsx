import { Survey } from '@/views/apps/visit/survey-list';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';

import { Controller } from 'react-hook-form';

interface SurveyFormProps {
  list: Survey[];
  control: any;
  errors: any;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

// Custom hook
const useOtherItem = (item: any, onChange: any, value?: any) => {
  const [otherItem, setOtherItem] = useState<boolean>(false);
  const lastItem = item?.choices?.[item?.choices.length - 1];

  useEffect(() => {
    const hasLastValue = value?.includes(lastItem);
    hasLastValue ? setOtherItem(true) : setOtherItem(false);
  }, [value]);

  const handleChange = (e: InputChangeEvent) => {
    if (lastItem === e.target.value) {
      setOtherItem(true);
      onChange('');
    } else {
      setOtherItem(false);
      onChange(e.target.value);
    }
  };

  const handleOtherItem = (e: InputChangeEvent) => {
    setOtherItem(true);
    onChange(e.target.value);
  };

  const handleOtherChoice = (e: InputChangeEvent, choice: any) => {
    console.log('🚀 ~ handleOtherChoice ~ choice:', choice);
    if (e.target.checked) {
      setOtherItem(true);
      onChange([choice]);
    } else {
      setOtherItem(false);
      onChange([]);
    }
  };

  const handleRegularChoice = (e: InputChangeEvent, value: any, choice: any) => {
    let clonedArray = [...value];
    if (e.target.checked) {
      clonedArray.push(choice);
    } else {
      clonedArray = value.filter((item: any) => item !== choice);
      if (choice === 'onBlur') {
        const inputValues = e.target.value;
        if (lastItem === clonedArray[clonedArray.length - 1]) {
          clonedArray.push(inputValues);
        } else {
          clonedArray.pop();
          clonedArray.push(inputValues);
        }
      }
    }
    onChange(clonedArray);
  };

  const handleArrayChange = (e: InputChangeEvent, value: any, choice: any) => {
    console.log('🚀 ~ handleArrayChange ~ e:', e.target.id);
    console.log('🚀 ~ handleArrayChange ~ choice:', choice);
    console.log('🚀 ~ handleArrayChange ~ value:', value);

    if (choice === 'อื่น ๆ' && e.target.id === 'student-behavior-other') {
      console.log('🚀 ~ handleArrayChange ~ value:', value);
      handleOtherChoice(e, choice);
    } else {
      handleRegularChoice(e, value, choice);
    }
  };

  return { lastItem, otherItem, handleChange, handleOtherItem, handleArrayChange };
};

const SurveyForm = ({ list, control, errors }: SurveyFormProps) => {
  return (
    <Fragment>
      {list.map((item: Survey) => {
        switch (item.type) {
          case 'radiogroup':
            return (
              <FormControl
                key={item.name}
                fullWidth
                sx={{
                  pb: 1,
                }}
              >
                <Controller
                  name={item.name}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => {
                    const { lastItem, otherItem, handleChange, handleOtherItem } = useOtherItem(item, onChange);

                    return (
                      <Fragment>
                        <FormLabel id={item.name} sx={{ fontWeight: 'bold' }}>
                          {item.title}
                        </FormLabel>
                        <RadioGroup row aria-labelledby={item.name} name={item.name} onChange={handleChange}>
                          {item?.choices &&
                            item.choices.map((choice: any) => {
                              return (
                                <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                              );
                            })}
                          {(lastItem === value || otherItem) && (
                            <TextField
                              size='small'
                              id='outlined-basic'
                              variant='outlined'
                              placeholder={item?.otherPlaceholder}
                              onChange={handleOtherItem}
                            />
                          )}
                        </RadioGroup>
                        {errors[item.name] && (
                          <FormHelperText sx={{ color: 'error.main' }} id={errors[item.name].message}>
                            {errors[item.name].message}
                          </FormHelperText>
                        )}
                      </Fragment>
                    );
                  }}
                />
              </FormControl>
            );
          case 'checkbox':
            return (
              <FormControl
                key={item.name}
                fullWidth
                sx={{
                  pb: 1,
                }}
              >
                <Controller
                  name={item.name}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => {
                    const { lastItem, otherItem, handleArrayChange } = useOtherItem(item, onChange, value);
                    const handleArrayChangeChecked = (value: string[], choice: any) => {
                      const hasValue = value?.includes(choice);
                      return hasValue;
                    };

                    return (
                      <Fragment>
                        <FormLabel id={item.name} sx={{ fontWeight: 'bold' }}>
                          {item.title}
                        </FormLabel>
                        <FormGroup
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            alignContent: 'flex-start',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            '& .MuiFormControlLabel-label': { ml: 1 },
                          }}
                        >
                          {item?.choices &&
                            item.choices.map((choice: any, index: number) => {
                              return (
                                <FormControlLabel
                                  key={index + choice}
                                  control={
                                    <Checkbox
                                      checked={handleArrayChangeChecked(value, choice)}
                                      name='choiceCheckbox'
                                      onChange={(e) => {
                                        handleArrayChange(e, value, choice);
                                      }}
                                      value={choice}
                                      color='primary'
                                      inputProps={{ 'aria-label': 'choice checkbox' }}
                                    />
                                  }
                                  label={choice}
                                />
                              );
                            })}
                          {(lastItem === value || otherItem) && (
                            <TextField
                              size='small'
                              id={`${item.name}-other`}
                              variant='outlined'
                              placeholder={item?.otherPlaceholder}
                              onBlur={(e) => {
                                handleArrayChange(e as any, value, 'onBlur');
                              }}
                              onChange={(e: any) => {
                                handleArrayChange(e, value, 'other');
                              }}
                            />
                          )}
                        </FormGroup>
                        {errors[item.name] && (
                          <FormHelperText sx={{ color: 'error.main' }} id={errors[item.name].message}>
                            {errors[item.name].message}
                          </FormHelperText>
                        )}
                      </Fragment>
                    );
                  }}
                />
              </FormControl>
            );
          case 'radiogroup-allow-other':
            return (
              <FormControl
                key={item.name}
                fullWidth
                sx={{
                  pb: 1,
                }}
              >
                <Controller
                  name={item.name}
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => {
                    const { lastItem, otherItem, handleChange, handleOtherItem } = useOtherItem(item, onChange);
                    return (
                      <Fragment>
                        <FormLabel id={item.name} sx={{ fontWeight: 'bold' }}>
                          {item.title}
                        </FormLabel>
                        <RadioGroup row aria-labelledby={item.name} name={item.name} onChange={handleChange}>
                          {item?.choices &&
                            item.choices.map((choice: any) => {
                              return (
                                <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                              );
                            })}
                        </RadioGroup>
                        {(lastItem === value || otherItem) && (
                          <FormGroup onChange={handleOtherItem}>
                            {item?.otherOptions?.map((option: any) => {
                              return (
                                <FormControlLabel key={option} value={option} control={<Checkbox />} label={option} />
                              );
                            })}
                          </FormGroup>
                        )}
                        {errors[item.name] && (
                          <FormHelperText sx={{ color: 'error.main' }} id={errors[item.name].message}>
                            {errors[item.name].message}
                          </FormHelperText>
                        )}
                      </Fragment>
                    );
                  }}
                />
              </FormControl>
            );
          default:
            return null;
        }
      })}
    </Fragment>
  );
};

export default SurveyForm;
