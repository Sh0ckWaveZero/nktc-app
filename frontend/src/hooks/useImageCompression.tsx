import { useState } from 'react';
import imageCompression from 'browser-image-compression';

const useImageCompression = () => {
  const [imageCompressed, setImage] = useState('');

  const handleInputImageChange = (event: any) => {
    const imageFile = event.target.files[0];
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    imageCompression(imageFile, options)
      .then((compressedFile) => imageCompression.getDataUrlFromFile(compressedFile))
      .then((image64Base) => setImage(image64Base))
      .catch((error) => console.error(error));
  };

  return { imageCompressed, handleInputImageChange };
};

export default useImageCompression;
