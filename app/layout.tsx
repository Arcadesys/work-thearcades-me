import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Austen Tucker-Crowder — AI Builder & Evangelist',
  description: 'AI transformation leadership, practical building, and accessible enablement by Austen Tucker-Crowder.',
  metadataBase: new URL('https://work.thearcades.me'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
