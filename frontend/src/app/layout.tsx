import type { Metadata } from 'next/types';
import { Prompt } from 'next/font/google';

// ** Config Imports
import themeConfig from '@/configs/themeConfig';

// ** Component Imports
import Providers from './providers';

// ** Global Styles
import '@/styles/globals.css';

// Force dynamic rendering to prevent static generation issues with React Context
export const dynamic = 'force-dynamic';

// ** Google Fonts
const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-prompt',
});

export const metadata: Metadata = {
  title: {
    template: `%s - ${themeConfig.templateName}`,
    default: `${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`,
  },
  description: `${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`,
  keywords: [themeConfig.templateName, 'NKTC', 'Student Management', 'Education'],
  authors: [{ name: 'Midseelee' }],
  creator: 'Midseelee',
  publisher: 'NKTC',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: `${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`,
    description: `${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`,
    siteName: themeConfig.templateName,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`,
    description: `${themeConfig.templateName} - ระบบดูแลช่วยเหลือนักเรียน`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='th' suppressHydrationWarning>
      <body className={`${prompt.variable} ${prompt.className}`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
