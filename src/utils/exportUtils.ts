
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

export const exportToExcel = (data: any[], filename: string = 'export') => {
  // Create CSV content (simplified Excel alternative)
  const headers = Object.keys(data[0] || {});
  const rows = data.map(item => headers.map(header => item[header] || ''));

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (data: any[], filename: string = 'export', title: string = 'Data Export') => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .item { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
        .item-name { font-size: 18px; font-weight: bold; color: #2563eb; }
        .item-info { margin: 10px 0; }
        ul { margin: 5px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <h1>${title} - ${new Date().toLocaleDateString()}</h1>
      ${data.map(item => `
        <div class="item">
          <div class="item-name">${item.Name || item.name || 'Untitled'}</div>
          <div class="item-info">
            ${Object.entries(item).map(([key, value]) => 
              key !== 'Name' && key !== 'name' ? `<p><strong>${key}:</strong> ${value || 'N/A'}</p>` : ''
            ).join('')}
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
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToWord = (data: any[], filename: string = 'export', title: string = 'Data Export') => {
  // Create Word-compatible HTML
  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
    </head>
    <body>
      <h1>${title} - ${new Date().toLocaleDateString()}</h1>
      ${data.map(item => `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px;">
          <h2 style="color: #2563eb;">${item.Name || item.name || 'Untitled'}</h2>
          ${Object.entries(item).map(([key, value]) => 
            key !== 'Name' && key !== 'name' ? `<p><strong>${key}:</strong> ${value || 'N/A'}</p>` : ''
          ).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
