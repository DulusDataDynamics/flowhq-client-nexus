
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, MessageSquare, Share, Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportToExcel, exportToWord } from '@/utils/exportUtils';

interface Invoice {
  id: string;
  client_name: string;
  amount: number;
  description: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
}

interface InvoiceActionsProps {
  invoice: Invoice;
}

export const InvoiceActions = ({ invoice }: InvoiceActionsProps) => {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();

  const handleView = () => {
    setShowViewDialog(true);
  };

  const handleMessage = () => {
    setShowMessageDialog(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice - ${invoice.client_name}`,
          text: `Invoice for ${invoice.client_name} - $${invoice.amount}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Invoice link has been copied to clipboard"
      });
    }
  };

  const handleDownload = (format: 'pdf' | 'excel' | 'word') => {
    const invoiceData = [{
      'Invoice ID': invoice.id,
      'Client Name': invoice.client_name,
      'Amount': `$${invoice.amount}`,
      'Description': invoice.description,
      'Due Date': new Date(invoice.due_date).toLocaleDateString(),
      'Status': invoice.status,
      'Created': new Date(invoice.created_at).toLocaleDateString()
    }];

    const filename = `invoice-${invoice.client_name.replace(/\s+/g, '-').toLowerCase()}`;

    switch (format) {
      case 'pdf':
        exportToPDF(invoiceData, filename, `Invoice - ${invoice.client_name}`);
        break;
      case 'excel':
        exportToExcel(invoiceData, filename);
        break;
      case 'word':
        exportToWord(invoiceData, filename, `Invoice - ${invoice.client_name}`);
        break;
    }

    toast({
      title: "Download started",
      description: `Invoice downloaded as ${format.toUpperCase()}`
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={handleView}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleMessage}>
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownload('pdf')}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('excel')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('word')}>
              <FileImage className="mr-2 h-4 w-4" />
              Download Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <p className="text-lg">{invoice.client_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-lg font-bold text-green-600">${invoice.amount.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p>{invoice.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="capitalize">{invoice.status}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {invoice.client_name} regarding this invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <textarea 
              className="w-full p-3 border rounded-md resize-none"
              rows={4}
              placeholder="Type your message here..."
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowMessageDialog(false);
                toast({
                  title: "Message sent!",
                  description: `Message sent to ${invoice.client_name}`
                });
              }}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
