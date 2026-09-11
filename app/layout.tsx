import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

/**
 * Browser chrome (the mobile address bar, the PWA title bar) follows the same
 * system setting the stylesheet does, so it never frames a light page in a
 * dark bar or vice versa. Colours mirror `--bg` in each palette.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9fd' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a14' },
  ],
};

export const metadata: Metadata = {
  title: 'Austen Tucker-Crowder — AI Builder & Evangelist',
  description: 'AI transformation leadership, practical building, and accessible enablement by Austen Tucker-Crowder.',
  metadataBase: new URL('https://work.thearcades.me'),
};

/**
 * Runs synchronously while the browser parses `<body>`, so `[data-reveal]`
 * elements are hidden before the first paint instead of flashing in after
 * hydration. If motion is reduced — or this script never runs — the class is
 * absent and every element stays visible.
 */
const revealBootstrap = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("reveal-ready")}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
        {children}
      </body>
    </html>
  );
}
