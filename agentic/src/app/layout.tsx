import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Agentic Jobs Marketplace',
  description: 'MVP job marketplace connecting employers and job seekers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
            </main>
            <footer className="border-t bg-white py-4 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Agentic Jobs. All rights reserved.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
