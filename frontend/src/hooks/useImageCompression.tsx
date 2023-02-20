import { useState } from 'react';
import imageCompression from 'browser-image-compression';

const useImageCompression = () => {
  const [imageCompressed, setImage] = useState('');

  const handleInputImageChange = async (event: any) => {
    const imageFile = event.target.files[0];
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      const image64Base = await imageCompression.getDataUrlFromFile(compressedFile);
      setImage(image64Base);
    } catch (error) {
      console.error(error);
    }
  };

  return { imageCompressed, handleInputImageChange };
};

export default useImageCompression;
