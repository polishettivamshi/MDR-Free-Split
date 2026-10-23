export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | {
      type: 'callout';
      tone: 'info' | 'warning' | 'tip';
      title: string;
      text: string;
    }
  | {
      type: 'table';
      headers: string[];
      rows: string[][];
      caption?: string;
    };

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideSource {
  label: string;
  href: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  takeaways: string[];
  blocks: ContentBlock[];
  faqs: GuideFaq[];
  sources: GuideSource[];
}

export interface LegalDoc {
  path: '/privacy' | '/terms' | '/disclaimer';
  title: string;
  metaTitle: string;
  description: string;
  updatedAt: string;
  intro: string;
  blocks: ContentBlock[];
}
