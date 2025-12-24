import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bitcoin in Africa Directory - API',
  description: 'Backend API for Bitcoin in Africa Live Directory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

