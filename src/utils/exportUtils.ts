
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
  // Create proper Excel-compatible CSV with headers and structured data
  if (!data || data.length === 0) {
    const csvContent = 'Client Name,Description,Status,Created Date,Updated Date\nNo data available,,,,"';
    downloadFile(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    return;
  }

  // Define column headers for Excel compatibility
  const headers = ['Client Name', 'Description', 'Status', 'Created Date', 'Updated Date'];
  
  // Map data to structured rows
  const rows = data.map(item => [
    item.name || '',
    item.description || '',
    item.status || '',
    new Date(item.created_at).toLocaleDateString(),
    new Date(item.updated_at).toLocaleDateString()
  ]);

  // Create CSV content with proper formatting for Excel
  const csvRows = [
    headers.join(','), // Header row
    ...rows.map(row => 
      row.map(cell => {
        const cellValue = String(cell).replace(/"/g, '""');
        return `"${cellValue}"`;
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
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #333;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #333; padding: 12px; text-align: left; font-weight: bold;">Client Name</th>
          <th style="border: 1px solid #333; padding: 12px; text-align: left; font-weight: bold;">Description</th>
          <th style="border: 1px solid #333; padding: 12px; text-align: left; font-weight: bold;">Status</th>
          <th style="border: 1px solid #333; padding: 12px; text-align: left; font-weight: bold;">Created Date</th>
          <th style="border: 1px solid #333; padding: 12px; text-align: left; font-weight: bold;">Updated Date</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td style="border: 1px solid #333; padding: 12px;">${item.name || 'N/A'}</td>
            <td style="border: 1px solid #333; padding: 12px;">${item.description || 'N/A'}</td>
            <td style="border: 1px solid #333; padding: 12px;">${item.status || 'N/A'}</td>
            <td style="border: 1px solid #333; padding: 12px;">${new Date(item.created_at).toLocaleDateString()}</td>
            <td style="border: 1px solid #333; padding: 12px;">${new Date(item.updated_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="text-align: center; color: #666;">No data available to display.</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
        }
        h1 { 
          color: #333; 
          margin-bottom: 20px; 
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #333; 
          padding: 12px; 
          text-align: left; 
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold; 
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        @media print {
          body { margin: 0; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
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
    <table border="2" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 2px solid #000; padding: 10px; text-align: left; font-weight: bold;">Client Name</th>
          <th style="border: 2px solid #000; padding: 10px; text-align: left; font-weight: bold;">Description</th>
          <th style="border: 2px solid #000; padding: 10px; text-align: left; font-weight: bold;">Status</th>
          <th style="border: 2px solid #000; padding: 10px; text-align: left; font-weight: bold;">Created Date</th>
          <th style="border: 2px solid #000; padding: 10px; text-align: left; font-weight: bold;">Updated Date</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td style="border: 1px solid #000; padding: 10px;">${item.name || 'N/A'}</td>
            <td style="border: 1px solid #000; padding: 10px;">${item.description || 'N/A'}</td>
            <td style="border: 1px solid #000; padding: 10px;">${item.status || 'N/A'}</td>
            <td style="border: 1px solid #000; padding: 10px;">${new Date(item.created_at).toLocaleDateString()}</td>
            <td style="border: 1px solid #000; padding: 10px;">${new Date(item.updated_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="text-align: center;">No data available to display.</p>';

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotPromptForConvert/>
          <w:DoNotShowRevisions/>
          <w:DoNotShowInsertionsAndDeletions/>
          <w:DoNotShowComments/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          line-height: 1.4;
        }
        h1 {
          color: #000;
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #000; 
          padding: 10px; 
          text-align: left; 
          vertical-align: top;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold; 
        }
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
