import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
    children: ReactNode;
    currentPage: string;
    onNavigate: (page: string) => void;
    onAddClick: () => void;
    pageTitle: string;
    pageSubtitle?: string;
}

export function Layout({
    children,
    currentPage,
    onNavigate,
    onAddClick,
    pageTitle,
    pageSubtitle,
}: LayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Desktop Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={onNavigate}
                onCollapseChange={setIsSidebarCollapsed}
            />

            {/* Main Content */}
            <div className={cn('min-h-screen flex flex-col transition-all duration-300', isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64')}>
                <Header title={pageTitle} subtitle={pageSubtitle} onNavigate={onNavigate} />

                <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <BottomNav
                currentPage={currentPage}
                onNavigate={onNavigate}
                onAddClick={onAddClick}
            />
        </div>
    );
}

export { Sidebar } from './Sidebar';
export { BottomNav } from './BottomNav';
export { Header } from './Header';
