import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ClientHubDashboard from '@/components/crm/ClientHubDashboard';

export default function ClientHubPage() {
  return (
    <DashboardLayout currentPage="Client Hub">
      <ClientHubDashboard />
    </DashboardLayout>
  );
} 