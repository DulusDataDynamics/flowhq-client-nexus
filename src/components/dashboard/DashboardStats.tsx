
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Bot, TrendingUp } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanLimits';

interface DashboardStatsProps {
  stats: {
    totalProjects: number;
    totalFiles: number;
    aiInteractions: number;
    generatedContent: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const { planLimits } = usePlanLimits();

  const getUsagePercentage = () => {
    if (planLimits.maxClients === -1) return 20; // Show 20% for unlimited
    return Math.min((stats.totalProjects / planLimits.maxClients) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (planLimits.maxClients === -1) return 'bg-green-600';
    if (percentage >= 80) return 'bg-red-600';
    if (percentage >= 60) return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {planLimits.maxClients === -1 ? 'Unlimited clients' : `of ${planLimits.maxClients} clients`}
          </p>
          {planLimits.maxClients !== -1 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getUsageColor()}`}
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Files Shared</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFiles}</div>
          <p className="text-xs text-muted-foreground">
            Total uploaded files
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
            FlowBot conversations
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
            AI generated items
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
