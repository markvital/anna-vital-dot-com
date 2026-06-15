import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WorkGallery } from '@/components/work-gallery';
import { getPage, listWorks } from '@/lib/content';

export default async function HomePage() {
  const homepage = await getPage('homepage.md');
  const works = await listWorks();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          <h1 className="font-display text-5xl leading-none md:text-7xl">Anna Vital</h1>
          <div className="max-w-2xl space-y-4 text-lg leading-8 text-ink/80">{homepage.content}</div>
        </div>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-ink/50">Bio widget</p>
              <p className="text-base leading-7 text-ink/80">{homepage.frontmatter.description}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/about">Read more</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-3xl md:text-4xl">Recent work</h2>

        <div className="mt-6">
          <WorkGallery
            items={works.map((work) => ({
              href: work.href,
              title: work.title,
              description: work.description,
            }))}
            ctaLabel="Open work"
          />
        </div>
      </section>
    </div>
  );
}
