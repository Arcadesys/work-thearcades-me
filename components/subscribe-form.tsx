'use client';

import { useState } from 'react';
import { newsletter } from '@/lib/content';

export function SubscribeForm() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubscribed(true);
        }}
      >
        <label className="visually-hidden" htmlFor="sub-email">
          Email address
        </label>
        <input
          className="field"
          id="sub-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
        <button className="btn btn-gradient" type="submit">
          Subscribe
        </button>
      </form>
      <p className="form-note" role="status" aria-live="polite">
        {subscribed ? newsletter.doneNote : newsletter.idleNote}
      </p>
    </>
  );
}
