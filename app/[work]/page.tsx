import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getWorkPage, listWorkRoutes } from '@/lib/content';
import { WorkGallery } from '@/components/work-gallery';

type Params = {
  work: string;
};

export async function generateStaticParams() {
  return listWorkRoutes();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const work = await getWorkPage(params.work);

  if (!work) {
    return {};
  }

  return {
    title: work.title,
    description: work.description,
  };
}

export default async function WorkPage({ params }: { params: Params }) {
  const work = await getWorkPage(params.work);

  if (!work) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <article className="space-y-10">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/50">Work page</p>
            <h1 className="font-display text-5xl leading-none md:text-7xl">{work.title}</h1>
            <p className="max-w-xl text-lg leading-8 text-ink/75">{work.description}</p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-ink/45">
              <span>{work.dateLabel ?? 'Most recent'}</span>
            </div>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-line bg-[linear-gradient(135deg,rgba(166,95,59,0.14),rgba(32,24,21,0.04))] p-5">
            <div className="flex aspect-[4/3] items-end rounded-3xl border border-line bg-paper p-4">
              <span className="text-xs uppercase tracking-[0.35em] text-ink/45">Thumbnail</span>
            </div>
          </div>
        </section>

        <section className="space-y-6 text-lg leading-8 text-ink/82">{work.content}</section>

        {work.children.length > 0 ? (
          <section className="space-y-5">
            <h2 className="font-display text-3xl md:text-4xl">Inside this work</h2>
            <WorkGallery
              items={work.children.map((child) => ({
                href: child.href,
                title: child.title,
                description: child.description,
              }))}
              ctaLabel="Open item"
            />
          </section>
        ) : null}
      </article>
    </div>
  );
}
