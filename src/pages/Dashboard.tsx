
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AIAssistant } from '@/components/AIAssistant';
import { ClientsPage } from '@/components/ClientsPage';
import { FilesPage } from '@/components/FilesPage';
import { InvoicesPage } from '@/components/InvoicesPage';
import { SettingsPage } from '@/components/SettingsPage';
import { AuthForm } from '@/components/AuthForm';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

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
        return <DashboardOverview onNavigate={setCurrentPage} />;
      case 'clients':
        return <ClientsPage />;
      case 'files':
        return <FilesPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'flowbot':
        return <AIAssistant />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview onNavigate={setCurrentPage} />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </DashboardLayout>
  );
};

export default Dashboard;
