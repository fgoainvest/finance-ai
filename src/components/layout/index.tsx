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
    return (
        <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
            {/* Desktop Sidebar */}
            <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

            {/* Main Content */}
            <div className={cn('md:ml-64 min-h-screen flex flex-col')}>
                <Header title={pageTitle} subtitle={pageSubtitle} />

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
