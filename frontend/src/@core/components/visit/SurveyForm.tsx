import { Survey } from '@/views/apps/visit/survey-list';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';

import React, { Fragment, SyntheticEvent } from 'react';

import { Controller } from 'react-hook-form';

interface SurveyFormProps {
  list: Survey[];
  control: any;
}

const SurveyForm = ({ list, control }: SurveyFormProps) => {
  console.log('🚀 ~ file: SurveyForm.tsx:19 ~ SurveyForm ~ list:', list);
  return (
    <React.Fragment>
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
                    // is toggle last item in choices array and  add last item to value
                    const isCheckedLastItem =
                      (item?.choices &&
                        item.choices.length > 0 &&
                        value.includes(item?.choices?.[item?.choices.length - 1])) ||
                      value === item?.choices?.[item?.choices.length - 1];

                    return (
                      <React.Fragment>
                        <FormLabel id={item.name} sx={{ fontWeight: 'bold' }}>
                          {item.title}
                        </FormLabel>
                        <RadioGroup
                          row
                          aria-labelledby={item.name}
                          name={item.name}
                          onChange={(e: SyntheticEvent<Element, Event>) => {
                            onChange(e);
                          }}
                        >
                          {item?.choices &&
                            item.choices.map((choice: any) => {
                              return (
                                <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                              );
                            })}
                          {isCheckedLastItem && (
                            <TextField
                              size='small'
                              id='outlined-basic'
                              variant='outlined'
                              placeholder={item?.otherPlaceholder}
                              onChange={(e) => {
                                // add to new state to display in textfield
                                onChange(e);
                              }}
                            />
                          )}
                        </RadioGroup>
                      </React.Fragment>
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
                    item.choices.map((choice: any) => {
                      return <FormControlLabel key={choice} value={choice} control={<Checkbox />} label={choice} />;
                    })}
                  {item?.showOtherItem && (
                    <React.Fragment>
                      <FormControlLabel value={item?.otherText} control={<Checkbox />} label={item?.otherText} />
                      <TextField
                        size='small'
                        id='outlined-basic'
                        variant='outlined'
                        placeholder={item?.otherPlaceholder}
                      />
                    </React.Fragment>
                  )}
                </FormGroup>
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
                <FormLabel id={item.name} sx={{ fontWeight: 'bold' }}>
                  {item.title}
                </FormLabel>
                <RadioGroup row aria-labelledby={item.name} name={item.name}>
                  {item?.choices &&
                    item.choices.map((choice: any) => {
                      return <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />;
                    })}
                  {item?.showOtherItem && (
                    <React.Fragment>
                      <FormControlLabel value={item?.otherText} control={<Radio />} label={item?.otherText} />
                    </React.Fragment>
                  )}
                </RadioGroup>
                {item?.otherOptions && (
                  <FormGroup>
                    {item.otherOptions.map((option: any) => {
                      return <FormControlLabel key={option} value={option} control={<Checkbox />} label={option} />;
                    })}
                  </FormGroup>
                )}
              </FormControl>
            );
          default:
            return null;
        }
      })}
    </React.Fragment>
  );
};

export default SurveyForm;
