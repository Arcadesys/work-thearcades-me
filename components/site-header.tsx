'use client';

import { useEffect, useRef } from 'react';
import { BrandMark } from './brand-mark';

const links = [
  ['Work', '/#work'],
  ['Work with me', '/work-with-me'],
  ['About', '/#about'],
  ['Blog', '/blog'],
  ['Contact', '/#contact'],
  ['Build notes', '/#subscribe'],
  ['Résumé', '/resume'],
] as const;

export function SiteHeader({ home = false, current }: { home?: boolean; current?: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const measure = () => {
      document.documentElement.style.setProperty('--header-clearance', `${element.getBoundingClientRect().height + 16}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-clearance');
    };
  }, []);

  function closeMenu() {
    if (disclosure.current?.open) {
      disclosure.current.open = false;
      summary.current?.focus();
    }
  }

  function navigation(label: string) {
    return (
      <nav className="site-nav" aria-label={label}>
        {links.map(([text, destination]) => (
          <a
            key={text}
            href={home && destination.startsWith('/#') ? destination.slice(1) : destination}
            className={text === 'Work with me' ? 'nav-cta' : undefined}
            aria-current={current === destination ? 'page' : undefined}
          >
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
        <details
          className="mobile-navigation"
          ref={disclosure}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && disclosure.current?.open) {
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
        </details>
      </header>
    </div>
  );
}
