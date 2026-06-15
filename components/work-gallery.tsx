import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type WorkGalleryItem = {
  href: string;
  title: string;
  description?: string;
  dateLabel?: string;
};

type WorkGalleryProps = {
  items: WorkGalleryItem[];
  ctaLabel: string;
};

function ThumbnailStub() {
  return (
    <div className="flex aspect-[4/3] items-end rounded-3xl border border-line bg-[linear-gradient(135deg,rgba(166,95,59,0.14),rgba(32,24,21,0.04))] p-4">
      <span className="text-xs uppercase tracking-[0.35em] text-ink/45">Thumbnail</span>
    </div>
  );
}

export function WorkGallery({ items, ctaLabel }: WorkGalleryProps) {
  const useGrid = items.length >= 3;

  if (useGrid) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.href} className="overflow-hidden">
            <div className="flex h-full flex-col">
              <Link href={item.href} className="block p-5">
                <ThumbnailStub />
              </Link>
              <CardContent className="flex h-full flex-col justify-between gap-5 p-5 pt-0">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl md:text-3xl">{item.title}</h3>
                  {item.description ? <p className="text-base leading-7 text-ink/70">{item.description}</p> : null}
                </div>
                <Button asChild variant="ghost" className="w-fit px-0">
                  <Link href={item.href}>{ctaLabel}</Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {items.map((item) => (
        <Card key={item.href} className="overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[280px_1fr]">
            <Link href={item.href} className="block p-5">
              <ThumbnailStub />
            </Link>
            <CardContent className="flex flex-col justify-between gap-5 p-5">
              <div className="space-y-2">
                <h3 className="font-display text-2xl md:text-3xl">{item.title}</h3>
                {item.description ? <p className="max-w-2xl text-base leading-7 text-ink/70">{item.description}</p> : null}
              </div>
              <Button asChild variant="ghost" className="w-fit px-0">
                <Link href={item.href}>{ctaLabel}</Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
