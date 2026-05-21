export interface ResizeImageOptions {
  width: number;
  height: number;
  quality?: number;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
    reader.readAsDataURL(file);
  });

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('ไม่สามารถโหลดไฟล์รูปภาพได้'));
    image.src = dataUrl;
  });

export const resizeImageToDataUrl = async (
  file: File,
  { width, height, quality = 0.86 }: ResizeImageOptions,
): Promise<string> => {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('ไม่สามารถประมวลผลรูปภาพได้');
  }

  canvas.width = width;
  canvas.height = height;

  const sourceAspectRatio = image.width / image.height;
  const targetAspectRatio = width / height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceAspectRatio > targetAspectRatio) {
    sourceWidth = image.height * targetAspectRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetAspectRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
};