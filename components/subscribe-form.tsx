'use client';

import { FormEvent, useId, useState } from 'react';
import { newsletter } from '@/lib/content';

type State = 'idle' | 'submitting' | 'success' | 'error';

export function SubscribeForm({ placement = 'blog_post' }: { placement?: string }) {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState(newsletter.idleNote);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'submitting') return;

    setState('submitting');
    setMessage('Adding you to the build notes…');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, placement }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Could not subscribe right now.');
      }

      setState('success');
      setMessage("You're on the list. Welcome aboard.");
      setEmail('');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not subscribe right now.');
    }
  }

  return (
    <form onSubmit={submit} noValidate={false}>
      <label htmlFor={emailId}>Email address</label>
      <input
        className="field"
        id={emailId}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={state === 'submitting'}
      />
      <button
        className="btn btn-gradient"
        type="submit"
        disabled={state === 'submitting'}
        data-funnel-event="subscribe_submit"
        data-funnel-placement={placement}
      >
        {state === 'submitting' ? 'Adding you…' : 'Get the build notes'}
      </button>
      <p className="form-note" role={state === 'error' ? 'alert' : 'status'} aria-live="polite">
        {message}
      </p>
    </form>
  );
}
