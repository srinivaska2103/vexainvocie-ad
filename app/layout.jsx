import './globals.css';
import { SuperAdminLayout } from '@/components/SuperAdminLayout';

export const metadata = {
  title: 'VEXA TECH — SaaS Super Admin Control Engine',
  description: 'Enterprise administration panel for VEXA Invoice SaaS platform',
  icons: {
    icon: [
      { url: '/vexa-logo.png?v=2', type: 'image/png' },
      { url: '/logo.png?v=2', type: 'image/png' },
    ],
    shortcut: '/vexa-logo.png?v=2',
    apple: '/vexa-logo.png?v=2',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/vexa-logo.png?v=2" />
        <link rel="shortcut icon" href="/vexa-logo.png?v=2" />
        <link rel="apple-touch-icon" href="/vexa-logo.png?v=2" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <SuperAdminLayout>{children}</SuperAdminLayout>
      </body>
    </html>
  );
}
