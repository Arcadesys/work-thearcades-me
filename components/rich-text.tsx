const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

/**
 * Renders the small amount of inline emphasis the writeups use: `**bold**`
 * and `*italic*`. Everything is built as React nodes, so content stays plain
 * strings in `lib/content.ts` and nothing is injected as HTML.
 */
export function RichText({ children }: { children: string }) {
  const parts = children.split(TOKEN).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}
