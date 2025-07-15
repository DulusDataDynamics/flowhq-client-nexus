
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      // For now, we'll use mock data since we need to implement chat sessions
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chat History
          </CardTitle>
          <Button size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4">
            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No chat history yet
              </div>
            ) : (
              chatSessions.map((session) => (
                <Button
                  key={session.id}
                  variant={currentChatId === session.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => onSelectChat(session.id)}
                >
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium truncate">{session.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleDateString()} • {session.message_count} messages
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
