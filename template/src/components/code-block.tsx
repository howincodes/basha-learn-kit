import { useCallback, useEffect, useState } from 'react';
import { createHighlighter, type Highlighter } from 'shiki';

// ---------------------------------------------------------------------------
// Supported languages for syntax highlighting.
// ---------------------------------------------------------------------------

const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'yaml',
  'dockerfile',
  'sql',
  'bash',
  'json',
  'prisma',
  'graphql',
  'tsx',
  'jsx',
  'css',
  'markdown',
  'diff',
  'python',
  'go',
] as const;

const THEME = 'vitesse-dark' as const;

// ---------------------------------------------------------------------------
// Singleton highlighter — created once, reused across all CodeBlock instances.
// ---------------------------------------------------------------------------

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...SUPPORTED_LANGUAGES],
    });
  }
  return highlighterPromise;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  language: string | undefined;
  children: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CodeBlock({ language, children }: CodeBlockProps): React.JSX.Element {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const code = children.replace(/\n$/, '');
  const lang = language ?? 'text';
  const isSupported = (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);

  // Highlight on mount / when code or language changes.
  useEffect(() => {
    let cancelled = false;

    if (!isSupported) {
      setHighlightedHtml(null);
      return;
    }

    void getHighlighter().then((highlighter) => {
      if (cancelled) return;

      const html = highlighter.codeToHtml(code, {
        lang,
        theme: THEME,
      });
      setHighlightedHtml(html);
    });

    return (): void => {
      cancelled = true;
    };
  }, [code, lang, isSupported]);

  // Copy to clipboard handler.
  const handleCopy = useCallback((): void => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="group relative my-4 rounded-lg overflow-hidden bg-[#121212]">
      {/* Header bar — language label + copy button */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-neutral-400 bg-[#1a1a1a] border-b border-white/5">
        <span className="font-mono uppercase tracking-wide">{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-neutral-200"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      {highlightedHtml ? (
        <div
          className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono text-neutral-300">{code}</code>
        </pre>
      )}
    </div>
  );
}
