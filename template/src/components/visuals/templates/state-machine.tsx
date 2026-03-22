import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn, AnimatedArrow } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface State {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Transition {
  from: string;
  to: string;
  label?: string;
}

interface StateMachineProps {
  step: number;
  states: State[];
  transitions: Transition[];
  activeState?: string[];
  stepDescriptions: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATE_RX = 50;
const STATE_RY = 30;
const DEFAULT_STROKE = '#64748b';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEllipseEdgePoint(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
): { x: number; y: number } {
  // Parametric intersection of ray from center at `angle` with ellipse
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const denom = Math.sqrt((cos * cos) / (rx * rx) + (sin * sin) / (ry * ry));
  return { x: cx + cos / denom, y: cy + sin / denom };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StateMachine({
  step,
  states,
  transitions,
  activeState,
  stepDescriptions,
}: StateMachineProps): JSX.Element {
  const stateMap = new Map(states.map((s) => [s.id, s]));
  const currentActive = activeState?.[Math.min(step, activeState.length - 1)];

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Defs for glow filter */}
        <defs>
          <filter id="state-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Transitions (arrows) */}
        {transitions.map((t) => {
          const fromState = stateMap.get(t.from);
          const toState = stateMap.get(t.to);
          if (!fromState || !toState) return null;

          const angle = Math.atan2(
            toState.y - fromState.y,
            toState.x - fromState.x,
          );
          const fromPt = getEllipseEdgePoint(
            fromState.x,
            fromState.y,
            STATE_RX,
            STATE_RY,
            angle,
          );
          const toPt = getEllipseEdgePoint(
            toState.x,
            toState.y,
            STATE_RX,
            STATE_RY,
            angle + Math.PI,
          );

          return (
            <AnimatedArrow
              key={`${t.from}->${t.to}`}
              from={fromPt}
              to={toPt}
              visible={step >= 0}
              color={DEFAULT_STROKE}
              label={t.label}
            />
          );
        })}

        {/* States */}
        {states.map((state, i) => {
          const isActive = currentActive === state.id;

          return (
            <FadeIn key={state.id} visible={step >= 0} delay={i * 0.08}>
              {/* Pulse ring for active state */}
              {isActive && (
                <motion.ellipse
                  cx={state.x}
                  cy={state.y}
                  rx={STATE_RX + 4}
                  ry={STATE_RY + 4}
                  fill="none"
                  stroke={state.color}
                  strokeWidth={2}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    rx: [STATE_RX + 4, STATE_RX + 8, STATE_RX + 4],
                    ry: [STATE_RY + 4, STATE_RY + 8, STATE_RY + 4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* State ellipse */}
              <ellipse
                cx={state.x}
                cy={state.y}
                rx={STATE_RX}
                ry={STATE_RY}
                fill={isActive ? `${state.color}30` : `${state.color}15`}
                stroke={state.color}
                strokeWidth={isActive ? 2.5 : 1.5}
                filter={isActive ? 'url(#state-glow)' : undefined}
              />

              {/* Label */}
              <text
                x={state.x}
                y={state.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isActive ? '#f1f5f9' : '#cbd5e1'}
                fontSize={12}
                fontWeight={isActive ? 600 : 400}
                fontFamily="var(--font-sans)"
              >
                {state.label}
              </text>
            </FadeIn>
          );
        })}
      </svg>
    </VisualWrapper>
  );
}

export type { State, Transition, StateMachineProps };
