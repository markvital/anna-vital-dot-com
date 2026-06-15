import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPage, listWorks } from '@/lib/content';

function ThumbnailStub() {
  return (
    <div className="flex aspect-[4/3] items-end rounded-3xl border border-line bg-[linear-gradient(135deg,rgba(166,95,59,0.14),rgba(32,24,21,0.04))] p-4">
      <span className="text-xs uppercase tracking-[0.35em] text-ink/45">Thumbnail</span>
    </div>
  );
}

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

        <div className="mt-6 grid gap-5">
          {works.map((work) => (
            <Card key={work.href} className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                <Link href={work.href} className="block p-5">
                  <ThumbnailStub />
                </Link>
                <CardContent className="flex flex-col justify-between gap-5 p-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-ink/45">
                      <span>{work.dateLabel ?? 'Most recent'}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl md:text-3xl">{work.title}</h3>
                      <p className="max-w-2xl text-base leading-7 text-ink/70">{work.description}</p>
                    </div>
                  </div>
                  <Button asChild variant="ghost" className="w-fit px-0">
                    <Link href={work.href}>Open work</Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
