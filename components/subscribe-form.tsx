'use client';

import { useId, useState, type FormEvent } from 'react';
import { track } from '@/lib/analytics-client';

const confirmationMessage = 'Request received. Check your inbox for a confirmation email. Your subscription starts after you confirm.';
const alreadyActiveMessage = 'This address is already active in Kit, so it was not added to the Work confirmation form. Try another address or contact me for help.';

export function SubscribeForm({ placement = 'blog_post' }: { placement?: string }) {
  const emailId = useId();
  const statusId = useId();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'accepted' | 'already_active' | 'error'>('idle');

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
        body: JSON.stringify({ email }),
      });
      if (response.status === 409) {
        const result = await response.json().catch(() => null) as { reason?: string } | null;
        if (result?.reason === 'already_active') {
          setStatus('already_active');
          return;
        }
      }
      if (!response.ok) throw new Error('Signup request was not accepted');

      setStatus('accepted');
      form.reset();
      track('subscribe_request_accepted', { placement });
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
        {status === 'accepted' ? confirmationMessage : status === 'already_active' ? alreadyActiveMessage : status === 'error' ? 'We could not submit your request. Please try again.' : 'One email a week. Unsubscribe whenever.'}
      </p>
    </form>
  );
}
