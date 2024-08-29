import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';

import Header from '@/components/header';
import Spinner from '@/components/spinner';
import UserContextProvider from '@/contexts/user-context';
import LoadingContextProvider from '@/contexts/loading-context';

import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RaffleHub',
  description: 'Creación y administración de sorteos y rifas',
  applicationName: 'RaffleHub',
  authors: [{ name: 'Juan Daniel', url: 'https://github.com/juandanieldev29' }],
  keywords: ['rifas', 'sorteos'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} default-background-color default-color-text`}>
        <LoadingContextProvider>
          <Spinner />
          <UserContextProvider>
            <Header />
            {children}
          </UserContextProvider>
        </LoadingContextProvider>
        <Script src="https://kit.fontawesome.com/ecb1fa5ff2.js" crossOrigin="anonymous" />
      </body>
    </html>
  );
}
