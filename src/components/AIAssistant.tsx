
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Plus, History, X, Upload } from 'lucide-react';
import { ChatInterface } from './ai/ChatInterface';
import { ChatHistory } from './ai/ChatHistory';
import { FileAnalysis } from './ai/FileAnalysis';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  fileAnalysis?: any;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showFileAnalysis, setShowFileAnalysis] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (currentChatId) {
        // In a real app, you'd filter by chat session
        // For now, we'll load all conversations
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedMessages: Message[] = [];
      data.forEach(conversation => {
        formattedMessages.push({
          id: `${conversation.id}-user`,
          content: conversation.message,
          sender: 'user',
          timestamp: new Date(conversation.created_at)
        });
        formattedMessages.push({
          id: `${conversation.id}-assistant`,
          content: conversation.response,
          sender: 'assistant',
          timestamp: new Date(conversation.created_at)
        });
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !file) || !user || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || (file ? `Uploaded file: ${file.name}` : ''),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let messageContent = input;
      
      // If there's a file, enhance the message
      if (file) {
        messageContent += `\n\nFile uploaded: ${file.name} (${file.type})`;
        setFile(null);
      }

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          message: messageContent,
          requestAnalysis: input.toLowerCase().includes('analyze') || input.toLowerCase().includes('report')
        }
      });

      if (error) throw error;

      let assistantResponse = data.response || 'I can help you with document generation, data analysis, file processing, and workflow automation. What would you like me to assist you with today?';
      
      // Enhanced responses for analysis requests
      if (input.toLowerCase().includes('analyze') || input.toLowerCase().includes('report')) {
        assistantResponse += '\n\n📊 **Analysis Capabilities:**\n• Generate detailed reports and insights\n• Process and analyze uploaded files\n• Create data visualizations\n• Identify trends and patterns\n• Export findings to various formats\n\nPlease upload a file or provide more details about what you\'d like me to analyze.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save conversation to database
      await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          message: messageContent,
          response: assistantMessage.content,
          message_type: 'chat'
        });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    toast({
      title: "New chat started",
      description: "Ready for a fresh conversation!"
    });
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    toast({
      title: "Chat loaded",
      description: "Previous conversation restored"
    });
  };

  const handleAnalysisComplete = (analysis: any, fileName: string) => {
    const analysisMessage: Message = {
      id: Date.now().toString(),
      content: `📊 **File Analysis Complete: ${fileName}**\n\n**Summary:** ${analysis.summary}\n\n**Key Points:**\n${analysis.keyPoints.map((point: string) => `• ${point}`).join('\n')}\n\n**Recommendations:**\n${analysis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`,
      sender: 'assistant',
      timestamp: new Date(),
      fileAnalysis: analysis
    };

    setMessages(prev => [...prev, analysisMessage]);
    setShowFileAnalysis(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Please log in to access FlowBot.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8" />
          FlowBot AI Assistant
        </h2>
        <p className="text-muted-foreground">
          Your intelligent assistant for document generation, data analysis, and workflow automation.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Chat History Sidebar - Collapsible */}
        {showHistory && (
          <div className="w-80">
            <Card className="h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Chat History
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setShowHistory(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ChatHistory 
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                  currentChatId={currentChatId}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Professional AI Assistant</CardTitle>
                  <CardDescription>
                    Generate documents, analyze data, and automate workflows with AI.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowFileAnalysis(!showFileAnalysis)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNewChat}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Chat
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Welcome to FlowBot!</p>
                      <p className="text-sm">I can help you with:</p>
                      <div className="text-sm mt-2 space-y-1">
                        <p>• Document generation and templates</p>
                        <p>• Data analysis and reporting</p>
                        <p>• File processing and insights</p>
                        <p>• Workflow automation</p>
                      </div>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
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
      </div>

      {/* File Analysis Panel */}
      {showFileAnalysis && (
        <FileAnalysis onAnalysisComplete={handleAnalysisComplete} />
      )}
    </div>
  );
};
