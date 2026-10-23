import type { ContentBlock } from '../../content/types';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { RichText } from './RichText';

export const headingId = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const calloutStyles = {
  info: {
    wrapper: 'border-brand/20 bg-brand-soft/70',
    icon: 'bg-white text-brand shadow-sm',
    title: 'text-ink',
    body: 'text-muted'
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50',
    icon: 'bg-white text-amber-600 shadow-sm',
    title: 'text-amber-950',
    body: 'text-amber-900/80'
  },
  tip: {
    wrapper: 'border-emerald-200 bg-emerald-50',
    icon: 'bg-white text-emerald-600 shadow-sm',
    title: 'text-emerald-950',
    body: 'text-emerald-900/80'
  }
} as const;

const CalloutIcon = ({ tone }: { tone: keyof typeof calloutStyles }) => {
  if (tone === 'warning') return <AlertTriangle className="h-4 w-4" />;
  if (tone === 'tip') return <Lightbulb className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

interface ArticleBlocksProps {
  blocks: ContentBlock[];
}

export const ArticleBlocks = ({ blocks }: ArticleBlocksProps) => (
  <div className="space-y-6">
    {blocks.map((block, index) => {
      switch (block.type) {
        case 'h2':
          return (
            <h2
              key={index}
              id={headingId(block.text)}
              className="scroll-mt-24 pt-4 text-2xl font-extrabold tracking-tight text-ink first:pt-0 sm:text-[1.7rem] sm:leading-tight"
            >
              {block.text}
            </h2>
          );

        case 'h3':
          return (
            <h3
              key={index}
              className="pt-2 text-lg font-bold tracking-tight text-ink sm:text-xl"
            >
              {block.text}
            </h3>
          );

        case 'p':
          return (
            <p
              key={index}
              className="text-[15px] leading-8 text-muted sm:text-base sm:leading-8"
            >
              <RichText text={block.text} />
            </p>
          );

        case 'ul':
          return (
            <ul
              key={index}
              className="list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-muted marker:text-brand sm:text-base"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          );

        case 'ol':
          return (
            <ol
              key={index}
              className="list-decimal space-y-2.5 pl-5 text-[15px] leading-7 text-muted marker:font-bold marker:text-brand sm:text-base"
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  <RichText text={item} />
                </li>
              ))}
            </ol>
          );

        case 'callout': {
          const styles = calloutStyles[block.tone];
          return (
            <aside
              key={index}
              role="note"
              className={`rounded-2xl border p-4 sm:p-5 ${styles.wrapper}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                >
                  <CalloutIcon tone={block.tone} />
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${styles.title}`}>
                    {block.title}
                  </p>
                  <p className={`mt-1.5 text-sm leading-6 ${styles.body}`}>
                    <RichText text={block.text} />
                  </p>
                </div>
              </div>
            </aside>
          );
        }

        case 'table':
          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-line bg-white"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  {block.caption && (
                    <caption className="caption-top border-b border-line-soft bg-lilac/60 px-4 py-3 text-left text-xs font-medium leading-5 text-muted">
                      {block.caption}
                    </caption>
                  )}
                  <thead className="bg-brand-soft/60">
                    <tr>
                      {block.headers.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-brand-dark"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-t border-line-soft transition-colors hover:bg-lilac/50"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 align-top text-sm leading-6 text-muted first:font-semibold first:text-ink"
                          >
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );

        default:
          return null;
      }
    })}
  </div>
);
