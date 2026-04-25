import { useState, type ReactNode, type FC } from 'react';
import { GuideSidebar } from './GuideSidebar';
import { GuideHeader } from './GuideHeader';

interface GuideLayoutProps {
  children: ReactNode;
  currentPage: string;
}

export const GuideLayout: FC<GuideLayoutProps> = ({ children, currentPage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen font-outfit overflow-x-hidden">
      {/* Sidebar - Controlled by Layout */}
      <GuideSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 transition-all duration-500 ease-in-out min-w-0">
        {/* Header - Receives toggle function */}
        <GuideHeader 
          currentPage={currentPage} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* Content Section */}
        <main className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
