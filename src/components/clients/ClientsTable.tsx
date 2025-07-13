
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  selectedClients: string[];
  onClientSelect: (clientId: string) => void;
  onSelectAll: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export const ClientsTable = ({
  clients,
  selectedClients,
  onClientSelect,
  onSelectAll,
  onEdit,
  onDelete
}: ClientsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client List</CardTitle>
        <CardDescription>
          All your client projects ({clients.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedClients.length === clients.length && clients.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => onClientSelect(client.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.description || 'No description'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status || 'active'}
                  </span>
                </TableCell>
                <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(client)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {clients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No clients found. Create your first client to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
