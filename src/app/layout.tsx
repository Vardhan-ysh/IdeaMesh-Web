import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'IdeaMesh',
  description: 'Visualize and connect your ideas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <div className="fixed bottom-2 right-4 z-[999] text-xs text-muted-foreground font-medium pointer-events-none">
          by Yash with Pyar ðŸ« 
        </div>
      </body>
    </html>
  );
}
