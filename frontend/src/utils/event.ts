export const handleKeyDown = (e: any) => {
  // allow RegExp only number english keyboard control key copy and paste
  const regex = new RegExp('^[0-9]+$');
  if (
    !regex.test(e.key) &&
    e.key !== 'Backspace' &&
    e.key !== 'Tab' &&
    e.key !== 'ArrowLeft' &&
    e.key !== 'ArrowRight' &&
    e.key !== 'ArrowUp' &&
    e.key !== 'ArrowDown' &&
    e.key !== 'Delete' &&
    e.key !== 'Control' &&
    e.key !== 'c' &&
    e.key !== 'v' &&
    e.key !== 'x'
  ) {
    e.preventDefault();
  }
};

interface Errors {
  [key: string]: string;
}

export const generateErrorMessages: Errors = {
  'request entity too large': 'ขนาดไฟล์ใหญ่เกินไป',
}

