
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Send,
  Eye,
  DollarSign,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  Calculator,
  Bot,
  Share,
  MessageCircle
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  description?: string;
}

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState<'manual' | 'ai'>('manual');
  const [calculatorInput, setCalculatorInput] = useState('');
  const [calculatorResult, setCalculatorResult] = useState('');
  const [newInvoice, setNewInvoice] = useState({
    client_name: '',
    amount: '',
    due_date: '',
    description: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, activeTab]);

  const showToast = (title: string, description: string, variant?: "default" | "destructive") => {
    toast({
      title,
      description,
      variant,
      duration: 5000
    });
  };

  const filterInvoices = () => {
    let filtered = invoices.filter(invoice =>
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === activeTab);
    }

    setFilteredInvoices(filtered);
  };

  const handleCreateInvoice = async () => {
    if (!user || !newInvoice.client_name || !newInvoice.amount) return;

    try {
      setLoading(true);
      const invoice: Invoice = {
        id: Date.now().toString(),
        invoice_number: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        client_name: newInvoice.client_name,
        amount: parseFloat(newInvoice.amount),
        status: 'draft',
        due_date: newInvoice.due_date,
        created_at: new Date().toISOString(),
        description: newInvoice.description
      };

      setInvoices([invoice, ...invoices]);

      showToast("Success", "Invoice created successfully");
      setDialogOpen(false);
      setNewInvoice({ client_name: '', amount: '', due_date: '', description: '' });
    } catch (error) {
      console.error('Error creating invoice:', error);
      showToast("Error", "Failed to create invoice", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      client_name: invoice.client_name,
      amount: invoice.amount,
      status: invoice.status,
      due_date: invoice.due_date,
      created_at: invoice.created_at,
      description: invoice.description
    };

    const invoiceHtml = `
      <html>
        <head><title>Invoice ${invoice.invoice_number}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>INVOICE</h1>
          <h2>${invoice.invoice_number}</h2>
          <p><strong>Client:</strong> ${invoice.client_name}</p>
          <p><strong>Amount:</strong> R${invoice.amount.toFixed(2)}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          <p><strong>Description:</strong> ${invoice.description || 'N/A'}</p>
          <p><strong>Created:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
        </body>
      </html>
    `;

    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoice_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Success", "Invoice downloaded successfully");
  };

  const handleShareInvoice = (invoice: Invoice) => {
    const shareData = `Invoice ${invoice.invoice_number}
Client: ${invoice.client_name}
Amount: R${invoice.amount.toFixed(2)}
Due: ${new Date(invoice.due_date).toLocaleDateString()}`;

    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.invoice_number}`,
        text: shareData
      });
    } else {
      navigator.clipboard.writeText(shareData);
      showToast("Success", "Invoice details copied to clipboard");
    }
  };

  const handleMessageClient = (invoice: Invoice, platform: string) => {
    const message = `Hello ${invoice.client_name}, regarding invoice ${invoice.invoice_number} for R${invoice.amount.toFixed(2)}.`;
    
    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=Invoice ${invoice.invoice_number}&body=${encodeURIComponent(message)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?text=${encodeURIComponent(message)}`);
        break;
    }
  };

  const handleCalculation = async () => {
    if (calculatorMode === 'manual') {
      try {
        // Simple calculator evaluation
        const result = eval(calculatorInput.replace(/[^0-9+\-*/().]/g, ''));
        setCalculatorResult(result.toString());
      } catch (error) {
        setCalculatorResult('Error');
      }
    } else {
      // AI Calculator
      try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
          body: {
            message: `Calculate this: ${calculatorInput}. Provide only the numerical result.`,
            userId: user?.id
          }
        });

        if (error) throw error;
        setCalculatorResult(data.response);
      } catch (error) {
        setCalculatorResult('AI calculation failed');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidThisMonth = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const draftCount = invoices.filter(inv => inv.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage billing and payments with your clients
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setCalendarOpen(true)}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button variant="outline" onClick={() => setCalculatorOpen(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            Calculator
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for your client.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client Name *</Label>
                  <Input
                    id="client"
                    value={newInvoice.client_name}
                    onChange={(e) => setNewInvoice({...newInvoice, client_name: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    placeholder="Invoice description or notes"
                  />
                </div>
                <Button onClick={handleCreateInvoice} className="w-full" disabled={loading}>
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {paidThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">January 2025</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Past due invoices</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">Unsent invoices</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first invoice to start billing your clients
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Invoice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <h4 className="font-medium">{invoice.invoice_number}</h4>
                          <p className="text-sm text-gray-500">{invoice.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold">R {invoice.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            Due {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleMessageClient(invoice, 'email')}>
                                Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMessageClient(invoice, 'whatsapp')}>
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMessageClient(invoice, 'telegram')}>
                                Telegram
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleShareInvoice(invoice)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Calculator Dialog */}
      <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calculator</DialogTitle>
            <DialogDescription>
              Choose between manual calculation or AI-powered calculations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                variant={calculatorMode === 'manual' ? 'default' : 'outline'}
                onClick={() => setCalculatorMode('manual')}
                className="flex-1"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Manual
              </Button>
              <Button 
                variant={calculatorMode === 'ai' ? 'default' : 'outline'}
                onClick={() => setCalculatorMode('ai')}
                className="flex-1"
              >
                <Bot className="mr-2 h-4 w-4" />
                AI Calculator
              </Button>
            </div>
            <div>
              <Input
                value={calculatorInput}
                onChange={(e) => setCalculatorInput(e.target.value)}
                placeholder={calculatorMode === 'manual' ? 'Enter calculation (e.g., 2+2*3)' : 'Ask AI to calculate anything'}
              />
            </div>
            <Button onClick={handleCalculation} className="w-full">
              Calculate
            </Button>
            {calculatorResult && (
              <div className="p-4 bg-gray-100 rounded">
                <p className="font-medium">Result: {calculatorResult}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calendar</DialogTitle>
            <DialogDescription>
              View and manage your invoice dates
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
