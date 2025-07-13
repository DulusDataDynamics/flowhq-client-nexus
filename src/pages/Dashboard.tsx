
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AIAssistant } from '@/components/AIAssistant';
import { AuthForm } from '@/components/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  FileText, 
  Bot, 
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalFiles: 0,
    aiInteractions: 0,
    generatedContent: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      const [projects, files, conversations, generated] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('files').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('ai_conversations').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('generated_content').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        totalProjects: projects.count || 0,
        totalFiles: files.count || 0,
        aiInteractions: conversations.count || 0,
        generatedContent: generated.count || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your FlowHQ workspace.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active client projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Documents and media files
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiInteractions}</div>
            <p className="text-xs text-muted-foreground">
              Conversations with Sparky
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Content</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generatedContent}</div>
            <p className="text-xs text-muted-foreground">
              AI-created documents & images
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bot className="mr-2 h-4 w-4" />
              Chat with AI Assistant
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Features</CardTitle>
            <CardDescription>
              What Sparky can help you with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Generate documents in any format</li>
              <li>• Create and edit images</li>
              <li>• Analyze and sort data from files</li>
              <li>• Build custom spreadsheets</li>
              <li>• Automate workflow processes</li>
              <li>• Extract information from documents</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading FlowHQ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'projects':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">
                  Projects management coming soon! For now, use the AI Assistant to create and manage your work.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">
                  Settings panel coming soon! Your account is managed automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </DashboardLayout>
  );
};

export default Dashboard;
