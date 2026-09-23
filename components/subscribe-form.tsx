'use client';

import { useId, useState, type FormEvent } from 'react';
import { track } from '@/lib/analytics-client';

const confirmationMessage = 'If this address is eligible, a verification link will arrive by email. The request is not sent to Kit until you confirm that link.';

export function SubscribeForm({ placement = 'blog_post' }: { placement?: string }) {
  const emailId = useId();
  const statusId = useId();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'accepted' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    setStatus('submitting');
    track('subscribe_submit_intent', { placement });

    try {
      const response = await fetch('/api/kit/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, placement }),
      });
      if (!response.ok) throw new Error('Signup request was not accepted');

      setStatus('accepted');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby={statusId}>
      <label htmlFor={emailId}>Email address</label>
      <input
        className="field"
        id={emailId}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        required
        disabled={status === 'submitting' || status === 'accepted'}
        aria-invalid={status === 'error' ? true : undefined}
      />
      <button className="btn" type="submit" disabled={status === 'submitting' || status === 'accepted'}>
        {status === 'submitting' ? 'Sending…' : 'Get the build notes'}
      </button>
      <p className="form-note" id={statusId} role="status" aria-live="polite">
      {status === 'accepted' ? confirmationMessage : status === 'error' ? 'We could not submit your request. Please try again.' : 'One email a week. Unsubscribe whenever.'}
      </p>
    </form>
  );
}
