
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AuthFormHeaderProps {
  onClose: () => void;
}

export const AuthFormHeader = ({ onClose }: AuthFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">FlowHQ</h1>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onClose}
        className="p-1"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
