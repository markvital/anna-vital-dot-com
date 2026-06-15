import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getChildWorkPage, listChildWorkRoutes, titleFromSlug } from '@/lib/content';

type Params = {
  work: string;
  slug: string;
};

export async function generateStaticParams() {
  return listChildWorkRoutes();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const item = await getChildWorkPage(params.work, params.slug);

  if (!item) {
    return {};
  }

  return {
    title: item.title,
    description: item.description,
  };
}

export default async function WorkChildPage({ params }: { params: Params }) {
  const item = await getChildWorkPage(params.work, params.slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <article className="space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/50">{titleFromSlug(params.work)}</p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">{item.title}</h1>
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{item.dateLabel ?? 'Most recent'}</p>
        </header>
        <div className="space-y-6 text-lg leading-8 text-ink/82">{item.content}</div>
        <Button asChild variant="outline">
          <Link href={`/${params.work}`}>Back to work</Link>
        </Button>
      </article>
    </div>
  );
}
