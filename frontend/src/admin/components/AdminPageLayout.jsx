import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export const AdminPageLayout = ({ icon, title, description, headerActions, children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 min-h-screen">
          <main className="flex-1 p-4 md:p-6 space-y-6 w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-foreground hover:bg-accent border p-2 rounded-lg" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    {icon}
                    {title}
                  </h1>
                  {description && (
                    <p className="text-muted-foreground text-sm">{description}</p>
                  )}
                </div>
              </div>
              {headerActions}
            </div>

            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
