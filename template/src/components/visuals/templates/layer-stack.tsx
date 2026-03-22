import type { JSX } from 'react';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { SlideIn } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Layer {
  label: string;
  sublabel?: string;
  color: string;
  height?: number;
}

interface LayerStackProps {
  step: number;
  layers: Layer[];
  title?: string;
  stepDescriptions: string[];
  visibleCount?: number[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STACK_X = 80;
const STACK_WIDTH = 440;
const DEFAULT_LAYER_HEIGHT = 40;
const STACK_BOTTOM = 290;
const GAP = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LayerStack({
  step,
  layers,
  title,
  stepDescriptions,
  visibleCount,
}: LayerStackProps): JSX.Element {
  // Determine how many layers are visible from bottom
  const count = visibleCount
    ? Math.min(visibleCount[Math.min(step, visibleCount.length - 1)] ?? layers.length, layers.length)
    : Math.min(step + 1, layers.length);

  // Layers render bottom-to-top: index 0 = bottom
  let currentY = STACK_BOTTOM;

  // Pre-calculate positions (bottom-up)
  const positions: Array<{ layer: Layer; y: number; h: number; index: number }> = [];
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!layer) continue;
    const h = layer.height ?? DEFAULT_LAYER_HEIGHT;
    currentY -= h + (i > 0 ? GAP : 0);
    positions.push({ layer, y: currentY, h, index: i });
  }

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Title */}
        {title && (
          <text
            x={300}
            y={22}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize={14}
            fontWeight={600}
            fontFamily="var(--font-sans)"
          >
            {title}
          </text>
        )}

        {/* Layers — rendered bottom to top */}
        {positions.map(({ layer, y, h, index }) => {
          const visible = index < count;

          return (
            <SlideIn
              key={`layer-${index}`}
              visible={visible}
              direction="up"
              delay={index * 0.08}
            >
              {/* Layer rectangle */}
              <rect
                x={STACK_X}
                y={y}
                width={STACK_WIDTH}
                height={h}
                rx={6}
                ry={6}
                fill={`${layer.color}25`}
                stroke={layer.color}
                strokeWidth={1.5}
              />
              {/* Label */}
              <text
                x={STACK_X + STACK_WIDTH / 2}
                y={y + (layer.sublabel ? h / 2 - 6 : h / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e2e8f0"
                fontSize={12}
                fontWeight={500}
                fontFamily="var(--font-sans)"
              >
                {layer.label}
              </text>
              {/* Sublabel */}
              {layer.sublabel && (
                <text
                  x={STACK_X + STACK_WIDTH / 2}
                  y={y + h / 2 + 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="var(--font-sans)"
                >
                  {layer.sublabel}
                </text>
              )}
              {/* Layer index indicator */}
              <text
                x={STACK_X - 16}
                y={y + h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#475569"
                fontSize={10}
                fontFamily="var(--font-sans)"
              >
                {index}
              </text>
            </SlideIn>
          );
        })}
      </svg>
    </VisualWrapper>
  );
}

export type { Layer, LayerStackProps };
