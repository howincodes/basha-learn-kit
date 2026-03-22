import type { JSX } from 'react';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn, SlideIn } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComparisonRow {
  label: string;
  left: string;
  right: string;
}

interface ComparisonProps {
  step: number;
  leftTitle: string;
  rightTitle: string;
  leftColor?: string;
  rightColor?: string;
  rows: ComparisonRow[];
  stepDescriptions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABLE_X = 30;
const TABLE_Y = 40;
const COL_WIDTH = 170;
const LABEL_COL_WIDTH = 110;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 40;
const DEFAULT_LEFT_COLOR = '#3b82f6';
const DEFAULT_RIGHT_COLOR = '#f59e0b';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComparisonTable({
  step,
  leftTitle,
  rightTitle,
  leftColor,
  rightColor,
  rows,
  stepDescriptions,
}: ComparisonProps): JSX.Element {
  const lColor = leftColor ?? DEFAULT_LEFT_COLOR;
  const rColor = rightColor ?? DEFAULT_RIGHT_COLOR;
  const totalWidth = LABEL_COL_WIDTH + COL_WIDTH * 2;

  // Each step reveals one more row (step 0 = header only, step 1 = first row, etc.)
  const visibleRowCount = Math.min(step, rows.length);

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Header background */}
        <FadeIn visible={step >= 0}>
          <rect
            x={TABLE_X}
            y={TABLE_Y}
            width={totalWidth}
            height={HEADER_HEIGHT}
            rx={6}
            ry={6}
            fill="#1e293b"
          />
          {/* Label column header */}
          <text
            x={TABLE_X + LABEL_COL_WIDTH / 2}
            y={TABLE_Y + HEADER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#94a3b8"
            fontSize={11}
            fontFamily="var(--font-sans)"
          >
            Feature
          </text>
          {/* Left column header */}
          <rect
            x={TABLE_X + LABEL_COL_WIDTH}
            y={TABLE_Y + 4}
            width={COL_WIDTH - 8}
            height={HEADER_HEIGHT - 8}
            rx={4}
            fill={`${lColor}20`}
          />
          <text
            x={TABLE_X + LABEL_COL_WIDTH + COL_WIDTH / 2}
            y={TABLE_Y + HEADER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={lColor}
            fontSize={12}
            fontWeight={600}
            fontFamily="var(--font-sans)"
          >
            {leftTitle}
          </text>
          {/* Right column header */}
          <rect
            x={TABLE_X + LABEL_COL_WIDTH + COL_WIDTH}
            y={TABLE_Y + 4}
            width={COL_WIDTH - 8}
            height={HEADER_HEIGHT - 8}
            rx={4}
            fill={`${rColor}20`}
          />
          <text
            x={TABLE_X + LABEL_COL_WIDTH + COL_WIDTH + COL_WIDTH / 2}
            y={TABLE_Y + HEADER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={rColor}
            fontSize={12}
            fontWeight={600}
            fontFamily="var(--font-sans)"
          >
            {rightTitle}
          </text>
        </FadeIn>

        {/* Rows */}
        {rows.map((row, i) => {
          const rowY = TABLE_Y + HEADER_HEIGHT + i * ROW_HEIGHT;
          const visible = i < visibleRowCount;
          const bgFill = i % 2 === 0 ? '#0f172a' : '#1e293b40';

          return (
            <SlideIn key={row.label} visible={visible} direction="right" delay={0.05}>
              {/* Row background */}
              <rect
                x={TABLE_X}
                y={rowY}
                width={totalWidth}
                height={ROW_HEIGHT}
                rx={i === rows.length - 1 ? 4 : 0}
                fill={bgFill}
              />
              {/* Divider line */}
              <line
                x1={TABLE_X}
                y1={rowY}
                x2={TABLE_X + totalWidth}
                y2={rowY}
                stroke="#334155"
                strokeWidth={0.5}
              />
              {/* Label */}
              <text
                x={TABLE_X + LABEL_COL_WIDTH / 2}
                y={rowY + ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#cbd5e1"
                fontSize={11}
                fontWeight={500}
                fontFamily="var(--font-sans)"
              >
                {row.label}
              </text>
              {/* Left value */}
              <text
                x={TABLE_X + LABEL_COL_WIDTH + COL_WIDTH / 2}
                y={rowY + ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e2e8f0"
                fontSize={11}
                fontFamily="var(--font-sans)"
              >
                {row.left}
              </text>
              {/* Right value */}
              <text
                x={TABLE_X + LABEL_COL_WIDTH + COL_WIDTH + COL_WIDTH / 2}
                y={rowY + ROW_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e2e8f0"
                fontSize={11}
                fontFamily="var(--font-sans)"
              >
                {row.right}
              </text>
            </SlideIn>
          );
        })}

        {/* Border around entire table */}
        <FadeIn visible={step >= 0}>
          <rect
            x={TABLE_X}
            y={TABLE_Y}
            width={totalWidth}
            height={HEADER_HEIGHT + Math.min(visibleRowCount, rows.length) * ROW_HEIGHT}
            rx={6}
            ry={6}
            fill="none"
            stroke="#334155"
            strokeWidth={1}
          />
        </FadeIn>
      </svg>
    </VisualWrapper>
  );
}

export type { ComparisonRow, ComparisonProps };
