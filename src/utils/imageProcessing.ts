import imageCompression from 'browser-image-compression';

export interface ProcessedFile {
  compressedData: string;
  fileType: string;
  originalName: string;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  // If it's an image, compress it
  if (file.type.startsWith('image/')) {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const base64Data = await convertToBase64(compressedFile);
      
      return {
        compressedData: base64Data,
        fileType: file.type,
        originalName: file.name
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  // For non-image files, just convert to base64
  const base64Data = await convertToBase64(file);
  return {
    compressedData: base64Data,
    fileType: file.type,
    originalName: file.name
  };
}

function convertToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
} 