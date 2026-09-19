import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Lora } from 'next/font/google';
import { AnalyticsEvents } from '@/components/analytics-events';
import { PublicAnalytics } from '@/components/public-analytics';
import { homepageMetadata } from '@/lib/site-metadata';
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

export const metadata: Metadata = homepageMetadata;

/**
 * Resolves the palette before the first paint, so the page never flashes the
 * wrong one. `data-theme` is the resolved palette the stylesheet keys off;
 * `data-theme-mode` is the reader's choice, which decides the selected pill in
 * the theme switch. No stored value means "follow the operating system", so
 * the storage read and the media query are tried independently — a private
 * window that refuses storage still gets the system's palette.
 *
 * The key must stay in step with THEME_STORAGE_KEY in components/theme-switch.
 * If this script never runs, no attribute is set and :root's dark palette
 * stands, which is what the site shipped with before either existed.
 */
const themeBootstrap = `(function(){var r=document.documentElement;var m="auto";try{var v=localStorage.getItem("theme");if(v==="light"||v==="dark"){m=v}}catch(e){}var t="dark";try{if(m==="auto"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}else{t=m}}catch(e){t=m==="light"?"light":"dark"}r.setAttribute("data-theme-mode",m);r.setAttribute("data-theme",t)})()`;

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
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
        {children}
        <PublicAnalytics />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
