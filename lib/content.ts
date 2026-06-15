import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';
import { compileMDX } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { createElement } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

const contentRoot = path.join(process.cwd(), 'content');
const publicContentRoot = path.join(process.cwd(), 'public', 'content');

const workIndexCandidates = ['index.mdx', 'index.md'];
const reservedTopLevelFiles = new Set(['homepage.md', 'about.mdx', 'full-bio.mdx']);

export type ContentFrontmatter = {
  title?: string;
  description?: string;
  thumbnail?: string;
};

export type RenderedContent = {
  content: ReactNode;
  frontmatter: ContentFrontmatter;
  relativePath: string;
  filePath: string;
};

export type WorkSummary = {
  folderName: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  date?: string;
  dateLabel?: string;
  sortKey: number;
  href: string;
  filePath: string;
  isCollection: boolean;
};

export type WorkPage = RenderedContent &
  WorkSummary & {
    children: WorkSummary[];
  };

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}

function slugify(value: string) {
  return value
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function titleize(value: string) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function ensureLeadingSlash(value: string) {
  return value.startsWith('/') ? value : `/${value}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function compareWorkOrder(a: { sortKey: number; title: string }, b: { sortKey: number; title: string }) {
  const aInfinite = !Number.isFinite(a.sortKey);
  const bInfinite = !Number.isFinite(b.sortKey);

  if (aInfinite && bInfinite) {
    return a.title.localeCompare(b.title);
  }

  if (aInfinite) {
    return -1;
  }

  if (bInfinite) {
    return 1;
  }

  return b.sortKey - a.sortKey || a.title.localeCompare(b.title);
}

function parseWorkFolderName(folderName: string) {
  const datedMatch = folderName.match(/^(\d{2})-(\d{2})-(\d{4})_(.+)$/);

  if (datedMatch) {
    const [, day, month, year, rawSlug] = datedMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const slug = slugify(rawSlug);

    return {
      folderName,
      slug,
      title: titleize(rawSlug),
      date: `${year}-${month}-${day}`,
      dateLabel: formatDateLabel(date),
      sortKey: date.getTime(),
    };
  }

  return {
    folderName,
    slug: slugify(folderName),
    title: titleize(folderName),
    sortKey: Number.POSITIVE_INFINITY,
  };
}

function resolveContentAssetUrl(relativeDocPath: string, src: string) {
  if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('/')) {
    return src;
  }

  const docDir = path.posix.dirname(toPosixPath(relativeDocPath));
  const resolved = path.posix.normalize(path.posix.join(docDir, src));
  return ensureLeadingSlash(path.posix.join('content', resolved));
}

function mdxComponents(relativePath: string) {
  return {
    a: (props: ComponentPropsWithoutRef<'a'>) => {
      const href = props.href ?? '';

      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        return createElement('a', {
          ...props,
          className: 'text-accent underline underline-offset-4',
          target: props.target ?? '_blank',
          rel: props.rel ?? 'noreferrer',
        });
      }

      return createElement(Link, {
        ...props,
        href,
        className: 'text-accent underline underline-offset-4',
      });
    },
    img: (props: ComponentPropsWithoutRef<'img'>) => {
      const src = props.src ? resolveContentAssetUrl(relativePath, props.src) : '';
      return createElement('img', {
        ...props,
        src,
        className: 'my-8 w-full rounded-3xl border border-line object-cover',
        loading: props.loading ?? 'lazy',
      });
    },
    hr: () => createElement('hr', { className: 'my-10 border-line' }),
  };
}

async function readMdxFile(relativePath: string): Promise<RenderedContent> {
  const filePath = path.join(contentRoot, relativePath);
  const source = await fs.readFile(filePath, 'utf8');

  const { content, frontmatter } = await compileMDX<ContentFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
    },
    components: mdxComponents(relativePath),
  });

  return {
    content,
    frontmatter,
    relativePath,
    filePath,
  };
}

async function findFirstExistingFile(relativeCandidates: string[]) {
  for (const relativePath of relativeCandidates) {
    try {
      await fs.access(path.join(contentRoot, relativePath));
      return relativePath;
    } catch {
      // Keep searching.
    }
  }

  return null;
}

async function readWorkPageFromFolder(folderName: string, relativeFolderPath: string): Promise<WorkPage | null> {
  const indexPath = await findFirstExistingFile(workIndexCandidates.map((candidate) => path.join(relativeFolderPath, candidate)));

  if (!indexPath) {
    return null;
  }

  const page = await readMdxFile(indexPath);
  const parsed = parseWorkFolderName(folderName);
  const children = await listChildWorkSummaries(parsed.slug, relativeFolderPath);

  return {
    ...page,
    ...parsed,
    description: page.frontmatter.description,
    thumbnail: page.frontmatter.thumbnail,
    href: `/${parsed.slug}`,
    isCollection: children.length > 0,
    children,
  };
}

async function listChildWorkSummaries(parentSlug: string, relativeFolderPath: string): Promise<WorkSummary[]> {
  const childEntries = await fs.readdir(path.join(contentRoot, relativeFolderPath), { withFileTypes: true }).catch(() => []);
  const childPages: WorkSummary[] = [];

  for (const entry of childEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const relativeChildFolder = path.join(relativeFolderPath, entry.name);
    const indexPath = await findFirstExistingFile(workIndexCandidates.map((candidate) => path.join(relativeChildFolder, candidate)));

    if (!indexPath) {
      continue;
    }

    const page = await readMdxFile(indexPath);
    const parsed = parseWorkFolderName(entry.name);

    childPages.push({
      folderName: entry.name,
      slug: parsed.slug,
      title: page.frontmatter.title ?? parsed.title,
      description: page.frontmatter.description,
      thumbnail: page.frontmatter.thumbnail,
      date: parsed.date,
      dateLabel: parsed.dateLabel,
      sortKey: parsed.sortKey,
      href: `/${parentSlug}/${parsed.slug}`,
      filePath: page.filePath,
      isCollection: false,
    });
  }

  return childPages.sort(compareWorkOrder);
}

export async function getPage(relativePath: string) {
  return readMdxFile(relativePath);
}

export async function listWorks(): Promise<WorkSummary[]> {
  const entries = await fs.readdir(contentRoot, { withFileTypes: true }).catch(() => []);
  const summaries: WorkSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const relativeFolderPath = entry.name;
    const page = await readWorkPageFromFolder(entry.name, relativeFolderPath);

    if (!page) {
      continue;
    }

    summaries.push({
      folderName: page.folderName,
      slug: page.slug,
      title: page.title,
      description: page.description,
      thumbnail: page.thumbnail,
      date: page.date,
      dateLabel: page.dateLabel,
      sortKey: page.sortKey,
      href: page.href,
      filePath: page.filePath,
      isCollection: page.isCollection,
    });
  }

  return summaries.sort(compareWorkOrder);
}

export async function getWorkPage(slug: string): Promise<WorkPage | null> {
  const works = await listWorks();
  const work = works.find((item) => item.slug === slug);

  if (!work) {
    return null;
  }

  const page = await readWorkPageFromFolder(work.folderName, work.folderName);

  return page;
}

export async function getChildWorkPage(parentSlug: string, childSlug: string): Promise<(RenderedContent & WorkSummary & { parentSlug: string }) | null> {
  const works = await listWorks();
  const parent = works.find((item) => item.slug === parentSlug);

  if (!parent) {
    return null;
  }

  const childEntries = await fs.readdir(path.join(contentRoot, parent.folderName), { withFileTypes: true }).catch(() => []);

  for (const entry of childEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const parsed = parseWorkFolderName(entry.name);
    if (parsed.slug !== childSlug) {
      continue;
    }

    const relativeChildFolder = path.join(parent.folderName, entry.name);
    const indexPath = await findFirstExistingFile(workIndexCandidates.map((candidate) => path.join(relativeChildFolder, candidate)));

    if (!indexPath) {
      return null;
    }

    const page = await readMdxFile(indexPath);

    return {
      ...page,
      folderName: entry.name,
      slug: parsed.slug,
      title: page.frontmatter.title ?? parsed.title,
      description: page.frontmatter.description,
      thumbnail: page.frontmatter.thumbnail,
      date: parsed.date,
      dateLabel: parsed.dateLabel,
      sortKey: parsed.sortKey,
      href: `/${parentSlug}/${parsed.slug}`,
      filePath: page.filePath,
      isCollection: false,
      parentSlug,
    };
  }

  return null;
}

export async function listWorkRoutes() {
  const works = await listWorks();
  return works.map((work) => ({ work: work.slug }));
}

export async function listChildWorkRoutes() {
  const works = await listWorks();
  const routes: Array<{ work: string; slug: string }> = [];

  for (const work of works) {
    const children = await listChildWorkSummaries(work.slug, work.folderName);
    for (const child of children) {
      routes.push({ work: work.slug, slug: child.slug });
    }
  }

  return routes;
}

export async function syncContentAssets() {
  async function walkDirectory(sourceDir: string, targetDir: string) {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    await fs.mkdir(targetDir, { recursive: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(sourcePath, targetPath);
        continue;
      }

      if (reservedTopLevelFiles.has(entry.name) || /\.(md|mdx)$/i.test(entry.name)) {
        continue;
      }

      await fs.copyFile(sourcePath, targetPath);
    }
  }

  try {
    await walkDirectory(contentRoot, publicContentRoot);
  } catch {
    // No content yet.
  }
}

export function titleFromSlug(slug: string) {
  return titleize(slug);
}
