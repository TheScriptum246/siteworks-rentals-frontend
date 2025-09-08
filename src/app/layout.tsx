import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SiteWorks Rentals - Construction Equipment Rental',
    description: 'Professional construction equipment rental management system. Book quality tools and equipment for your construction projects.',
    keywords: 'construction, equipment, rental, tools, machinery, building, contractors',
    authors: [{ name: 'SiteWorks Team' }],
    robots: 'index, follow',
    openGraph: {
        title: 'SiteWorks Rentals - Construction Equipment Rental',
        description: 'Professional construction equipment rental management system',
        type: 'website',
        locale: 'en_US',
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#4ade80',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </AuthProvider>
        </body>
        </html>
    );
}