import type { ComponentPropsWithoutRef, JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from './code-block';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MarkdownRendererProps {
  content: string;
}

// ---------------------------------------------------------------------------
// Callout detection
// ---------------------------------------------------------------------------

type CalloutType = 'note' | 'tip' | 'warning' | 'important';

const CALLOUT_REGEX = /^\[!(NOTE|TIP|WARNING|IMPORTANT)\]\s*/i;

const CALLOUT_LABELS: Record<CalloutType, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  important: 'Important',
};

/**
 * Attempts to detect a GitHub-style callout from blockquote children.
 * Returns the callout type and remaining text, or null if not a callout.
 */
function parseCallout(children: React.ReactNode): {
  type: CalloutType;
  children: React.ReactNode;
} | null {
  if (!Array.isArray(children) && typeof children !== 'object') return null;

  const childArray = Array.isArray(children) ? children : [children];

  // Walk the first paragraph child to find the callout marker text.
  for (const child of childArray) {
    if (
      child &&
      typeof child === 'object' &&
      'props' in child &&
      child.props &&
      typeof child.props === 'object' &&
      'children' in child.props
    ) {
      const inner = child.props.children;
      const text = extractText(inner);
      const match = CALLOUT_REGEX.exec(text);

      if (match && match[1]) {
        const calloutType = match[1].toLowerCase() as CalloutType;
        // Strip the callout marker from the first text node.
        const cleaned = stripCalloutMarker(inner);
        // Rebuild children: replace the first matching child with cleaned version.
        const rebuilt = childArray.map((c) => (c === child ? cleaned : c));
        return { type: calloutType, children: rebuilt };
      }
    }
  }

  return null;
}

/** Recursively extract raw text from React children. */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = node.props as Record<string, unknown>;
    if ('children' in props) return extractText(props.children as React.ReactNode);
  }
  return '';
}

/** Strip the `[!TYPE] ` prefix from the first text node in children. */
function stripCalloutMarker(node: React.ReactNode): React.ReactNode {
  if (typeof node === 'string') {
    return node.replace(CALLOUT_REGEX, '');
  }
  if (Array.isArray(node)) {
    let stripped = false;
    return node.map((child) => {
      if (stripped) return child;
      const result = stripCalloutMarker(child);
      if (result !== child) stripped = true;
      return result;
    });
  }
  return node;
}

// ---------------------------------------------------------------------------
// Custom component renderers
// ---------------------------------------------------------------------------

function CodeRenderer({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<'code'>): JSX.Element {
  const match = /language-(\w+)/.exec(className ?? '');

  // Inline code — no language class, rendered as plain <code>.
  if (!match) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  // Fenced code block — delegate to CodeBlock for syntax highlighting.
  const code = String(children).replace(/\n$/, '');
  return <CodeBlock language={match[1]} >{code}</CodeBlock>;
}

function BlockquoteRenderer({
  children,
}: ComponentPropsWithoutRef<'blockquote'>): JSX.Element {
  const callout = parseCallout(children);

  if (callout) {
    return (
      <div className={`callout callout-${callout.type}`} role="note">
        <strong className="block mb-1 text-sm uppercase tracking-wide">
          {CALLOUT_LABELS[callout.type]}
        </strong>
        {callout.children}
      </div>
    );
  }

  return (
    <blockquote className="border-l-4 border-white/20 pl-4 italic text-neutral-400 my-4">
      {children}
    </blockquote>
  );
}

function TableRenderer({
  children,
}: ComponentPropsWithoutRef<'table'>): JSX.Element {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
      <table>{children}</table>
    </div>
  );
}

function LinkRenderer({
  href,
  children,
  ...rest
}: ComponentPropsWithoutRef<'a'>): JSX.Element {
  const isExternal =
    typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'));

  return (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:text-blue-400 transition-colors"
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

function H2Renderer({
  children,
  ...rest
}: ComponentPropsWithoutRef<'h2'>): JSX.Element {
  return (
    <h2
      className="text-2xl font-bold mt-10 mb-4 text-neutral-100 border-b border-white/10 pb-2"
      {...rest}
    >
      {children}
    </h2>
  );
}

function H3Renderer({
  children,
  ...rest
}: ComponentPropsWithoutRef<'h3'>): JSX.Element {
  return (
    <h3
      className="text-xl font-semibold mt-8 mb-3 text-neutral-200"
      {...rest}
    >
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Component map for ReactMarkdown
// ---------------------------------------------------------------------------

const COMPONENTS = {
  code: CodeRenderer,
  blockquote: BlockquoteRenderer,
  table: TableRenderer,
  a: LinkRenderer,
  h2: H2Renderer,
  h3: H3Renderer,
} as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MarkdownRenderer({ content }: MarkdownRendererProps): JSX.Element {
  return (
    <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
