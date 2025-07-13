
import { supabase } from '@/integrations/supabase/client';

export interface ClientData {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  files?: any[];
  conversations?: any[];
}

export const exportClientData = async (format: 'pdf' | 'word' | 'excel', clientIds?: string[]) => {
  try {
    // Fetch client data
    let query = supabase.from('projects').select(`
      id,
      name,  
      description,
      status,
      created_at,
      updated_at
    `);

    if (clientIds && clientIds.length > 0) {
      query = query.in('id', clientIds);
    }

    const { data: clients, error } = await query;

    if (error) throw error;

    // Fetch related files and conversations for each client
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const [filesResult, conversationsResult] = await Promise.all([
          supabase.from('files').select('*').eq('project_id', client.id),
          supabase.from('ai_conversations').select('*').eq('project_id', client.id)
        ]);

        return {
          ...client,
          files: filesResult.data || [],
          conversations: conversationsResult.data || []
        };
      })
    );

    // Generate export based on format
    switch (format) {
      case 'excel':
        return exportToExcel(enrichedClients);
      case 'pdf':
        return exportToPDF(enrichedClients);
      case 'word':
        return exportToWord(enrichedClients);
      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

const exportToExcel = (clients: ClientData[]) => {
  // Create CSV content (simplified Excel alternative)
  const headers = ['Name', 'Description', 'Status', 'Created Date', 'Files Count', 'Conversations Count'];
  const rows = clients.map(client => [
    client.name,
    client.description || '',
    client.status || '',
    new Date(client.created_at).toLocaleDateString(),
    client.files?.length || 0,
    client.conversations?.length || 0
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToPDF = (clients: ClientData[]) => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Client Data Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .client { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
        .client-name { font-size: 18px; font-weight: bold; color: #2563eb; }
        .client-info { margin: 10px 0; }
        .files, .conversations { margin-top: 15px; }
        .files h4, .conversations h4 { margin-bottom: 10px; }
        ul { margin: 5px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <h1>Client Data Export - ${new Date().toLocaleDateString()}</h1>
      ${clients.map(client => `
        <div class="client">
          <div class="client-name">${client.name}</div>
          <div class="client-info">
            <p><strong>Description:</strong> ${client.description || 'N/A'}</p>
            <p><strong>Status:</strong> ${client.status || 'N/A'}</p>
            <p><strong>Created:</strong> ${new Date(client.created_at).toLocaleDateString()}</p>
          </div>
          <div class="files">
            <h4>Files (${client.files?.length || 0})</h4>
            ${client.files?.length ? `
              <ul>
                ${client.files.map(file => `<li>${file.filename} (${file.file_type})</li>`).join('')}
              </ul>
            ` : '<p>No files</p>'}
          </div>
          <div class="conversations">
            <h4>AI Conversations (${client.conversations?.length || 0})</h4>
            ${client.conversations?.length ? `
              <ul>
                ${client.conversations.map(conv => `<li>${conv.message.substring(0, 100)}...</li>`).join('')}
              </ul>
            ` : '<p>No conversations</p>'}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `clients-export-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToWord = (clients: ClientData[]) => {
  // Create Word-compatible HTML
  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset='utf-8'>
      <title>Client Data Export</title>
    </head>
    <body>
      <h1>Client Data Export - ${new Date().toLocaleDateString()}</h1>
      ${clients.map(client => `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px;">
          <h2 style="color: #2563eb;">${client.name}</h2>
          <p><strong>Description:</strong> ${client.description || 'N/A'}</p>
          <p><strong>Status:</strong> ${client.status || 'N/A'}</p>
          <p><strong>Created:</strong> ${new Date(client.created_at).toLocaleDateString()}</p>
          <p><strong>Files:</strong> ${client.files?.length || 0}</p>
          <p><strong>Conversations:</strong> ${client.conversations?.length || 0}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `clients-export-${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
