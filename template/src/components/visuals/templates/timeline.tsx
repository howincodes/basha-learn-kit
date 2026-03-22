import type { JSX } from 'react';
import { VisualWrapper } from '@/components/visuals/visual-wrapper';
import { FadeIn, ScaleIn } from '@/components/visuals/animated-box';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimelineEvent {
  label: string;
  sublabel?: string;
  color: string;
  icon?: string;
  timestamp?: string;
}

interface TimelineProps {
  step: number;
  events: TimelineEvent[];
  title?: string;
  stepDescriptions: string[];
  visibleCount?: number[];
  orientation?: 'horizontal' | 'vertical';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DOT_RADIUS = 8;
const H_TIMELINE_Y = 160;
const V_TIMELINE_X = 80;

// ---------------------------------------------------------------------------
// Horizontal Timeline
// ---------------------------------------------------------------------------

function HorizontalTimeline({
  events,
  visibleEventCount,
}: {
  events: TimelineEvent[];
  visibleEventCount: number;
}): JSX.Element {
  const padding = 60;
  const usableWidth = 600 - padding * 2;
  const spacing = events.length > 1 ? usableWidth / (events.length - 1) : 0;

  return (
    <>
      {/* Main line */}
      <FadeIn visible={true}>
        <line
          x1={padding}
          y1={H_TIMELINE_Y}
          x2={600 - padding}
          y2={H_TIMELINE_Y}
          stroke="#334155"
          strokeWidth={2}
        />
      </FadeIn>

      {/* Events */}
      {events.map((event, i) => {
        const x = events.length === 1 ? 300 : padding + i * spacing;
        const visible = i < visibleEventCount;
        const above = i % 2 === 0;

        return (
          <FadeIn key={`event-${i}`} visible={visible} delay={i * 0.1}>
            {/* Connector line */}
            <line
              x1={x}
              y1={H_TIMELINE_Y}
              x2={x}
              y2={above ? H_TIMELINE_Y - 30 : H_TIMELINE_Y + 30}
              stroke={event.color}
              strokeWidth={1}
              opacity={0.5}
            />

            {/* Dot */}
            <ScaleIn visible={visible} delay={i * 0.1 + 0.05}>
              <circle
                cx={x}
                cy={H_TIMELINE_Y}
                r={DOT_RADIUS}
                fill={`${event.color}30`}
                stroke={event.color}
                strokeWidth={2}
              />
              {event.icon && (
                <text
                  x={x}
                  y={H_TIMELINE_Y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                >
                  {event.icon}
                </text>
              )}
            </ScaleIn>

            {/* Label (alternating above/below) */}
            <text
              x={x}
              y={above ? H_TIMELINE_Y - 40 : H_TIMELINE_Y + 44}
              textAnchor="middle"
              dominantBaseline={above ? 'auto' : 'hanging'}
              fill="#e2e8f0"
              fontSize={11}
              fontWeight={500}
              fontFamily="var(--font-sans)"
            >
              {event.label}
            </text>

            {/* Sublabel */}
            {event.sublabel && (
              <text
                x={x}
                y={above ? H_TIMELINE_Y - 54 : H_TIMELINE_Y + 58}
                textAnchor="middle"
                dominantBaseline={above ? 'auto' : 'hanging'}
                fill="#94a3b8"
                fontSize={9}
                fontFamily="var(--font-sans)"
              >
                {event.sublabel}
              </text>
            )}

            {/* Timestamp */}
            {event.timestamp && (
              <text
                x={x}
                y={above ? H_TIMELINE_Y - 68 : H_TIMELINE_Y + 72}
                textAnchor="middle"
                dominantBaseline={above ? 'auto' : 'hanging'}
                fill="#475569"
                fontSize={8}
                fontFamily="var(--font-mono, monospace)"
              >
                {event.timestamp}
              </text>
            )}
          </FadeIn>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Vertical Timeline
// ---------------------------------------------------------------------------

function VerticalTimeline({
  events,
  visibleEventCount,
}: {
  events: TimelineEvent[];
  visibleEventCount: number;
}): JSX.Element {
  const paddingY = 30;
  const usableHeight = 320 - paddingY * 2;
  const spacing = events.length > 1 ? usableHeight / (events.length - 1) : 0;

  return (
    <>
      {/* Main line */}
      <FadeIn visible={true}>
        <line
          x1={V_TIMELINE_X}
          y1={paddingY}
          x2={V_TIMELINE_X}
          y2={320 - paddingY}
          stroke="#334155"
          strokeWidth={2}
        />
      </FadeIn>

      {/* Events */}
      {events.map((event, i) => {
        const y = events.length === 1 ? 160 : paddingY + i * spacing;
        const visible = i < visibleEventCount;

        return (
          <FadeIn key={`event-${i}`} visible={visible} delay={i * 0.1}>
            {/* Connector line */}
            <line
              x1={V_TIMELINE_X}
              y1={y}
              x2={V_TIMELINE_X + 24}
              y2={y}
              stroke={event.color}
              strokeWidth={1}
              opacity={0.5}
            />

            {/* Dot */}
            <ScaleIn visible={visible} delay={i * 0.1 + 0.05}>
              <circle
                cx={V_TIMELINE_X}
                cy={y}
                r={DOT_RADIUS}
                fill={`${event.color}30`}
                stroke={event.color}
                strokeWidth={2}
              />
              {event.icon && (
                <text
                  x={V_TIMELINE_X}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                >
                  {event.icon}
                </text>
              )}
            </ScaleIn>

            {/* Timestamp on the left */}
            {event.timestamp && (
              <text
                x={V_TIMELINE_X - 16}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fill="#475569"
                fontSize={8}
                fontFamily="var(--font-mono, monospace)"
              >
                {event.timestamp}
              </text>
            )}

            {/* Label */}
            <text
              x={V_TIMELINE_X + 32}
              y={event.sublabel ? y - 6 : y}
              dominantBaseline="central"
              fill="#e2e8f0"
              fontSize={11}
              fontWeight={500}
              fontFamily="var(--font-sans)"
            >
              {event.label}
            </text>

            {/* Sublabel */}
            {event.sublabel && (
              <text
                x={V_TIMELINE_X + 32}
                y={y + 10}
                dominantBaseline="central"
                fill="#94a3b8"
                fontSize={9}
                fontFamily="var(--font-sans)"
              >
                {event.sublabel}
              </text>
            )}
          </FadeIn>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Timeline({
  step,
  events,
  title,
  stepDescriptions,
  visibleCount,
  orientation = 'horizontal',
}: TimelineProps): JSX.Element {
  const eventCount = visibleCount
    ? Math.min(visibleCount[Math.min(step, visibleCount.length - 1)] ?? events.length, events.length)
    : Math.min(step + 1, events.length);

  return (
    <VisualWrapper step={step} stepDescription={stepDescriptions[step]}>
      <svg viewBox="0 0 600 320" className="w-full h-auto">
        {/* Title */}
        {title && (
          <text
            x={300}
            y={18}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize={14}
            fontWeight={600}
            fontFamily="var(--font-sans)"
          >
            {title}
          </text>
        )}

        {orientation === 'horizontal' ? (
          <HorizontalTimeline events={events} visibleEventCount={eventCount} />
        ) : (
          <VerticalTimeline events={events} visibleEventCount={eventCount} />
        )}
      </svg>
    </VisualWrapper>
  );
}

export type { TimelineEvent, TimelineProps };
