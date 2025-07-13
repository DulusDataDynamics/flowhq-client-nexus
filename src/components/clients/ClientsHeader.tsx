
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Download, FileSpreadsheet, FileText, File } from 'lucide-react';

interface ClientsHeaderProps {
  selectedCount: number;
  exporting: boolean;
  onExport: (format: 'pdf' | 'word' | 'excel') => void;
  onAddClient: () => void;
}

export const ClientsHeader = ({
  selectedCount,
  exporting,
  onExport,
  onAddClient
}: ClientsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <p className="text-muted-foreground">
          Manage your client projects and relationships
        </p>
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={exporting}>
              <Download className="mr-2 h-4 w-4" />
              Export {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport('excel')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('word')}>
              <File className="mr-2 h-4 w-4" />
              Export as Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onAddClient}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>
    </div>
  );
};
