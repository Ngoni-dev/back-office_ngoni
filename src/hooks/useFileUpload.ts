import { useCallback, useState } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export function useFileUpload() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File, options: FileValidationOptions = {}) => {
    const { maxSize = 50 * 1024 * 1024, allowedTypes } = options; // Default 50MB

    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB`);
    }

    if (allowedTypes && allowedTypes.length > 0) {
      const allowed = allowedTypes.some(allowedType => {
        if (allowedType.endsWith('/*')) {
          const prefix = allowedType.slice(0, -1); // 'audio/*' -> 'audio'
          return file.type.startsWith(prefix + '/');
        }
        return file.type === allowedType;
      });
      if (!allowed) {
        throw new Error(`File type ${file.type} is not allowed`);
      }
    }

    return true;
  }, []);

  const reset = useCallback(() => {
    setProgress(null);
    setUploading(false);
    setError(null);
  }, []);

  return {
    progress,
    uploading,
    error,
    validateFile,
    reset,
    setProgress,
    setUploading,
    setError,
  };
}
