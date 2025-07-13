
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, fileUrl, userId } = await req.json()
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('FlowBot processing request for user:', userId)
    console.log('Message:', message)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let systemPrompt = `You are FlowBot, an advanced AI assistant for FlowHQ - a premium client collaboration platform. You excel at:

1. DOCUMENT GENERATION: Create professional documents in any format (PDF, DOCX, TXT, etc.) with proper formatting
2. IMAGE GENERATION: Create high-quality images, graphics, and visual content using DALL-E
3. FILE ANALYSIS: Analyze uploaded files (PDF, CSV, DOCX, XLSX, TXT, ZIP, images) and extract meaningful data
4. SPREADSHEET CREATION: Generate organized spreadsheets from any data with proper columns, headers, and formatting
5. DATA SORTING: Process and organize data from documents or text into structured, sortable formats
6. WORKFLOW AUTOMATION: Help automate business processes and create efficient workflows
7. TEXT UNDERSTANDING: Comprehend and process any text content for analysis, summarization, or transformation
8. FILE PARSING: Parse and understand content from various file formats
9. WORKFLOW LOGIC: Create logical workflows and process automation

Always provide detailed, actionable results. When generating content, ensure it's professional and well-structured. For file analysis, extract all relevant information and present it clearly. Be efficient and helpful in all responses.`

    let userPrompt = message
    let fileContent = null

    // Handle file analysis if file is uploaded
    if (fileUrl) {
      try {
        console.log('Processing uploaded file:', fileUrl)
        const { data: fileData } = await supabase.storage
          .from('user-files')
          .download(fileUrl)
        
        if (fileData) {
          fileContent = await fileData.text()
          userPrompt += `\n\nFile content to analyze and process:\n${fileContent.substring(0, 8000)}...`
          console.log('File content loaded for analysis, length:', fileContent.length)
        }
      } catch (error) {
        console.error('Error processing file:', error)
        userPrompt += '\n\nNote: File upload detected but could not be processed. Please describe what you need help with.'
      }
    }

    // Determine if user wants image generation
    const imageKeywords = ['image', 'picture', 'photo', 'generate image', 'create image', 'visual', 'graphic', 'illustration', 'draw', 'design', 'logo', 'chart visualization']
    const wantsImage = imageKeywords.some(keyword => message.toLowerCase().includes(keyword))

    // Determine if user wants spreadsheet/data organization
    const dataKeywords = ['spreadsheet', 'excel', 'csv', 'table', 'organize data', 'sort data', 'columns', 'rows', 'data analysis']
    const wantsDataProcessing = dataKeywords.some(keyword => message.toLowerCase().includes(keyword)) || fileContent

    let response = ''
    let metadata = {}

    if (wantsImage) {
      console.log('Generating image with DALL-E')
      try {
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: message,
            n: 1,
            size: "1024x1024",
            quality: "standard"
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          const imageUrl = imageData.data[0].url
          
          response = `🎨 **Image Generated Successfully!**

I've created a high-quality image based on your request: "${message}"

**Image Details:**
- Resolution: 1024x1024 pixels
- Quality: Professional standard
- Generated with DALL-E 3

**Image URL:** ${imageUrl}

The image has been generated and is ready for download or use in your projects. You can save it directly from the URL above.

Would you like me to create variations of this image or help you with anything else?`
          
          metadata = {
            type: 'image_generation',
            imageUrl: imageUrl,
            prompt: message
          }

          await supabase
            .from('generated_content')
            .insert({
              user_id: userId,
              content_type: 'image',
              title: `Generated Image: ${message.substring(0, 50)}...`,
              content_data: { imageUrl, prompt: message },
              prompt: message
            })

          console.log('Image generation completed and saved')
        } else {
          throw new Error('Image generation failed')
        }
      } catch (error) {
        console.error('Image generation error:', error)
        response = "I apologize, but I encountered an issue generating the image. Please try again with a more specific description, or let me know if you'd like help with document generation, file analysis, or data processing instead."
      }
    } else {
      console.log('Generating comprehensive response with GPT-4')
      
      // Enhanced system prompt for better responses
      if (wantsDataProcessing || fileContent) {
        systemPrompt += `\n\nSPECIAL FOCUS: Data Analysis & Spreadsheet Creation
- When processing data, create well-structured tables with clear headers
- Organize information logically with proper categorization
- Provide summaries and insights about the data
- Suggest actionable next steps based on the analysis`
      }

      try {
        const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 3000,
            temperature: 0.7,
          }),
        })

        if (chatResponse.ok) {
          const chatData = await chatResponse.json()
          response = chatData.choices[0].message.content

          // Enhanced metadata for different content types
          if (fileContent) {
            metadata = {
              type: 'file_analysis',
              hasFileContent: true,
              fileProcessed: true
            }
          } else if (wantsDataProcessing) {
            metadata = {
              type: 'data_processing',
              hasStructuredData: true
            }
          } else if (response.includes('workflow') || response.includes('automation')) {
            metadata = {
              type: 'workflow_automation',
              hasWorkflowLogic: true
            }
          } else {
            metadata = {
              type: 'general_assistance',
              responseType: 'comprehensive'
            }
          }

          // Save generated content for complex responses
          if (response.length > 500 || fileContent || wantsDataProcessing) {
            await supabase
              .from('generated_content')
              .insert({
                user_id: userId,
                content_type: 'document',
                title: `FlowBot Response: ${message.substring(0, 50)}...`,
                content_data: { 
                  response: response,
                  analysis: fileContent ? 'File processed and analyzed' : 'Comprehensive response generated',
                  metadata: metadata
                },
                prompt: message
              })
          }

          console.log('Comprehensive response generated successfully')
        } else {
          throw new Error('AI response generation failed')
        }
      } catch (error) {
        console.error('Chat completion error:', error)
        response = `I apologize, but I'm having trouble processing your request right now. 

However, I'm FlowBot and I'm here to help you with:
🔹 Document generation in any format
🔹 Image creation and design
🔹 File analysis and data extraction
🔹 Spreadsheet creation and data organization
🔹 Workflow automation
🔹 Text processing and understanding

Please try rephrasing your request, or let me know specifically what you'd like me to help you create or analyze!`
      }
    }

    return new Response(
      JSON.stringify({ 
        response,
        metadata,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in FlowBot function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'FlowBot encountered an error',
        message: 'I apologize for the technical difficulty. Please try your request again, and I\'ll do my best to help you with document generation, image creation, file analysis, or workflow automation.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
