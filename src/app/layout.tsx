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
        <div className="fixed top-0 left-0 -z-10 h-full w-full bg-[#F0F0F2] dark:bg-slate-950" />
        <div className="fixed top-0 left-0 -z-10 h-full w-full bg-[radial-gradient(at_top_left,_#A08ABF_0%,_transparent_30%),_radial-gradient(at_bottom_right,_#B4A8D3_0%,_transparent_40%)] opacity-30 animate-pulse" />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white backdrop-blur-sm shadow-md">
          By Yash with Pyar
        </div>
      </body>
    </html>
  );
}
