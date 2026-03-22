import type { JSX } from 'react';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'success' | 'comment';
}

interface TerminalOutputProps {
  step: number;
  lines: TerminalLine[];
  title?: string;
  stepDescriptions: string[];
  visibleLines?: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TERM_X = 30;
const TERM_Y = 20;
const TERM_WIDTH = 540;
const TERM_HEIGHT = 270;
const LINE_HEIGHT = 18;
const TEXT_START_X = 48;
const TEXT_START_Y = 60;
const TITLE_BAR_HEIGHT = 30;

const LINE_COLORS: Record<TerminalLine['type'], string> = {
  command: '#a5f3fc',
  output: '#94a3b8',
  error: '#fca5a5',
  success: '#86efac',
  comment: '#64748b',
};

const LINE_PREFIXES: Record<TerminalLine['type'], string> = {
  command: '$ ',
  output: '  ',
  error: '! ',
  success: '  ',
  comment: '# ',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TerminalOutput({
  step,
  lines,
  title,
  stepDescriptions,
  visibleLines,
}: TerminalOutputProps): JSX.Element {
  const lineCount = visibleLines
    ? Math.min(visibleLines[Math.min(step, visibleLines.length - 1)] ?? lines.length, lines.length)
    : Math.min(step + 1, lines.length);

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Terminal window */}
        <rect
          x={TERM_X}
          y={TERM_Y}
          width={TERM_WIDTH}
          height={TERM_HEIGHT}
          rx={8}
          ry={8}
          fill="#0f172a"
          stroke="#334155"
          strokeWidth={1}
        />

        {/* Title bar */}
        <rect
          x={TERM_X}
          y={TERM_Y}
          width={TERM_WIDTH}
          height={TITLE_BAR_HEIGHT}
          rx={8}
          ry={8}
          fill="#1e293b"
        />
        {/* Cover bottom corners of title bar */}
        <rect
          x={TERM_X}
          y={TERM_Y + TITLE_BAR_HEIGHT - 8}
          width={TERM_WIDTH}
          height={8}
          fill="#1e293b"
        />

        {/* Window buttons */}
        <circle cx={TERM_X + 16} cy={TERM_Y + TITLE_BAR_HEIGHT / 2} r={5} fill="#ef4444" />
        <circle cx={TERM_X + 34} cy={TERM_Y + TITLE_BAR_HEIGHT / 2} r={5} fill="#f59e0b" />
        <circle cx={TERM_X + 52} cy={TERM_Y + TITLE_BAR_HEIGHT / 2} r={5} fill="#22c55e" />

        {/* Title text */}
        <text
          x={TERM_X + TERM_WIDTH / 2}
          y={TERM_Y + TITLE_BAR_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#64748b"
          fontSize={11}
          fontFamily="var(--font-mono, monospace)"
        >
          {title ?? 'Terminal'}
        </text>

        {/* Terminal lines */}
        {lines.map((line, i) => {
          const visible = i < lineCount;
          const y = TEXT_START_Y + i * LINE_HEIGHT;

          // Don't render lines that would overflow the terminal
          if (y + LINE_HEIGHT > TERM_Y + TERM_HEIGHT - 8) return null;

          const color = LINE_COLORS[line.type];
          const prefix = LINE_PREFIXES[line.type];

          return (
            <FadeIn key={`line-${i}`} visible={visible} delay={i * 0.04}>
              <text
                x={TEXT_START_X}
                y={y}
                fill={color}
                fontSize={11}
                fontFamily="var(--font-mono, monospace)"
                dominantBaseline="hanging"
              >
                <tspan fill={line.type === 'command' ? '#22d3ee' : color}>
                  {prefix}
                </tspan>
                {line.text}
              </text>

              {/* Blinking cursor on last visible command line */}
              {i === lineCount - 1 && line.type === 'command' && (
                <rect
                  x={TEXT_START_X + (prefix.length + line.text.length) * 6.6 + 2}
                  y={y}
                  width={7}
                  height={13}
                  fill="#a5f3fc"
                  opacity={0.8}
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;0;0.8"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}
            </FadeIn>
          );
        })}
      </svg>
    </VisualWrapper>
  );
}

export type { TerminalLine, TerminalOutputProps };
