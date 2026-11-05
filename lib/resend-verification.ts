type VerificationMailConfig = {
  apiKey: string;
  fromEmail: string;
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
  if (!config.apiKey || !config.fromEmail || !token) return 'rejected';
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
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [email],
        subject: 'Confirm your Work build notes request',
        text: textBody,
        html: htmlBody,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.status >= 400 && response.status < 500) return 'rejected';
    if (!response.ok) return 'uncertain';
    const result = await response.json() as { id?: unknown };
    return typeof result.id === 'string' && result.id ? 'sent' : 'uncertain';
  } catch {
    // The provider may have accepted the email before a timeout; preserve its challenge.
    return 'uncertain';
  }
}
