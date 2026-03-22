import type { JSX } from 'react';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn, AnimatedArrow } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServiceBox {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  icon?: string;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
  protocol?: string;
  bidirectional?: boolean;
}

interface ArchitectureDiagramProps {
  step: number;
  services: ServiceBox[];
  connections: Connection[];
  title?: string;
  stepDescriptions: string[];
  visibleAtStep?: Record<number, string[]>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BOX_WIDTH = 130;
const DEFAULT_BOX_HEIGHT = 60;
const DEFAULT_COLOR = '#3b82f6';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isVisible(
  id: string,
  step: number,
  visibleAtStep?: Record<number, string[]>,
): boolean {
  if (!visibleAtStep) return true;
  for (let s = 0; s <= step; s++) {
    if (visibleAtStep[s]?.includes(id)) return true;
  }
  return false;
}

function getBoxCenter(
  box: ServiceBox,
): { x: number; y: number; w: number; h: number } {
  const w = box.width ?? DEFAULT_BOX_WIDTH;
  const h = box.height ?? DEFAULT_BOX_HEIGHT;
  return { x: box.x + w / 2, y: box.y + h / 2, w, h };
}

function getRectEdgePoint(
  center: { x: number; y: number },
  w: number,
  h: number,
  angle: number,
): { x: number; y: number } {
  const hw = w / 2;
  const hh = h / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tx = cos !== 0 ? hw / Math.abs(cos) : Infinity;
  const ty = sin !== 0 ? hh / Math.abs(sin) : Infinity;
  const t = Math.min(tx, ty);
  return { x: center.x + t * cos, y: center.y + t * sin };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArchitectureDiagram({
  step,
  services,
  connections,
  title,
  stepDescriptions,
  visibleAtStep,
}: ArchitectureDiagramProps): JSX.Element {
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Title */}
        {title && (
          <text
            x={300}
            y={20}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize={14}
            fontWeight={600}
            fontFamily="var(--font-sans)"
          >
            {title}
          </text>
        )}

        {/* Connections */}
        {connections.map((conn) => {
          const fromBox = serviceMap.get(conn.from);
          const toBox = serviceMap.get(conn.to);
          if (!fromBox || !toBox) return null;

          const connId = `${conn.from}->${conn.to}`;
          const visible =
            isVisible(connId, step, visibleAtStep) &&
            isVisible(conn.from, step, visibleAtStep) &&
            isVisible(conn.to, step, visibleAtStep);

          const fromC = getBoxCenter(fromBox);
          const toC = getBoxCenter(toBox);
          const angle = Math.atan2(toC.y - fromC.y, toC.x - fromC.x);

          const fromPt = getRectEdgePoint(fromC, fromC.w, fromC.h, angle);
          const toPt = getRectEdgePoint(toC, toC.w, toC.h, angle + Math.PI);

          // Combined label: protocol + label
          const displayLabel = [conn.protocol, conn.label].filter(Boolean).join(' ');

          return (
            <g key={connId}>
              <AnimatedArrow
                from={fromPt}
                to={toPt}
                visible={visible}
                color="#64748b"
                label={displayLabel || undefined}
              />
              {/* Reverse arrow for bidirectional */}
              {conn.bidirectional && (
                <AnimatedArrow
                  from={{
                    x: toPt.x + (fromPt.x - toPt.x) * 0.05,
                    y: toPt.y + (fromPt.y - toPt.y) * 0.05 + 6,
                  }}
                  to={{
                    x: fromPt.x - (fromPt.x - toPt.x) * 0.05,
                    y: fromPt.y - (fromPt.y - toPt.y) * 0.05 + 6,
                  }}
                  visible={visible}
                  color="#475569"
                  dashed
                />
              )}
            </g>
          );
        })}

        {/* Service boxes */}
        {services.map((svc, i) => {
          const visible = isVisible(svc.id, step, visibleAtStep);
          const w = svc.width ?? DEFAULT_BOX_WIDTH;
          const h = svc.height ?? DEFAULT_BOX_HEIGHT;
          const color = svc.color ?? DEFAULT_COLOR;

          return (
            <FadeIn key={svc.id} visible={visible} delay={i * 0.06}>
              {/* Shadow */}
              <rect
                x={svc.x + 2}
                y={svc.y + 2}
                width={w}
                height={h}
                rx={10}
                ry={10}
                fill="#00000030"
              />

              {/* Main box */}
              <rect
                x={svc.x}
                y={svc.y}
                width={w}
                height={h}
                rx={10}
                ry={10}
                fill={`${color}18`}
                stroke={color}
                strokeWidth={1.5}
              />

              {/* Icon */}
              {svc.icon && (
                <text
                  x={svc.x + 16}
                  y={svc.y + h / 2 - (svc.sublabel ? 4 : 0)}
                  dominantBaseline="central"
                  fontSize={16}
                >
                  {svc.icon}
                </text>
              )}

              {/* Label */}
              <text
                x={svc.x + w / 2 + (svc.icon ? 10 : 0)}
                y={svc.y + (svc.sublabel ? h / 2 - 7 : h / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e2e8f0"
                fontSize={12}
                fontWeight={600}
                fontFamily="var(--font-sans)"
              >
                {svc.label}
              </text>

              {/* Sublabel */}
              {svc.sublabel && (
                <text
                  x={svc.x + w / 2 + (svc.icon ? 10 : 0)}
                  y={svc.y + h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="var(--font-sans)"
                >
                  {svc.sublabel}
                </text>
              )}
            </FadeIn>
          );
        })}
      </svg>
    </VisualWrapper>
  );
}

export type { ServiceBox, Connection, ArchitectureDiagramProps };
