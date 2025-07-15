
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
  // Create proper CSV content with headers and data
  if (!data || data.length === 0) {
    const csvContent = 'No data available';
    downloadFile(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        const stringValue = value ? String(value).replace(/"/g, '""') : '';
        return `"${stringValue}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const exportToPDF = (data: any[], filename: string = 'export', title: string = 'Data Export') => {
  if (!data || data.length === 0) {
    const htmlContent = createHTMLContent([], title);
    downloadFile(htmlContent, `${filename}-${new Date().toISOString().split('T')[0]}.html`, 'text/html');
    return;
  }

  const htmlContent = createHTMLContent(data, title);
  downloadFile(htmlContent, `${filename}-${new Date().toISOString().split('T')[0]}.html`, 'text/html');
};

export const exportToWord = (data: any[], filename: string = 'export', title: string = 'Data Export') => {
  if (!data || data.length === 0) {
    const wordContent = createWordContent([], title);
    downloadFile(wordContent, `${filename}-${new Date().toISOString().split('T')[0]}.doc`, 'application/msword');
    return;
  }

  const wordContent = createWordContent(data, title);
  downloadFile(wordContent, `${filename}-${new Date().toISOString().split('T')[0]}.doc`, 'application/msword');
};

const createHTMLContent = (data: any[], title: string) => {
  const tableRows = data.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          ${Object.keys(data[0]).map(key => 
            `<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">${key}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            ${Object.values(item).map(value => 
              `<td style="border: 1px solid #ddd; padding: 12px;">${value || 'N/A'}</td>`
            ).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No data available to display.</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>${title} - ${new Date().toLocaleDateString()}</h1>
      ${tableRows}
    </body>
    </html>
  `;
};

const createWordContent = (data: any[], title: string) => {
  const tableRows = data.length > 0 ? `
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          ${Object.keys(data[0]).map(key => 
            `<th style="padding: 8px; text-align: left;">${key}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            ${Object.values(item).map(value => 
              `<td style="padding: 8px;">${value || 'N/A'}</td>`
            ).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p>No data available to display.</p>';

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>${title} - ${new Date().toLocaleDateString()}</h1>
      ${tableRows}
    </body>
    </html>
  `;
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
