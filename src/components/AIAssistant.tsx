
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Bot, 
  User, 
  Upload, 
  Download,
  FileText,
  Image,
  BarChart3,
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
  const [isDragOver, setIsDragOver] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversationHistory();
  }, []);

  // Auto-dismiss toast messages after 5 seconds
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      showToast("File selected", `${droppedFile.name} ready for analysis`);
    }
  }, [showToast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      showToast("File selected", `${selectedFile.name} ready for analysis`);
    }
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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          fileUrl,
          userId: user.id
        }
      });

      if (error) throw error;

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

    } catch (error) {
      console.error('Error sending message:', error);
      showToast("Error", "Failed to send message. Please try again.", "destructive");
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
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
          {/* Drag and Drop Zone */}
          <div
            className={`mb-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragOver ? 'Drop files here' : 'Drag and drop files for AI analysis'}
            </p>
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
                      {message.metadata && (
                        <div className="mt-2 text-xs opacity-75">
                          <p>Generated content available for download</p>
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

          {/* Input area */}
          <div className="border-t pt-4">
            {file && (
              <div className="mb-2 p-2 bg-blue-50 rounded flex items-center justify-between">
                <span className="text-sm">📎 {file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
            
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to generate documents, create images, analyze files, sort data, create spreadsheets, automate workflows..."
                  disabled={loading}
                  className="resize-none"
                />
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !file)}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
