import { act, renderHook } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';

describe('useFileUpload', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.progress).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should validate file size correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    // Create a mock file that exceeds the default 50MB limit
    const largeFile = new File([''], 'large.mp3', {
      type: 'audio/mpeg',
    });
    Object.defineProperty(largeFile, 'size', { value: 60 * 1024 * 1024 }); // 60MB

    expect(() => {
      result.current.validateFile(largeFile);
    }).toThrow('File size exceeds 50MB');
  });

  it('should validate file type correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    const invalidFile = new File([''], 'document.pdf', {
      type: 'application/pdf',
    });

    expect(() => {
      result.current.validateFile(invalidFile, {
        allowedTypes: ['audio/mpeg', 'audio/wav'],
      });
    }).toThrow('File type application/pdf is not allowed');
  });

  it('should accept valid files', () => {
    const { result } = renderHook(() => useFileUpload());

    const validFile = new File([''], 'song.mp3', {
      type: 'audio/mpeg',
    });
    Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB

    expect(() => {
      result.current.validateFile(validFile, {
        allowedTypes: ['audio/mpeg', 'audio/wav'],
      });
    }).not.toThrow();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    // Set some state
    act(() => {
      result.current.setProgress({ loaded: 50, total: 100, percentage: 50 });
      result.current.setUploading(true);
      result.current.setError('Test error');
    });

    expect(result.current.progress).not.toBeNull();
    expect(result.current.uploading).toBe(true);
    expect(result.current.error).not.toBeNull();

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.progress).toBeNull();
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update progress state', () => {
    const { result } = renderHook(() => useFileUpload());

    const progressData = { loaded: 50, total: 100, percentage: 50 };

    act(() => {
      result.current.setProgress(progressData);
    });

    expect(result.current.progress).toEqual(progressData);
  });

  it('should update uploading state', () => {
    const { result } = renderHook(() => useFileUpload());

    act(() => {
      result.current.setUploading(true);
    });

    expect(result.current.uploading).toBe(true);

    act(() => {
      result.current.setUploading(false);
    });

    expect(result.current.uploading).toBe(false);
  });

  it('should update error state', () => {
    const { result } = renderHook(() => useFileUpload());

    const errorMessage = 'Upload failed';

    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should use custom maxSize option', () => {
    const { result } = renderHook(() => useFileUpload());

    const file = new File([''], 'file.mp3', {
      type: 'audio/mpeg',
    });
    Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }); // 15MB

    // Should pass with 20MB limit
    expect(() => {
      result.current.validateFile(file, { maxSize: 20 * 1024 * 1024 });
    }).not.toThrow();

    // Should fail with 10MB limit
    expect(() => {
      result.current.validateFile(file, { maxSize: 10 * 1024 * 1024 });
    }).toThrow('File size exceeds 10MB');
  });
});
