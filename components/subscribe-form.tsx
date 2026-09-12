'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { newsletter } from '@/lib/content';

export function SubscribeForm() {
  const emailId = useId();
  const pending = useRef(false);
  const recoveryTimer = useRef<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [navigationDelayed, setNavigationDelayed] = useState(false);

  useEffect(() => {
    const reset = () => {
      window.clearTimeout(recoveryTimer.current);
      pending.current = false;
      setSubmitting(false);
      setNavigationDelayed(false);
    };
    window.addEventListener('pageshow', reset);
    return () => {
      window.clearTimeout(recoveryTimer.current);
      window.removeEventListener('pageshow', reset);
    };
  }, []);

  return (
    <>
      <form
        method="POST"
        action="https://atuckercrowder.activehosted.com/proc.php"
        onSubmit={(event) => {
          if (pending.current) {
            event.preventDefault();
            return;
          }
          pending.current = true;
          setSubmitting(true);
          setNavigationDelayed(false);
          // Cancelled navigation can leave this document open without pageshow.
          // Unlock retry without claiming whether the provider received the POST.
          window.clearTimeout(recoveryTimer.current);
          recoveryTimer.current = window.setTimeout(() => {
            pending.current = false;
            setSubmitting(false);
            setNavigationDelayed(true);
          }, 20_000);
        }}
      >
        {/* Routing fields from ActiveCampaign form 11's generated full embed.
            Native POST leaves validation, errors and double opt-in to the provider. */}
        <input type="hidden" name="u" value="11" />
        <input type="hidden" name="f" value="11" />
        <input type="hidden" name="s" value="" />
        <input type="hidden" name="c" value="0" />
        <input type="hidden" name="m" value="0" />
        <input type="hidden" name="act" value="sub" />
        <input type="hidden" name="v" value="2" />
        <input type="hidden" name="or" value="23820733-e66d-42ac-9aeb-93b13837cb17" />
        <label htmlFor={emailId}>
          Email address
        </label>
        <input
          className="field"
          id={emailId}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
        <button className="btn btn-gradient" type="submit" disabled={submitting}>
          {submitting ? 'Opening confirmation…' : 'Get the build notes'}
        </button>
      </form>
      <p className="form-note" role="status" aria-live="polite">
        {submitting
          ? 'Sending your request to ActiveCampaign. Subscription requires email confirmation.'
          : navigationDelayed
            ? 'If the confirmation page did not open, you can try again. If a confirmation email arrived, follow its link to subscribe.'
            : newsletter.idleNote}
      </p>
    </>
  );
}
