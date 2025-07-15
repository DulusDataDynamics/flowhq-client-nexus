
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Plus, Clock } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
}

export const ChatHistory = ({ onSelectChat, onNewChat, currentChatId }: ChatHistoryProps) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      // Mock data for chat sessions - in a real app, you'd group conversations by session
      const mockSessions: ChatSession[] = [
        {
          id: 'session-1',
          title: 'Project Analysis',
          created_at: new Date().toISOString(),
          message_count: 12
        },
        {
          id: 'session-2',
          title: 'Document Generation',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          message_count: 8
        },
        {
          id: 'session-3',
          title: 'Data Report',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          message_count: 15
        }
      ];

      setChatSessions(mockSessions);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Button size="sm" onClick={onNewChat} className="w-full">
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {loading ? (
            <div className="text-center text-muted-foreground text-sm">Loading...</div>
          ) : chatSessions.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm">
              No chat history yet
            </div>
          ) : (
            chatSessions.map((session) => (
              <Button
                key={session.id}
                variant={currentChatId === session.id ? "default" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => onSelectChat(session.id)}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium truncate flex-1">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{session.message_count} messages</span>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
