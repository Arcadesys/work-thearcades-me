import { notFound } from 'next/navigation';

/**
 * The journeys brief contains unresolved internal planning notes. Keep the
 * historical source in lib/journeys.ts, but do not publish it as a web page.
 */
export default function JourneysPage() {
  notFound();
}
