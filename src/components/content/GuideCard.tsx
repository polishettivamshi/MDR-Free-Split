import { ArrowUpRight, Clock3 } from 'lucide-react';
import type { Guide } from '../../content/types';
import { formatGuideDate } from '../../content/guides';

interface GuideCardProps {
  guide: Guide;
  featured?: boolean;
}

export const GuideCard = ({ guide, featured = false }: GuideCardProps) => (
  <article className="h-full">
    <a
      href={`/guides/${guide.slug}`}
      className={`group flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-xl hover:shadow-brand-soft/60 sm:p-6 ${
        featured ? 'sm:p-7' : ''
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-brand-100 bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark">
          {guide.category}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-soft">
          <Clock3 className="h-3 w-3" />
          {guide.readingMinutes} min read
        </span>
      </div>

      <h3
        className={`font-extrabold tracking-tight text-ink transition-colors group-hover:text-brand-dark ${
          featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
        }`}
      >
        {guide.title}
      </h3>

      <p className="mt-2.5 flex-1 text-sm leading-6 text-muted">
        {guide.description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line-soft pt-4">
        <span className="text-[10px] font-medium text-muted-soft">
          Updated {formatGuideDate(guide.updatedAt)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
          Read guide
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  </article>
);
