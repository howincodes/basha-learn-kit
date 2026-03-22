import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Glob-import all markdown files under learning/foundations/ as raw text.
// Vite resolves the `?raw` query at build time and returns a string loader.
// ---------------------------------------------------------------------------

const markdownFiles = import.meta.glob<string>(
  '../../../../learning/foundations/**/*.md',
  { query: '?raw', import: 'default', eager: false },
);

// ---------------------------------------------------------------------------
// In-memory cache so repeated requests for the same file are instant.
// ---------------------------------------------------------------------------

const contentCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

interface UseMarkdownContentResult {
  content: string | null;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Lazily loads a markdown file from `learning/foundations/`.
 *
 * @param noteFile - Relative path from `learning/foundations/`,
 *                   e.g. `"docker/01-what-is-docker.md"`.
 */
export function useMarkdownContent(noteFile: string): UseMarkdownContentResult {
  const [content, setContent] = useState<string | null>(() => {
    return contentCache.get(noteFile) ?? null;
  });
  const [loading, setLoading] = useState<boolean>(!contentCache.has(noteFile));

  useEffect(() => {
    // Already cached — nothing to do.
    if (contentCache.has(noteFile)) {
      setContent(contentCache.get(noteFile) ?? null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const globKey = `../../../../learning/foundations/${noteFile}`;
    const loader = markdownFiles[globKey];

    if (!loader) {
      // File not found in the glob map.
      if (!cancelled) {
        setContent(null);
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    void loader().then((raw) => {
      if (cancelled) return;

      contentCache.set(noteFile, raw);
      setContent(raw);
      setLoading(false);
    });

    return (): void => {
      cancelled = true;
    };
  }, [noteFile]);

  return { content, loading };
}
