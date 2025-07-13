
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Send } from 'lucide-react';

interface ChatInterfaceProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  loading: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
}

export const ChatInterface = ({ 
  input, 
  setInput, 
  onSendMessage, 
  loading, 
  file, 
  setFile 
}: ChatInterfaceProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="border-t pt-4">
      {file && (
        <div className="mb-2 p-2 bg-blue-50 rounded flex items-center justify-between">
          <span className="text-sm">📎 {file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask FlowBot to generate documents, create images, analyze files, sort data, create spreadsheets, automate workflows..."
            disabled={loading}
            className="resize-none"
          />
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={onSendMessage}
          disabled={loading || (!input.trim() && !file)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
