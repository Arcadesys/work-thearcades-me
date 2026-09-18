'use client';

import { useEffect, useRef } from 'react';

const ACTIVE_CAMPAIGN_FORM_ID = '11';
const ACTIVE_CAMPAIGN_EMBED_URL =
  'https://atuckercrowder.activehosted.com/f/embed.php?id=11';

/**
 * Use ActiveCampaign's live embed instead of copying proc.php routing fields into
 * the app. Form 11 is the dedicated work.thearcades.me AI / Career signup and
 * resolves to ActiveCampaign list 20.
 */
export function SubscribeForm({ placement = 'blog_post' }: { placement?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const host = hostRef.current;
    if (!wrapper || !host) return;

    const decorateSubmitControl = () => {
      const submit = host.querySelector<HTMLElement>(
        'button[type="submit"], input[type="submit"]',
      );
      if (!submit) return;
      submit.setAttribute('data-funnel-event', 'subscribe_submit');
      submit.setAttribute('data-funnel-placement', placement);
    };

    const observer = new MutationObserver(decorateSubmitControl);
    observer.observe(host, { childList: true, subtree: true });

    const script = document.createElement('script');
    script.src = ACTIVE_CAMPAIGN_EMBED_URL;
    script.async = true;
    script.charset = 'utf-8';
    script.dataset.activecampaignForm = ACTIVE_CAMPAIGN_FORM_ID;
    script.addEventListener('load', decorateSubmitControl);
    wrapper.appendChild(script);

    return () => {
      observer.disconnect();
      script.remove();
      host.replaceChildren();
    };
  }, [placement]);

  return (
    <div
      ref={wrapperRef}
      data-activecampaign-form={ACTIVE_CAMPAIGN_FORM_ID}
      data-funnel-placement={placement}
    >
      <div ref={hostRef} className="_form_11" />
    </div>
  );
}
