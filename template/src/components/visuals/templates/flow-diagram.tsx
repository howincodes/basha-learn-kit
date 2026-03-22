import type { JSX } from 'react';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn, AnimatedArrow } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  icon?: string;
  sublabel?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  color?: string;
}

interface FlowDiagramProps {
  step: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  title?: string;
  stepDescriptions: string[];
  visibleAtStep?: Record<number, string[]>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;
const DEFAULT_NODE_COLOR = '#3b82f6';
const DEFAULT_EDGE_COLOR = '#64748b';

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

function getNodeCenter(node: FlowNode): { x: number; y: number } {
  return { x: node.x + NODE_WIDTH / 2, y: node.y + NODE_HEIGHT / 2 };
}

function getEdgeEndpoints(
  fromNode: FlowNode,
  toNode: FlowNode,
): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const fromCenter = getNodeCenter(fromNode);
  const toCenter = getNodeCenter(toNode);

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const angle = Math.atan2(dy, dx);

  // Determine exit/entry points on the rectangle edges
  const fromPt = getRectEdgePoint(fromCenter, NODE_WIDTH, NODE_HEIGHT, angle);
  const toPt = getRectEdgePoint(toCenter, NODE_WIDTH, NODE_HEIGHT, angle + Math.PI);

  return { from: fromPt, to: toPt };
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

  // Find intersection with rectangle edge
  const tx = cos !== 0 ? hw / Math.abs(cos) : Infinity;
  const ty = sin !== 0 ? hh / Math.abs(sin) : Infinity;
  const t = Math.min(tx, ty);

  return { x: center.x + t * cos, y: center.y + t * sin };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FlowDiagram({
  step,
  nodes,
  edges,
  title,
  stepDescriptions,
  visibleAtStep,
}: FlowDiagramProps): JSX.Element {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

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

        {/* Edges */}
        {edges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return null;

          const edgeId = `${edge.from}->${edge.to}`;
          const visible =
            isVisible(edgeId, step, visibleAtStep) &&
            isVisible(edge.from, step, visibleAtStep) &&
            isVisible(edge.to, step, visibleAtStep);
          const { from: fromPt, to: toPt } = getEdgeEndpoints(fromNode, toNode);

          return (
            <AnimatedArrow
              key={edgeId}
              from={fromPt}
              to={toPt}
              visible={visible}
              color={edge.color ?? DEFAULT_EDGE_COLOR}
              dashed={edge.dashed}
              label={edge.label}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const visible = isVisible(node.id, step, visibleAtStep);
          const color = node.color ?? DEFAULT_NODE_COLOR;

          return (
            <FadeIn key={node.id} visible={visible} delay={i * 0.05}>
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                ry={8}
                fill={`${color}20`}
                stroke={color}
                strokeWidth={1.5}
              />
              {node.icon && (
                <text
                  x={node.x + 14}
                  y={node.y + NODE_HEIGHT / 2 + 1}
                  fontSize={14}
                  dominantBaseline="central"
                >
                  {node.icon}
                </text>
              )}
              <text
                x={node.x + NODE_WIDTH / 2 + (node.icon ? 8 : 0)}
                y={node.y + (node.sublabel ? NODE_HEIGHT / 2 - 6 : NODE_HEIGHT / 2)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#e2e8f0"
                fontSize={12}
                fontWeight={500}
                fontFamily="var(--font-sans)"
              >
                {node.label}
              </text>
              {node.sublabel && (
                <text
                  x={node.x + NODE_WIDTH / 2 + (node.icon ? 8 : 0)}
                  y={node.y + NODE_HEIGHT / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize={9}
                  fontFamily="var(--font-sans)"
                >
                  {node.sublabel}
                </text>
              )}
            </FadeIn>
          );
        })}
      </svg>
    </VisualWrapper>
  );
}

export type { FlowNode, FlowEdge, FlowDiagramProps };
