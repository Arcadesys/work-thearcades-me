'use client';

import { useEffect } from 'react';

/**
 * Fades `[data-reveal]` elements in as they enter the viewport.
 *
 * The `reveal-ready` class that hides them is added pre-paint by the inline
 * script in `app/layout.tsx`, so nothing flashes on load and content stays
 * visible when JS never runs. `data-reveal` holds a 1-based stagger step.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('reveal-ready')) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (nodes.length === 0) {
      root.classList.remove('reveal-ready');
      return;
    }

    const show = (node: HTMLElement) => {
      const step = Number(node.dataset.reveal) || 1;
      node.style.transitionDelay = `${Math.min(step - 1, 5) * 70}ms`;
      node.classList.add('is-revealed');
    };

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
