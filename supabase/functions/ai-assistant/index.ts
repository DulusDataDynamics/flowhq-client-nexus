
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('FlowBot AI Assistant function started');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, fileUrl, userId } = await req.json();
    console.log('Request received:', { message, fileUrl, userId });

    if (!message && !fileUrl) {
      throw new Error('No message or file provided');
    }

    let fileContent = '';
    let fileAnalysis = '';

    // Handle file processing if fileUrl is provided
    if (fileUrl && supabaseUrl && supabaseServiceKey) {
      console.log('Processing file:', fileUrl);
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('user-files')
          .download(fileUrl);

        if (fileError) {
          console.error('Error downloading file:', fileError);
          fileAnalysis = 'File uploaded but could not be processed for analysis.';
        } else {
          console.log('File downloaded successfully');
          
          // Convert file to text for analysis
          const text = await fileData.text();
          fileContent = text.substring(0, 4000); // Limit content size
          fileAnalysis = `File analyzed: ${fileUrl.split('/').pop()}`;
          console.log('File content extracted, length:', fileContent.length);
        }
      } catch (error) {
        console.error('File processing error:', error);
        fileAnalysis = 'File uploaded but analysis failed.';
      }
    }

    // Prepare the prompt for OpenAI
    let systemPrompt = `You are FlowBot, a powerful AI assistant designed to help users with various tasks. You can:

1. **Document Generation**: Create documents in any format (PDF, DOCX, TXT, etc.)
2. **Image Generation**: Create images based on descriptions
3. **File Analysis**: Analyze uploaded files and extract meaningful information
4. **Spreadsheet Creation**: Generate structured data in spreadsheet format
5. **Data Sorting**: Organize and sort data from documents or text
6. **Workflow Automation**: Help automate business processes
7. **Text Understanding**: Comprehend and process any text input

You should provide helpful, accurate, and detailed responses. When creating content, be thorough and professional.`;

    let userPrompt = message || 'Please analyze the uploaded file.';

    // Add file content to the prompt if available
    if (fileContent) {
      userPrompt += `\n\nFile content to analyze:\n${fileContent}`;
    }

    console.log('Sending request to OpenAI...');

    // Determine if this is an image generation request
    const isImageRequest = message && (
      message.toLowerCase().includes('generate image') ||
      message.toLowerCase().includes('create image') ||
      message.toLowerCase().includes('draw') ||
      message.toLowerCase().includes('picture') ||
      message.toLowerCase().includes('photo')
    );

    let response;
    let metadata = {};

    if (isImageRequest) {
      console.log('Processing image generation request');
      
      // Use DALL-E for image generation
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: userPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }),
      });

      const imageData = await imageResponse.json();
      console.log('Image generation response:', imageData);

      if (imageData.error) {
        throw new Error(`Image generation failed: ${imageData.error.message}`);
      }

      if (imageData.data && imageData.data[0]) {
        metadata.imageUrl = imageData.data[0].url;
        response = `I've generated an image based on your request: "${userPrompt}". The image is displayed above.`;
      } else {
        throw new Error('No image was generated');
      }
    } else {
      console.log('Processing text generation request');
      
      // Use GPT for text generation
      const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      const textData = await textResponse.json();
      console.log('Text generation response received');

      if (textData.error) {
        throw new Error(`Text generation failed: ${textData.error.message}`);
      }

      if (textData.choices && textData.choices[0]) {
        response = textData.choices[0].message.content;
        
        // Add file analysis info if applicable
        if (fileAnalysis) {
          response = `${fileAnalysis}\n\n${response}`;
        }
      } else {
        throw new Error('No response generated');
      }
    }

    console.log('FlowBot response generated successfully');

    return new Response(JSON.stringify({ 
      response,
      metadata 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in FlowBot function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: `I apologize, but I'm experiencing technical difficulties. Error: ${errorMessage}. Please try again, and I'll do my best to help you with document generation, image creation, file analysis, spreadsheet creation, data sorting, workflow automation, or text understanding!`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
