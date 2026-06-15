import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPage } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('full-bio.mdx');

  return {
    title: page.frontmatter.title ?? 'Full Biography',
    description: page.frontmatter.description,
  };
}

export default async function AboutMorePage() {
  const page = await getPage('full-bio.mdx');

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <article className="space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/50">Biography</p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">{page.frontmatter.title ?? 'Full Biography'}</h1>
        </header>
        <div className="space-y-6 text-lg leading-8 text-ink/82">{page.content}</div>
        <Button asChild variant="outline">
          <Link href="/about">Back to about</Link>
        </Button>
      </article>
    </div>
  );
}
