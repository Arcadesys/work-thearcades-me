'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/analytics-client';
import styles from './newsletter-verification.module.css';

type ViewState = 'loading' | 'ready' | 'submitting' | 'busy' | 'active' | 'kit_confirmation' | 'completed' | 'cancelled' | 'unavailable' | 'invalid' | 'error';

export function NewsletterVerification() {
  const [token, setToken] = useState('');
  const [state, setState] = useState<ViewState>('loading');
  const readFragment = useRef(false);

  useEffect(() => {
    if (readFragment.current) return;
    readFragment.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const challenge = params.get('token') ?? '';
    window.history.replaceState(null, '', window.location.pathname);
    queueMicrotask(() => {
      setToken(challenge);
      setState(challenge ? 'ready' : 'invalid');
    });
  }, []);

  async function submit(action: 'confirm' | 'cancel') {
    if (!token || state === 'submitting') return;
    setState('submitting');
    try {
      const response = await fetch(action === 'confirm' ? '/api/kit/verify' : '/api/kit/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await response.json().catch(() => null) as { accepted?: boolean; state?: string; cancelled?: boolean } | null;

      if (action === 'cancel') {
        setState(response.ok && result?.cancelled ? 'cancelled' : 'error');
        return;
      }

      if (response.ok && result?.accepted && result.state === 'active') {
        setState('active');
        track('subscribe_request_accepted');
      } else if (response.ok && result?.accepted && result.state === 'kit_confirmation_required') {
        setState('kit_confirmation');
        track('subscribe_request_accepted');
      } else if (result?.state === 'completed') {
        setState('completed');
      } else if (result?.state === 'unavailable') {
        setState('unavailable');
      } else if (response.status === 410) {
        setState('invalid');
      } else if (result?.state === 'processing') {
        setState('busy');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  const finished = ['active', 'kit_confirmation', 'completed', 'cancelled', 'unavailable', 'invalid'].includes(state);
  const message = state === 'loading' ? 'Reading your confirmation link…'
    : state === 'ready' ? 'Confirm your email and request for Work build notes. If Kit needs an additional confirmation, it will send a second message before the notes begin.'
      : state === 'submitting' ? 'Processing your request…'
        : state === 'busy' ? 'Your request is still being processed. You can safely try again in a moment.'
        : state === 'active' ? 'Your email is verified and your Work build notes request is active.'
          : state === 'kit_confirmation' ? 'Your email is verified. Kit needs a separate confirmation before the build notes begin. Check for another message from Kit.'
            : state === 'completed' ? 'This confirmation link has already been used.'
              : state === 'cancelled' ? 'Your pending request was canceled.'
                : state === 'unavailable' ? 'Kit cannot add this address right now. Contact me if you need help.'
                  : state === 'invalid' ? 'This link is invalid, expired, or no longer current. Start a new request from the site.'
                    : 'We could not finish this request. You can retry while this page is open.';

  return (
    <section className={styles.card} aria-labelledby="newsletter-verify-title">
      <p className={styles.eyebrow}>Work build notes</p>
      <h1 id="newsletter-verify-title">Confirm your email</h1>
      <p className={styles.message} role="status" aria-live="polite">{message}</p>
      {state === 'ready' || state === 'error' || state === 'busy' ? (
        <div className={styles.actions}>
          <button className="btn btn-gradient" type="button" onClick={() => void submit('confirm')} disabled={!token}>
            {state === 'ready' ? 'Confirm email' : 'Try confirmation again'}
          </button>
          {state === 'ready' && <button className="btn btn-outline" type="button" onClick={() => void submit('cancel')}>Cancel request</button>}
        </div>
      ) : null}
      {state === 'submitting' && !finished ? <p className={styles.note}>If this takes more than a few seconds, wait before trying again.</p> : null}
    </section>
  );
}
