import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false} side="right">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 relative flex">
        <div
          data-sidebar-content
          className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <AppSidebar />
      </div>
    </SidebarProvider>
  );
}
