import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UBO Portal',
  description: 'Unified Back Office Portal for Asset Management',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
