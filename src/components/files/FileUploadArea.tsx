
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  uploading: boolean;
}

export const FileUploadArea = ({ onFilesSelected, uploading }: FileUploadAreaProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  }, [onFilesSelected]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    
    const filesArray = Array.from(selectedFiles);
    onFilesSelected(filesArray);
    event.target.value = '';
  };

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-semibold">
          {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-gray-500 mb-4">
          or click the upload button below. Supports all file types.
        </p>
        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={uploading}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          Choose Files
        </Button>
      </div>
      
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
    </>
  );
};
