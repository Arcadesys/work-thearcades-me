'use client';

import { useEffect, useRef } from 'react';

import { BrandMark } from './brand-mark';
import { ThemeSwitch } from './theme-switch';

const links = [
  ['Work', '/#work'],
  ['Work with me', '/work-with-me'],
  ['About', '/#about'],
  ['Blog', '/blog'],
  ['Contact', '/#contact'],
  ['Build notes', '/#subscribe'],
  ['Résumé', '/resume'],
] as const;

type SiteHeaderProps = { home?: boolean; current?: string };

export function SiteHeader({ home = false, current }: SiteHeaderProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const measure = () => document.documentElement.style.setProperty('--header-clearance', `${element.getBoundingClientRect().height + 16}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-clearance');
    };
  }, []);

  function closeMenu() {
    if (!disclosure.current?.open) return;
    disclosure.current.open = false;
    summary.current?.focus();
  }

  function href(destination: string) {
    return home && destination.startsWith('/#') ? destination.slice(1) : destination;
  }

  function navigation(label: string) {
    const destinations = links.map(([text, destination]) =>
      current === '/work-with-me' && text === 'Blog' ? ['Notes', '/#notes'] : [text, destination],
    );

    return (
      <nav className="site-nav" aria-label={label}>
        {destinations.map(([text, destination]) => (
          <a key={text} href={href(destination)} className={destination === '/work-with-me' ? 'nav-cta' : undefined} aria-current={current === destination ? 'page' : undefined}>
            {text}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <div className="header-wrap" ref={wrapper}>
      <header className="site-header">
        <a className="brand" href={home ? '#top' : '/'}>
          <BrandMark />
          <span className="visually-hidden">Austen Tucker-Crowder — {home ? 'back to top' : 'home'}</span>
        </a>
        <div className="desktop-navigation">{navigation('Main')}</div>
        <div className="desktop-theme"><ThemeSwitch /></div>
        <details
          className="mobile-navigation"
          ref={disclosure}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeMenu();
            }
          }}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) closeMenu();
          }}
        >
          <summary ref={summary}>Menu</summary>
          {navigation('Main')}
          <ThemeSwitch />
        </details>
      </header>
    </div>
  );
}
