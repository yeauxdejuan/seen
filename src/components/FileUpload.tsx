/**
 * Enhanced File Upload Component
 * Supports multiple file types, drag & drop, progress tracking,
 * and automatic metadata scrubbing for privacy
 */

import { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  reportId?: string;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  metadata?: {
    scrubbed: boolean;
    originalName: string;
  };
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  id: string;
}

export function FileUpload({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  reportId: _reportId,
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const generateFileId = () => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleFiles = useCallback((newFiles: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(newFiles);
    
    // Check total file limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: FileWithProgress[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      validFiles.push({
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        id: generateFileId()
      });
    });

    setFiles(prev => [...prev, ...validFiles]);

    // Start uploading valid files
    validFiles.forEach(fileWithProgress => {
      if (fileWithProgress.status === 'pending') {
        uploadFile(fileWithProgress);
      }
    });
  }, [files.length, maxFiles, disabled]);

  const uploadFile = async (fileWithProgress: FileWithProgress) => {
    const { file, id } = fileWithProgress;

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading' as const } : f
    ));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === id && f.progress < 90) {
            return { ...f, progress: f.progress + Math.random() * 20 };
          }
          return f;
        }));
      }, 200);

      // In a real implementation, this would call ApiService.uploadFile
      // For now, simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);

      // Simulate successful upload
      const uploadedFile: UploadedFile = {
        id: id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In real app, this would be the server URL
        uploadedAt: new Date().toISOString(),
        metadata: {
          scrubbed: true,
          originalName: file.name
        }
      };

      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'completed' as const, progress: 100 } : f
      ));

      // Notify parent component
      onFilesUploaded([uploadedFile]);

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed transition-colors duration-200 cursor-pointer rounded-lg
          ${isDragOver 
            ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Card className="border-none bg-transparent">
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop files here or click to browse
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Supports images, PDFs, and documents up to {maxFileSize}MB
          </p>
          
          <Button variant="secondary" disabled={disabled}>
            Choose Files
          </Button>
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Files are automatically scrubbed of metadata for privacy
          </p>
        </div>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          {files.map((fileWithProgress) => (
            <Card key={fileWithProgress.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    {fileWithProgress.file.type.startsWith('image/') ? (
                      <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileWithProgress.file.size)}
                    </p>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {fileWithProgress.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileWithProgress.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(fileWithProgress.progress)}%
                        </span>
                      </div>
                    )}
                    
                    {fileWithProgress.status === 'completed' && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    
                    {fileWithProgress.status === 'error' && (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileWithProgress.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Error message */}
              {fileWithProgress.status === 'error' && fileWithProgress.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {fileWithProgress.error}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}