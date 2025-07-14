
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ClientsHeader } from '@/components/clients/ClientsHeader';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientForm } from '@/components/clients/ClientForm';
import { exportToExcel, exportToPDF, exportToWord } from '@/utils/exportUtils';

interface Client {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({ name: '', description: '', status: 'active' });
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      description: client.description || '',
      status: client.status || 'active'
    });
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully"
      });
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      if (editingClient) {
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name,
            description: formData.description,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClient.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            status: formData.status
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Client created successfully"
        });
      }

      setShowForm(false);
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    setSelectedClients(
      selectedClients.length === clients.length ? [] : clients.map(c => c.id)
    );
  };

  const handleExport = async (format: 'pdf' | 'word' | 'excel') => {
    setExporting(true);
    
    try {
      const clientsToExport = selectedClients.length > 0 
        ? clients.filter(client => selectedClients.includes(client.id))
        : clients;

      const exportData = clientsToExport.map(client => ({
        Name: client.name,
        Description: client.description || '',
        Status: client.status || 'active',
        'Created At': new Date(client.created_at).toLocaleDateString(),
        'Updated At': new Date(client.updated_at).toLocaleDateString()
      }));

      switch (format) {
        case 'excel':
          exportToExcel(exportData, 'clients');
          break;
        case 'pdf':
          exportToPDF(exportData, 'clients', 'Clients List');
          break;
        case 'word':
          exportToWord(exportData, 'clients', 'Clients List');
          break;
      }

      toast({
        title: "Success",
        description: `Clients exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Error",
        description: "Failed to export clients",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Please log in to access your clients.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientsHeader
        selectedCount={selectedClients.length}
        exporting={exporting}
        onExport={handleExport}
        onAddClient={handleAddClient}
      />

      <ClientForm
        isVisible={showForm}
        editingClient={editingClient}
        formData={formData}
        loading={submitting}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <ClientsTable
        clients={clients}
        selectedClients={selectedClients}
        onClientSelect={handleClientSelect}
        onSelectAll={handleSelectAll}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />
    </div>
  );
};
