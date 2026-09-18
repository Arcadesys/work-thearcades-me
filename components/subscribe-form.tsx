'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { newsletter } from '@/lib/content';

export function SubscribeForm({ placement = 'blog_post' }: { placement?: string }) {
  const emailId = useId();
  const pending = useRef(false);
  const recoveryTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  const recoveryExpired = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [navigationDelayed, setNavigationDelayed] = useState(false);

  useEffect(() => {
    mounted.current = true;
    const unlockRetry = () => {
      pending.current = false;
      if (!mounted.current) return;
      setSubmitting(false);
      setNavigationDelayed(true);
    };
    const reset = () => {
      window.clearTimeout(recoveryTimer.current);
      recoveryExpired.current = false;
      pending.current = false;
      if (!mounted.current) return;
      setSubmitting(false);
      setNavigationDelayed(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (!recoveryExpired.current) return;
      recoveryExpired.current = false;
      unlockRetry();
    };
    window.addEventListener('pageshow', reset);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      mounted.current = false;
      window.clearTimeout(recoveryTimer.current);
      window.removeEventListener('pageshow', reset);
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
          recoveryExpired.current = false;
          setSubmitting(true);
          setNavigationDelayed(false);
          // Cancelled navigation can leave this document open without pageshow.
          // Unlock retry without claiming whether the provider received the POST.
          window.clearTimeout(recoveryTimer.current);
          recoveryTimer.current = window.setTimeout(() => {
            if (!mounted.current) return;
            recoveryExpired.current = true;
            if (document.visibilityState !== 'visible') return;
            recoveryExpired.current = false;
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
        <button
          className="btn btn-gradient"
          type="submit"
          disabled={submitting}
          data-funnel-event="subscribe_submit"
          data-funnel-placement={placement}
        >
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
