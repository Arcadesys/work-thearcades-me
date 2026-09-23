'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './newsletter-verification.module.css';

type State = 'loading' | 'ready' | 'submitting' | 'done' | 'invalid' | 'error';

export function NewsletterUnsubscribe() {
  const [token, setToken] = useState('');
  const [state, setState] = useState<State>('loading');
  const readFragment = useRef(false);

  useEffect(() => {
    if (readFragment.current) return;
    readFragment.current = true;
    const fragment = window.location.hash.slice(1);
    const tokenValue = new URLSearchParams(fragment).get('token') ?? fragment;
    window.history.replaceState(null, '', window.location.pathname);
    queueMicrotask(() => {
      setToken(tokenValue);
      setState(tokenValue ? 'ready' : 'invalid');
    });
  }, []);

  async function unsubscribe() {
    if (!token || state === 'submitting') return;
    setState('submitting');
    try {
      const response = await fetch('/api/kit/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await response.json().catch(() => null) as { unsubscribed?: boolean } | null;
      setState(response.ok && result?.unsubscribed ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  const message = state === 'loading' ? 'Reading your unsubscribe link…'
    : state === 'ready' ? 'Use this button to unsubscribe this address from email sent through Kit.'
      : state === 'submitting' ? 'Updating your email preferences…'
        : state === 'done' ? 'This address has been unsubscribed from Kit email.'
          : state === 'invalid' ? 'This unsubscribe link is missing or invalid. You can unsubscribe from any Kit email using its unsubscribe link.'
            : 'We could not update your email preferences. You can safely try again.';

  return (
    <section className={styles.card} aria-labelledby="newsletter-unsubscribe-title">
      <p className={styles.eyebrow}>Work build notes</p>
      <h1 id="newsletter-unsubscribe-title">Unsubscribe from email</h1>
      <p className={styles.message} role="status" aria-live="polite">{message}</p>
      {state === 'ready' || state === 'error' ? (
        <div className={styles.actions}>
          <button className="btn btn-gradient" type="button" onClick={() => void unsubscribe()}>
            {state === 'ready' ? 'Unsubscribe from Kit email' : 'Try again'}
          </button>
        </div>
      ) : null}
      {state === 'submitting' ? <p className={styles.note}>Please wait while Kit updates your subscription.</p> : null}
    </section>
  );
}
