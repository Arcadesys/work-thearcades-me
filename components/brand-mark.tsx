/**
 * The wordmark, swapped by the operating system's appearance setting.
 *
 * The default asset is the neon version built for the dark palette; on a light
 * ground that pink washes out and its Gaussian bloom reads as a smudge, so the
 * light palette gets a deepened, un-glowed variant instead. `<picture>` does
 * the switch in the browser's own media-query engine — no JS, no stored
 * preference, and the right file is the only one fetched.
 */
export function BrandMark() {
  return (
    <picture>
      <source srcSet="/the-arcades-logo-light.svg" media="(prefers-color-scheme: light)" />
      <img src="/the-arcades-logo.svg" alt="" width={244} height={34} />
    </picture>
  );
}
