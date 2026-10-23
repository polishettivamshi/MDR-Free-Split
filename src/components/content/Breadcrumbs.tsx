import { ChevronRight, Home } from 'lucide-react';
import { absoluteUrl, useJsonLd } from '../../lib/seo';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  useJsonLd('breadcrumb-schema', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href ? { item: absoluteUrl(item.href) } : {}),
      })),
    ],
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-soft">
        <li>
          <a
            href="/"
            className="inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-md px-0.5 transition-colors hover:text-brand"
          >
            <Home className="h-3 w-3" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </a>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-line" aria-hidden="true" />
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="inline-flex min-h-10 items-center rounded-md px-0.5 transition-colors hover:text-brand"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? 'text-ink' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
