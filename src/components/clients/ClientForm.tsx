
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Client {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClientFormProps {
  isVisible: boolean;
  editingClient: Client | null;
  formData: {
    name: string;
    description: string;
    status: string;
  };
  loading: boolean;
  onFormDataChange: (data: { name: string; description: string; status: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ClientForm = ({
  isVisible,
  editingClient,
  formData,
  loading,
  onFormDataChange,
  onSubmit,
  onCancel
}: ClientFormProps) => {
  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>
          {editingClient ? 'Update client information' : 'Create a new client project'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="Enter client name"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Describe the client project"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => onFormDataChange({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingClient ? 'Update Client' : 'Create Client')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
