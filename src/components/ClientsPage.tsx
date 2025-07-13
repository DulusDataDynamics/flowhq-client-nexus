
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { exportClientData } from '@/utils/exportUtils';
import { ClientsHeader } from '@/components/clients/ClientsHeader';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientsTable } from '@/components/clients/ClientsTable';

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
  const [isCreating, setIsCreating] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
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
          .eq('id', editingClient.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Client updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            name: formData.name,
            description: formData.description,
            status: formData.status,
            user_id: user.id
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Client created successfully"
        });
      }

      handleCancel();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Error",
        description: "Failed to save client",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', clientId);

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

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      description: client.description || '',
      status: client.status || 'active'
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingClient(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  const handleExport = async (format: 'pdf' | 'word' | 'excel') => {
    setExporting(true);
    try {
      const clientIds = selectedClients.length > 0 ? selectedClients : undefined;
      await exportClientData(format, clientIds);
      toast({
        title: "Export Complete",
        description: `Client data exported as ${format.toUpperCase()} successfully`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export client data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectAllClients = () => {
    setSelectedClients(selectedClients.length === clients.length ? [] : clients.map(c => c.id));
  };

  return (
    <div className="space-y-6">
      <ClientsHeader
        selectedCount={selectedClients.length}
        exporting={exporting}
        onExport={handleExport}
        onAddClient={() => setIsCreating(true)}
      />

      <ClientForm
        isVisible={isCreating}
        editingClient={editingClient}
        formData={formData}
        loading={loading}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <ClientsTable
        clients={clients}
        selectedClients={selectedClients}
        onClientSelect={toggleClientSelection}
        onSelectAll={selectAllClients}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
