'use client';

import { useRef, useState, type ClipboardEvent, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  id?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  status?: 'idle' | 'success' | 'error';
  mask?: boolean;
}

const ROLL_SPRING = { type: 'spring', stiffness: 500, damping: 34 } as const;
const ROLL_EXIT = { duration: 0.14, ease: 'easeIn' as const };
const CARET_SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const;
const BLINK = {
  duration: 1.1,
  times: [0, 0.5, 0.5, 1],
  repeat: Infinity,
  ease: 'linear' as const,
};
const SHAKE = [0, -5, 4, -2, 0];
const ROLL = {
  initial: { y: '110%' },
} as const;

const OtpInput = ({
  value,
  onChange,
  length = 6,
  id = 'otp-input',
  label = 'รหัสยืนยัน 6 หลัก',
  helperText = 'กรอกรหัสจากแอปยืนยันตัวตน',
  error = false,
  disabled = false,
  autoFocus = false,
  status,
  mask = false,
}: OtpInputProps) => {
  const theme = useTheme();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const editingAt = useRef<number | null>(null);
  const [cleared, setCleared] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [caretX, setCaretX] = useState(0);
  const reduceMotion = useReducedMotion();
  const normalizedValue = value.replace(/\D/g, '').slice(0, length);
  const digits = Array.from({ length }, (_, index) => normalizedValue[index] || '');
  const labelId = label ? id + '-label' : undefined;
  const helperTextId = helperText ? id + '-helper-text' : undefined;
  const inputLabel = label || 'รหัสยืนยัน';
  const resolvedStatus = status || (error ? 'error' : 'idle');
  const caretVisible = focusedIndex !== null && !digits[focusedIndex];

  const focusInput = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), length - 1);
    inputRefs.current[nextIndex]?.focus({ preventScroll: true });
  };

  const updateDigits = (startIndex: number, nextValue: string) => {
    const nextDigits = [...digits];
    nextValue
      .replace(/\D/g, '')
      .slice(0, length - startIndex)
      .split('')
      .forEach((digit, offset) => {
        nextDigits[startIndex + offset] = digit;
      });
    setCleared(false);
    onChange(nextDigits.join(''));
    editingAt.current = null;
    focusInput(Math.min(startIndex + nextValue.replace(/\D/g, '').length, length - 1));
  };

  const setDigit = (index: number, digit: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setCleared(!digit);
    onChange(nextDigits.join(''));
  };

  const handleChange = (index: number, nextValue: string) => {
    const numericValue = nextValue.replace(/\D/g, '');
    if (!numericValue) {
      setDigit(index, '');
      return;
    }

    const typed =
      numericValue.length === 1
        ? numericValue
        : numericValue.length === 2 && numericValue[0] === digits[index]
        ? numericValue[1]
        : null;

    if (typed === null) {
      updateDigits(index, numericValue);
      return;
    }

    if (digits.every(Boolean) && editingAt.current !== index) return;

    setDigit(index, typed);
    editingAt.current = null;
    if (index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      setDigit(index, event.key);
      if (index < length - 1) focusInput(index + 1);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) {
        setDigit(index, '');
        return;
      }
      if (index > 0) {
        setDigit(index - 1, '');
        focusInput(index - 1);
      }
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      setDigit(index, '');
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      editingAt.current = Math.max(index - 1, 0);
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      editingAt.current = Math.min(index + 1, length - 1);
      focusInput(index + 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusInput(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusInput(length - 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<Element>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData.getData('text');
    const numericValue = pastedValue.replace(/\D/g, '');
    if (!numericValue) return;
    updateDigits(numericValue.length === length ? 0 : index, pastedValue);
  };

  const handlePointerDown = (index: number, event: PointerEvent<Element>) => {
    const firstEmpty = digits.findIndex((digit) => !digit);
    const target = firstEmpty === -1 ? index : Math.min(index, firstEmpty);
    editingAt.current = target;
    if (target === index) return;
    event.preventDefault();
    focusInput(target);
  };

  const handleRowFocus = (event: FocusEvent<HTMLDivElement>) => {
    const input = event.target as HTMLInputElement;
    const index = inputRefs.current.indexOf(input);
    if (index < 0) return;
    const cell = cellRefs.current[index];
    setFocusedIndex(index);
    if (cell) setCaretX(cell.offsetLeft + cell.offsetWidth / 2 - 1);
  };

  const handleRowBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocus = event.relatedTarget;
    if (nextFocus && event.currentTarget.contains(nextFocus as never)) return;
    setFocusedIndex(null);
  };

  return (
    <Box
      id={id}
      role='group'
      aria-labelledby={labelId}
      aria-describedby={helperTextId}
      aria-label={label ? undefined : 'รหัสยืนยัน 6 หลัก'}
      sx={{ width: '100%' }}
    >
      {label ? (
        <Typography id={labelId} variant='subtitle2' sx={{ mb: 0.5, fontWeight: 700 }}>
          {label}
        </Typography>
      ) : null}
      <motion.div
        onFocus={handleRowFocus}
        onBlur={handleRowBlur}
        animate={{
          x: resolvedStatus === 'error' && !reduceMotion ? SHAKE : 0,
        }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        data-slot='otp-input-row'
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(6px, 1.8vw, 8px)',
        }}
      >
        {digits.map((digit, index) => (
          <Box
            key={index}
            ref={(element: HTMLDivElement | null) => {
              cellRefs.current[index] = element;
            }}
            data-slot='otp-input-cell'
            data-filled={Boolean(digit)}
            sx={{ position: 'relative', flex: '0 0 auto' }}
          >
            <OutlinedInput
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onPointerDown={(event) => handlePointerDown(index, event)}
              onFocus={(event) => {
                const cursorPosition = event.target.value.length;
                event.target.setSelectionRange(cursorPosition, cursorPosition);
              }}
              autoFocus={autoFocus && index === 0}
              disabled={disabled}
              error={resolvedStatus === 'error'}
              inputRef={(element) => {
                inputRefs.current[index] = element;
              }}
              slotProps={{
                input: {
                  'aria-label': inputLabel + ' หลักที่ ' + (index + 1),
                  autoComplete: index === 0 ? 'one-time-code' : 'off',
                  inputMode: 'numeric',
                  maxLength: index === 0 ? length : 1,
                  pattern: '[0-9]*',
                },
              }}
              sx={{
                width: { xs: 42, sm: 48 },
                height: { xs: 48, sm: 56 },
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.background.paper, 0.72),
                '& .MuiOutlinedInput-input': {
                  p: 0,
                  textAlign: 'center',
                  fontSize: { xs: '1.15rem', sm: '1.3rem' },
                  fontWeight: 700,
                  lineHeight: 1,
                  color: 'transparent',
                  caretColor: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  userSelect: 'none',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    resolvedStatus === 'error' ? theme.palette.error.main : alpha(theme.palette.text.primary, 0.16),
                  borderWidth: resolvedStatus === 'error' ? 1.5 : 1,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    resolvedStatus === 'error' ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.55),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: resolvedStatus === 'error' ? theme.palette.error.main : theme.palette.primary.main,
                  borderWidth: 2,
                },
              }}
            />

            <Box
              component='span'
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <AnimatePresence initial={false}>
                {digit ? (
                  <motion.span
                    key={digit}
                    variants={ROLL}
                    initial={reduceMotion ? false : 'initial'}
                    animate={{
                      y: 0,
                      transition: reduceMotion ? { duration: 0 } : ROLL_SPRING,
                    }}
                    exit={
                      reduceMotion
                        ? { opacity: 0, transition: { duration: 0 } }
                        : {
                            y: cleared ? '110%' : '-110%',
                            opacity: 0,
                            transition: ROLL_EXIT,
                          }
                    }
                    data-slot='otp-input-char'
                    style={{
                      color: theme.palette.text.primary,
                      fontSize: 'clamp(1.15rem, 4vw, 1.3rem)',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {mask ? '•' : digit}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </Box>

            <AnimatePresence>
              {resolvedStatus === 'success' ? (
                <motion.svg
                  aria-hidden
                  data-slot='otp-input-ring'
                  viewBox='0 0 56 56'
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <motion.rect
                    x={1}
                    y={1}
                    width={54}
                    height={54}
                    rx={11}
                    fill='none'
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.45,
                            ease: 'easeOut',
                            delay: 0.15 + index * 0.05,
                          }
                    }
                  />
                </motion.svg>
              ) : null}
            </AnimatePresence>
          </Box>
        ))}

        {caretVisible ? (
          <motion.span
            aria-hidden
            data-slot='otp-input-caret'
            initial={false}
            animate={{
              x: caretX,
              y: '-50%',
              opacity: [1, 1, 0, 0],
            }}
            transition={{
              x: reduceMotion ? { duration: 0 } : CARET_SPRING,
              opacity: BLINK,
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              width: 2,
              borderRadius: 999,
              height: 'clamp(20px, 5.5vw, 24px)',
              backgroundColor: theme.palette.text.primary,
              pointerEvents: 'none',
            }}
          />
        ) : null}
      </motion.div>
      {helperText ? (
        <FormHelperText
          id={helperTextId}
          error={resolvedStatus === 'error'}
          role={resolvedStatus === 'error' ? 'alert' : undefined}
          aria-live={resolvedStatus === 'error' ? 'polite' : undefined}
          sx={{
            display: 'block',
            mt: 1,
            ml: 0,
            textAlign: 'center',
            fontWeight: resolvedStatus === 'error' ? 600 : undefined,
          }}
        >
          {helperText}
        </FormHelperText>
      ) : null}
    </Box>
  );
};

export default OtpInput;
