
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

    console.log('Processing request for user:', userId)
    console.log('Message:', message)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let systemPrompt = `You are Sparky, an advanced AI assistant for FlowHQ - a premium client collaboration platform. You help users with:

1. DOCUMENT GENERATION: Create professional documents in any format (PDF, DOCX, TXT, etc.)
2. IMAGE GENERATION: Create images, graphics, and visual content using DALL-E
3. FILE ANALYSIS: Analyze uploaded files (PDF, CSV, DOCX, XLSX, TXT, ZIP, images) and extract data
4. SPREADSHEET CREATION: Generate organized spreadsheets from data with proper columns and formatting
5. DATA SORTING: Process and organize data from documents or text into structured formats
6. WORKFLOW AUTOMATION: Help automate business processes and workflows
7. TEXT UNDERSTANDING: Comprehend and process any text content for various tasks

Always be helpful, professional, and efficient. When generating content, provide clear, actionable results. For file analysis, extract key information and present it in an organized manner.`

    let userPrompt = message
    let fileContent = null

    // If there's a file, download and analyze it
    if (fileUrl) {
      try {
        console.log('Downloading file:', fileUrl)
        const { data: fileData } = await supabase.storage
          .from('user-files')
          .download(fileUrl)
        
        if (fileData) {
          // Convert file to text for analysis (this is a simplified version)
          fileContent = await fileData.text()
          userPrompt += `\n\nFile content to analyze:\n${fileContent.substring(0, 4000)}...`
          console.log('File content loaded, length:', fileContent.length)
        }
      } catch (error) {
        console.error('Error downloading file:', error)
      }
    }

    // Determine if user wants image generation
    const imageKeywords = ['image', 'picture', 'photo', 'generate image', 'create image', 'visual', 'graphic', 'illustration', 'draw', 'design']
    const wantsImage = imageKeywords.some(keyword => message.toLowerCase().includes(keyword))

    let response = ''
    let metadata = {}

    if (wantsImage) {
      console.log('Generating image with DALL-E')
      // Generate image using DALL-E
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
        
        response = `I've generated an image based on your request: "${message}"\n\nImage URL: ${imageUrl}\n\nThe image has been created and is ready for download. Would you like me to help you with anything else related to this image or create additional content?`
        
        metadata = {
          type: 'image_generation',
          imageUrl: imageUrl,
          prompt: message
        }

        // Save generated content to database
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
        const errorData = await imageResponse.text()
        console.error('Image generation failed:', errorData)
        response = "I apologize, but I encountered an issue generating the image. Please try again with a different description."
      }
    } else {
      console.log('Generating text response with GPT-4')
      // Generate text response using GPT-4
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
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        response = chatData.choices[0].message.content

        // Check if the response contains structured data that should be saved
        if (response.includes('spreadsheet') || response.includes('table') || response.includes('data analysis')) {
          metadata = {
            type: 'data_analysis',
            hasStructuredData: true
          }

          // Save generated content
          await supabase
            .from('generated_content')
            .insert({
              user_id: userId,
              content_type: 'document',
              title: `AI Analysis: ${message.substring(0, 50)}...`,
              content_data: { analysis: response },
              prompt: message
            })
        }
        console.log('Text response generated successfully')
      } else {
        const errorData = await chatResponse.text()
        console.error('Chat completion failed:', errorData)
        response = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
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
    console.error('Error in ai-assistant function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Something went wrong processing your request.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
