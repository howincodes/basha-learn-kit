import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PipelineStage {
  label: string;
  sublabel?: string;
  color: string;
  icon?: string;
}

interface PipelineProps {
  step: number;
  stages: PipelineStage[];
  title?: string;
  stepDescriptions: string[];
  activeStage?: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIPELINE_Y = 120;
const STAGE_WIDTH = 90;
const STAGE_HEIGHT = 60;
const ARROW_GAP = 30;
const PADDING_X = 40;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Pipeline({
  step,
  stages,
  title,
  stepDescriptions,
  activeStage,
}: PipelineProps): JSX.Element {
  const currentActiveIdx = activeStage?.[Math.min(step, activeStage.length - 1)] ?? -1;

  // Center stages horizontally
  const totalWidth = stages.length * STAGE_WIDTH + (stages.length - 1) * ARROW_GAP;
  const startX = Math.max(PADDING_X, (600 - totalWidth) / 2);

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Defs */}
        <defs>
          <filter id="pipeline-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        {title && (
          <text
            x={300}
            y={40}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize={14}
            fontWeight={600}
            fontFamily="var(--font-sans)"
          >
            {title}
          </text>
        )}

        {/* Connector line (background track) */}
        <FadeIn visible={step >= 0}>
          <line
            x1={startX + STAGE_WIDTH / 2}
            y1={PIPELINE_Y + STAGE_HEIGHT / 2}
            x2={startX + (stages.length - 1) * (STAGE_WIDTH + ARROW_GAP) + STAGE_WIDTH / 2}
            y2={PIPELINE_Y + STAGE_HEIGHT / 2}
            stroke="#334155"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        </FadeIn>

        {/* Stages */}
        {stages.map((stage, i) => {
          const x = startX + i * (STAGE_WIDTH + ARROW_GAP);
          const isActive = i === currentActiveIdx;
          const isPast = i < currentActiveIdx;

          return (
            <FadeIn key={`stage-${i}`} visible={step >= 0} delay={i * 0.1}>
              {/* Glow ring for active */}
              {isActive && (
                <motion.rect
                  x={x - 3}
                  y={PIPELINE_Y - 3}
                  width={STAGE_WIDTH + 6}
                  height={STAGE_HEIGHT + 6}
                  rx={12}
                  ry={12}
                  fill="none"
                  stroke={stage.color}
                  strokeWidth={2}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  filter="url(#pipeline-glow)"
                />
              )}

              {/* Stage box */}
              <rect
                x={x}
                y={PIPELINE_Y}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                rx={10}
                ry={10}
                fill={isActive ? `${stage.color}35` : isPast ? `${stage.color}20` : `${stage.color}10`}
                stroke={stage.color}
                strokeWidth={isActive ? 2 : 1}
                opacity={isPast || isActive ? 1 : 0.6}
              />

              {/* Icon */}
              {stage.icon && (
                <text
                  x={x + STAGE_WIDTH / 2}
                  y={PIPELINE_Y + (stage.sublabel ? 18 : 22)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={16}
                >
                  {stage.icon}
                </text>
              )}

              {/* Label */}
              <text
                x={x + STAGE_WIDTH / 2}
                y={PIPELINE_Y + (stage.icon ? 36 : stage.sublabel ? STAGE_HEIGHT / 2 - 6 : STAGE_HEIGHT / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isActive ? '#f1f5f9' : '#cbd5e1'}
                fontSize={10}
                fontWeight={isActive ? 600 : 400}
                fontFamily="var(--font-sans)"
              >
                {stage.label}
              </text>

              {/* Sublabel */}
              {stage.sublabel && !stage.icon && (
                <text
                  x={x + STAGE_WIDTH / 2}
                  y={PIPELINE_Y + STAGE_HEIGHT / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize={8}
                  fontFamily="var(--font-sans)"
                >
                  {stage.sublabel}
                </text>
              )}

              {/* Arrow to next stage */}
              {i < stages.length - 1 && (
                <g>
                  <line
                    x1={x + STAGE_WIDTH + 4}
                    y1={PIPELINE_Y + STAGE_HEIGHT / 2}
                    x2={x + STAGE_WIDTH + ARROW_GAP - 8}
                    y2={PIPELINE_Y + STAGE_HEIGHT / 2}
                    stroke={isPast ? stage.color : '#475569'}
                    strokeWidth={2}
                  />
                  <polygon
                    points={`
                      ${x + STAGE_WIDTH + ARROW_GAP - 4},${PIPELINE_Y + STAGE_HEIGHT / 2}
                      ${x + STAGE_WIDTH + ARROW_GAP - 12},${PIPELINE_Y + STAGE_HEIGHT / 2 - 5}
                      ${x + STAGE_WIDTH + ARROW_GAP - 12},${PIPELINE_Y + STAGE_HEIGHT / 2 + 5}
                    `}
                    fill={isPast ? stage.color : '#475569'}
                  />
                </g>
              )}

              {/* Step number below */}
              <text
                x={x + STAGE_WIDTH / 2}
                y={PIPELINE_Y + STAGE_HEIGHT + 20}
                textAnchor="middle"
                fill="#475569"
                fontSize={9}
                fontFamily="var(--font-sans)"
              >
                {i + 1}
              </text>
            </FadeIn>
          );
        })}
      </svg>
    </VisualWrapper>
  );
}

export type { PipelineStage, PipelineProps };
