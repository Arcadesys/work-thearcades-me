import { verificationSiteOrigin } from './postmark-verification';

export type WelcomeMailResult = 'sent' | 'rejected' | 'uncertain';

export type WorkWelcomeMailConfig = {
  serverToken: string;
  fromEmail: string;
  messageStream: string;
  environment?: string;
  vercelUrl?: string;
};

export function createWorkWelcomeEmail(unsubscribeUrl: string) {
  return {
    subject: 'Welcome to the build notes',
    preview: 'Practical notes on AI engineering, creative tools, and access.',
    text: [
    'Thanks for joining the work notes. I write about AI engineering, creative tools, accessibility, and what it takes to turn a messy problem into working software.',
    '',
    'If you are new here, start with the build log about Bunch (https://work.thearcades.me/blog/bunch), AI as an accessibility tool (https://work.thearcades.me/blog/ai-accessibility-revolution), or WizWor, a small demo you can try (https://work.thearcades.me/blog/wizwor).',
    '',
    `I aim to send one useful note a week. You can unsubscribe from any email: ${unsubscribeUrl}`,
    '',
    'Austen',
    ].join('\n'),
    html: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Welcome to the build notes</title></head>
  <body style="margin:0;background:#f4f5f7;color:#17202a;font-family:Arial,Helvetica,sans-serif;line-height:1.6">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Practical notes on AI engineering, creative tools, and access.</div>
    <main style="box-sizing:border-box;margin:0 auto;max-width:640px;padding:40px 24px;background:#fff">
      <h1 style="font-size:30px;line-height:1.25;margin:0 0 24px">Welcome to the build notes</h1>
      <p style="font-size:18px;margin:0 0 20px">Thanks for joining the work notes. I write about AI engineering, creative tools, accessibility, and what it takes to turn a messy problem into working software.</p>
      <p style="font-size:18px;margin:0 0 12px">If you are new here, start with:</p>
      <ul style="font-size:18px;margin:0 0 24px;padding-left:28px">
        <li style="margin:0 0 12px"><a href="https://work.thearcades.me/blog/bunch" style="color:#0645ad;text-decoration:underline">the build log about Bunch</a></li>
        <li style="margin:0 0 12px"><a href="https://work.thearcades.me/blog/ai-accessibility-revolution" style="color:#0645ad;text-decoration:underline">AI as an accessibility tool</a></li>
        <li><a href="https://work.thearcades.me/blog/wizwor" style="color:#0645ad;text-decoration:underline">WizWor, a small demo you can try</a></li>
      </ul>
      <p style="font-size:18px;margin:0 0 24px">I aim to send one useful note a week. You can <a href="${unsubscribeUrl}" style="color:#0645ad;text-decoration:underline">unsubscribe</a> from any email.</p>
      <p style="font-size:18px;margin:0">Austen</p>
    </main>
  </body>
</html>`,
  };
}

const previewUnsubscribeUrl = 'https://work.thearcades.me/newsletter/unsubscribe#token=preview';
export const workWelcomeEmail = createWorkWelcomeEmail(previewUnsubscribeUrl);

type Fetcher = typeof fetch;

export async function sendWorkWelcomeEmail(
  email: string,
  unsubscribeToken: string,
  config: WorkWelcomeMailConfig,
  fetcher: Fetcher = fetch,
): Promise<WelcomeMailResult> {
  if (!config.serverToken || !config.fromEmail || !config.messageStream || !email || !unsubscribeToken) return 'rejected';
  const origin = verificationSiteOrigin(config);
  const unsubscribeUrl = `${origin}/newsletter/unsubscribe#token=${encodeURIComponent(unsubscribeToken)}`;
  const oneClickUrl = `${origin}/api/kit/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const content = createWorkWelcomeEmail(unsubscribeUrl);
  try {
    const response = await fetcher('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': config.serverToken,
      },
      body: JSON.stringify({
        From: config.fromEmail,
        To: email,
        Subject: content.subject,
        TextBody: content.text,
        HtmlBody: content.html,
        Headers: [
          { Name: 'List-Unsubscribe', Value: `<${oneClickUrl}>` },
          { Name: 'List-Unsubscribe-Post', Value: 'List-Unsubscribe=One-Click' },
        ],
        MessageStream: config.messageStream,
        TrackOpens: false,
        TrackLinks: 'None',
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.status >= 400 && response.status < 500) return 'rejected';
    if (!response.ok) return 'uncertain';
    const result = await response.json() as { ErrorCode?: unknown };
    if (result.ErrorCode === 0) return 'sent';
    if (typeof result.ErrorCode === 'number') return 'rejected';
    return 'uncertain';
  } catch {
    return 'uncertain';
  }
}
