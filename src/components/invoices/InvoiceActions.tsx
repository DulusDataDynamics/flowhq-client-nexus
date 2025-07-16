
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
import { Eye, MessageSquare, Share, Download, FileText, FileSpreadsheet, FileImage, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportToExcel, exportToWord } from '@/utils/exportUtils';
import type { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

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

  const handleWhatsApp = () => {
    if (invoice.client_phone) {
      const message = `Hi ${invoice.client_name}, your invoice ${invoice.invoice_number} for $${invoice.amount} is ready. ${invoice.due_date ? `Due date: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}`;
      const whatsappUrl = `https://wa.me/${invoice.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast({
        title: "WhatsApp opened",
        description: `Message prepared for ${invoice.client_name}`
      });
    } else {
      toast({
        title: "No phone number",
        description: "Client phone number not available",
        variant: "destructive"
      });
    }
    setShowMessageDialog(false);
  };

  const handleEmail = () => {
    if (invoice.client_email) {
      const subject = `Invoice ${invoice.invoice_number} - ${invoice.client_name}`;
      const body = `Dear ${invoice.client_name},\n\nYour invoice ${invoice.invoice_number} for $${invoice.amount} is ready.\n${invoice.notes ? `Notes: ${invoice.notes}\n` : ''}${invoice.due_date ? `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}\n` : ''}\nThank you for your business!`;
      const emailUrl = `mailto:${invoice.client_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(emailUrl, '_blank');
      toast({
        title: "Email client opened",
        description: `Email prepared for ${invoice.client_name}`
      });
    } else {
      toast({
        title: "No email address",
        description: "Client email address not available",
        variant: "destructive"
      });
    }
    setShowMessageDialog(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.invoice_number} - ${invoice.client_name}`,
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
      'Invoice Number': invoice.invoice_number,
      'Client Name': invoice.client_name,
      'Client Email': invoice.client_email || '',
      'Client Phone': invoice.client_phone || '',
      'Amount': `$${invoice.amount}`,
      'Currency': invoice.currency || 'USD',
      'Notes': invoice.notes || '',
      'Due Date': invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '',
      'Status': invoice.status || 'draft',
      'Created': new Date(invoice.created_at).toLocaleDateString()
    }];

    const filename = `invoice-${invoice.invoice_number.replace(/\s+/g, '-').toLowerCase()}`;

    switch (format) {
      case 'pdf':
        exportToPDF(invoiceData, filename, `Invoice ${invoice.invoice_number} - ${invoice.client_name}`);
        break;
      case 'excel':
        exportToExcel(invoiceData, filename);
        break;
      case 'word':
        exportToWord(invoiceData, filename, `Invoice ${invoice.invoice_number} - ${invoice.client_name}`);
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
                <label className="text-sm font-medium">Invoice Number</label>
                <p className="text-lg">{invoice.invoice_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-lg font-bold text-green-600">${invoice.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Client Name</label>
                <p>{invoice.client_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="capitalize">{invoice.status}</p>
              </div>
            </div>
            {invoice.notes && (
              <div>
                <label className="text-sm font-medium">Notes</label>
                <p>{invoice.notes}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {invoice.due_date && (
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Created</label>
                <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {(invoice.client_email || invoice.client_phone) && (
              <div className="grid grid-cols-2 gap-4">
                {invoice.client_email && (
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p>{invoice.client_email}</p>
                  </div>
                )}
                {invoice.client_phone && (
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p>{invoice.client_phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Client</DialogTitle>
            <DialogDescription>
              Choose how to contact {invoice.client_name} regarding this invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleWhatsApp}
                disabled={!invoice.client_phone}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button 
                onClick={handleEmail}
                disabled={!invoice.client_email}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
            {!invoice.client_phone && !invoice.client_email && (
              <p className="text-sm text-muted-foreground text-center">
                No contact information available for this client
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
