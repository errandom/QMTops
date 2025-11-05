import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SignOut } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { TeamsTable } from './management/TeamsTable';
import { SitesTable } from './management/SitesTable';
import { FieldsTable } from './management/FieldsTable';
import { ScheduleTable } from './management/ScheduleTable';
import { RequestsTable } from './management/RequestsTable';
import { UsersTable } from './management/UsersTable';

interface ManagementProps {
  onLogout: () => void;
}

export function Management({ onLogout }: ManagementProps) {
  const { authState, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('teams');

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Management Console</h1>
              <p className="text-sm text-muted-foreground">
                Logged in as: <span className="font-medium">{authState?.username}</span> ({authState?.role})
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <SignOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
          </TabsList>

          <TabsContent value="teams">
            <TeamsTable />
          </TabsContent>

          <TabsContent value="sites">
            <SitesTable />
          </TabsContent>

          <TabsContent value="fields">
            <FieldsTable />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTable />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsTable />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UsersTable />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
