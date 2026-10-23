import { Fragment } from 'react';
import type { ReactNode } from 'react';

const INLINE_TOKEN =
  /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

interface RichTextProps {
  text: string;
}

/**
 * Small, deliberately limited inline renderer for guide copy. It supports
 * **bold** and [links](https://example.com), which is all the content layer
 * needs, without pulling a Markdown runtime into the bundle.
 */
export const RichText = ({ text }: RichTextProps): ReactNode => {
  const parts = text.split(INLINE_TOKEN).filter((part) => part !== '');

  return (
    <>
      {parts.map((part, index) => {
        const boldMatch = part.match(/^\*\*(.+)\*\*$/);
        if (boldMatch) {
          return (
            <strong key={index} className="font-bold text-ink">
              {boldMatch[1]}
            </strong>
          );
        }

        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          const [, label, href] = linkMatch;
          const external = /^https?:\/\//i.test(href);

          return (
            <a
              key={index}
              href={href}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="font-semibold text-brand-dark underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand"
            >
              {label}
            </a>
          );
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
};
