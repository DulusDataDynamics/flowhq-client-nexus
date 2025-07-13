
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadArea } from '@/components/files/FileUploadArea';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { 
  Bot, 
  User, 
  FileText,
  Image,
  BarChart3,
  Upload,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: any;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const showToast = useCallback((title: string, description: string, variant?: "default" | "destructive") => {
    toast({
      title,
      description,
      variant,
      duration: 5000
    });
  }, [toast]);

  const loadConversationHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error loading conversation history:', error);
      return;
    }

    const formattedMessages: Message[] = [];
    data.forEach((conv) => {
      formattedMessages.push({
        id: `${conv.id}-user`,
        content: conv.message,
        isUser: true,
        timestamp: new Date(conv.created_at)
      });
      formattedMessages.push({
        id: `${conv.id}-bot`,
        content: conv.response,
        isUser: false,
        timestamp: new Date(conv.created_at),
        metadata: conv.metadata
      });
    });

    setMessages(formattedMessages);
  };

  const uploadFile = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('user-files')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    await supabase
      .from('files')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: fileName,
        file_type: file.type,
        file_size: file.size
      });

    return fileName;
  };

  const sendMessage = async () => {
    if (!input.trim() && !file) return;
    if (!user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: file ? `${input} [File: ${file.name}]` : input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile(file);
        setFile(null);
      }

      console.log('Sending message to FlowBot:', input);
      console.log('File URL:', fileUrl);
      console.log('User ID:', user.id);

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          fileUrl,
          userId: user.id
        }
      });

      console.log('FlowBot response:', data);
      console.log('FlowBot error:', error);

      if (error) {
        console.error('FlowBot function error:', error);
        throw new Error(error.message || 'Failed to get response from FlowBot');
      }

      if (!data || !data.response) {
        throw new Error('Invalid response from FlowBot');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        metadata: data.metadata
      };

      setMessages(prev => [...prev, botMessage]);

      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          message: input,
          response: data.response,
          message_type: fileUrl ? 'file_analysis' : 'chat',
          metadata: data.metadata
        });

      showToast("FlowBot", "Response generated successfully");

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm having trouble processing your request right now. Error: ${errorMessage}. Please try again, or let me know if you need help with document generation, image creation, file analysis, or workflow automation!`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
      showToast("Error", "Failed to send message. Please try again.", "destructive");
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      showToast("File selected", `${files[0].name} ready for analysis`);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            FlowBot AI Assistant
          </CardTitle>
          <p className="text-sm text-gray-600">
            I can generate documents & images, analyze files, create spreadsheets, sort data, automate workflows, and understand any text!
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* File Upload Area */}
          <div className="mb-4">
            <FileUploadArea onFilesSelected={handleFilesSelected} uploading={false} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <p>Hi! I'm FlowBot, your AI assistant. How can I help you today?</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-center p-2 bg-blue-50 rounded">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Documents
                  </div>
                  <div className="flex items-center justify-center p-2 bg-green-50 rounded">
                    <Image className="mr-2 h-4 w-4" />
                    Create Images
                  </div>
                  <div className="flex items-center justify-center p-2 bg-purple-50 rounded">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Data Analysis & Spreadsheets
                  </div>
                  <div className="flex items-center justify-center p-2 bg-orange-50 rounded">
                    <Upload className="mr-2 h-4 w-4" />
                    File Processing & Sorting
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-start">
                    {message.isUser ? (
                      <User className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.metadata && message.metadata.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={message.metadata.imageUrl} 
                            alt="Generated image" 
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}
                      {message.metadata && (
                        <div className="mt-2 text-xs opacity-75">
                          <p>Generated content available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="mr-2 h-4 w-4" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2">FlowBot is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <ChatInterface
            input={input}
            setInput={setInput}
            onSendMessage={sendMessage}
            loading={loading}
            file={file}
            setFile={setFile}
          />
        </CardContent>
      </Card>
    </div>
  );
};
