import { useState } from 'react';
import imageCompression from 'browser-image-compression';

const useImageCompression = () => {
  const [imageCompressed, setImageCompressed] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleInputImageChange = async (event: any) => {
    setIsCompressing(true);
    const imageFile = event.target.files[0];
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      const image64Base = await imageCompression.getDataUrlFromFile(compressedFile);
      setImageCompressed(image64Base);
      setIsCompressing(false);
    } catch (error) {
      console.error(error);
      setIsCompressing(false);
    }
  };

  return { imageCompressed, handleInputImageChange, isCompressing };
};

export default useImageCompression;
