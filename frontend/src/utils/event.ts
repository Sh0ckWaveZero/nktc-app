export const handleKeyDown = (e: KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Control', 'c', 'v', 'x'];
  const regex = new RegExp('^[0-9]+$');

  if (!regex.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};


interface Errors {
  [key: string]: string;
}

export const generateErrorMessages: Errors = {
  'request entity too large': 'ขนาดไฟล์ใหญ่เกินไป',
}
