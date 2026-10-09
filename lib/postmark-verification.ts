type VerificationMailConfig = {
  serverToken: string;
  fromEmail: string;
  messageStream: string;
  environment?: string;
  vercelUrl?: string;
};
type Fetcher = typeof fetch;

const siteOrigin = 'https://work.thearcades.me';
const safeVercelHostname = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/i;

export function verificationSiteOrigin(config: Pick<VerificationMailConfig, 'environment' | 'vercelUrl'>) {
  if (config.environment === 'preview' && config.vercelUrl && safeVercelHostname.test(config.vercelUrl)) {
    return `https://${config.vercelUrl}`;
  }
  return siteOrigin;
}

export async function sendSignupVerificationEmail(
  email: string,
  token: string,
  config: VerificationMailConfig,
  fetcher: Fetcher = fetch,
) {
  if (!config.serverToken || !config.fromEmail || !config.messageStream || !token) return 'rejected';
  const verifyUrl = `${verificationSiteOrigin(config)}/newsletter/verify#token=${encodeURIComponent(token)}`;
  const textBody = [
    'Confirm your request for Work build notes',
    '',
    'You asked to receive Work build notes. Confirm your email address and request by opening this link:',
    verifyUrl,
    '',
    'This link expires in 24 hours. If you did not request these notes, choose Cancel on the confirmation page or ignore this message.',
  ].join('\n');
  const htmlBody = `<!doctype html><html lang="en"><body><main><h1>Confirm your request for Work build notes</h1><p>You asked to receive Work build notes. Confirm your email address and request by opening this link:</p><p><a href="${verifyUrl}">Confirm my email</a></p><p>This link expires in 24 hours. If you did not request these notes, choose Cancel on the confirmation page or ignore this message.</p></main></body></html>`;

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
        Subject: 'Confirm your Work build notes request',
        TextBody: textBody,
        HtmlBody: htmlBody,
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
    // The provider may have accepted the email before a timeout; preserve its challenge.
    return 'uncertain';
  }
}
