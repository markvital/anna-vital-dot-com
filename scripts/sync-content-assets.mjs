import fs from 'node:fs/promises';
import path from 'node:path';

const contentRoot = path.join(process.cwd(), 'content');
const publicContentRoot = path.join(process.cwd(), 'public', 'content');

async function walkDirectory(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await fs.mkdir(targetDir, { recursive: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(sourcePath, targetPath);
      continue;
    }

    if (/\.(md|mdx)$/i.test(entry.name)) {
      continue;
    }

    await fs.copyFile(sourcePath, targetPath);
  }
}

try {
  await walkDirectory(contentRoot, publicContentRoot);
} catch {
  // Allow the very first install to succeed before content exists.
}
