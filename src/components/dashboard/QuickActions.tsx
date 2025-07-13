
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, DollarSign, Bot, Calculator as CalcIcon } from 'lucide-react';
import { Calculator } from '@/components/Calculator';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to get you started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigate('clients')}
        >
          <Users className="mr-2 h-4 w-4" />
          Add New Client
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigate('files')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Upload File
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigate('invoices')}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => onNavigate('flowbot')}
        >
          <Bot className="mr-2 h-4 w-4" />
          Chat with FlowBot AI
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="w-full justify-start" 
              variant="outline"
            >
              <CalcIcon className="mr-2 h-4 w-4" />
              Calculator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <Calculator />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
