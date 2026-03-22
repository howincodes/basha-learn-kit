import type { JSX, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Semantic colors (matching index.css theme)
// ---------------------------------------------------------------------------

const COLORS = {
  container: '#3b82f6',
  image: '#10b981',
  storage: '#f59e0b',
  network: '#8b5cf6',
  error: '#ef4444',
  success: '#059669',
  neutral: '#64748b',
} as const;

// ---------------------------------------------------------------------------
// FadeIn
// ---------------------------------------------------------------------------

interface FadeInProps {
  visible: boolean;
  delay?: number;
  duration?: number;
  children: ReactNode;
  className?: string;
}

export function FadeIn({
  visible,
  delay = 0,
  duration = 0.5,
  children,
  className = '',
}: FadeInProps): JSX.Element {
  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay, duration, type: 'spring', bounce: 0 }}
          className={className}
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// SlideIn
// ---------------------------------------------------------------------------

interface SlideInProps {
  direction: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  visible: boolean;
  children: ReactNode;
  className?: string;
}

const slideOffsets: Record<SlideInProps['direction'], { x?: number; y?: number }> = {
  left: { x: -40 },
  right: { x: 40 },
  up: { y: -40 },
  down: { y: 40 },
};

export function SlideIn({
  direction,
  delay = 0,
  visible,
  children,
  className = '',
}: SlideInProps): JSX.Element {
  const offset = slideOffsets[direction];

  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0, ...offset }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...offset }}
          transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
          className={className}
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// ScaleIn
// ---------------------------------------------------------------------------

interface ScaleInProps {
  delay?: number;
  visible: boolean;
  children: ReactNode;
  className?: string;
}

export function ScaleIn({
  delay = 0,
  visible,
  children,
  className = '',
}: ScaleInProps): JSX.Element {
  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
          className={className}
        >
          {children}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// AnimatedArrow — SVG line/arrow between two points
// ---------------------------------------------------------------------------

interface Point {
  x: number;
  y: number;
}

interface AnimatedArrowProps {
  from: Point;
  to: Point;
  visible: boolean;
  color?: string;
  dashed?: boolean;
  label?: string;
  strokeWidth?: number;
}

export function AnimatedArrow({
  from,
  to,
  visible,
  color = COLORS.neutral,
  dashed = false,
  label,
  strokeWidth = 2,
}: AnimatedArrowProps): JSX.Element {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Calculate arrowhead
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const headLen = 10;
  const arrowA = {
    x: to.x - headLen * Math.cos(angle - Math.PI / 6),
    y: to.y - headLen * Math.sin(angle - Math.PI / 6),
  };
  const arrowB = {
    x: to.x - headLen * Math.cos(angle + Math.PI / 6),
    y: to.y - headLen * Math.sin(angle + Math.PI / 6),
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
        >
          <motion.line
            x1={from.x}
            y1={from.y}
            x2={from.x}
            y2={from.y}
            animate={{ x2: to.x, y2: to.y }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0 }}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashed ? '6 4' : undefined}
          />
          <motion.polygon
            points={`${to.x},${to.y} ${arrowA.x},${arrowA.y} ${arrowB.x},${arrowB.y}`}
            fill={color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          />
          {label && (
            <motion.text
              x={midX}
              y={midY - 8}
              textAnchor="middle"
              fill={color}
              fontSize={11}
              fontFamily="var(--font-sans)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {label}
            </motion.text>
          )}
        </motion.g>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// PulsingDot
// ---------------------------------------------------------------------------

interface PulsingDotProps {
  color?: string;
  size?: number;
  visible: boolean;
  className?: string;
}

export function PulsingDot({
  color = COLORS.container,
  size = 12,
  visible,
  className = '',
}: PulsingDotProps): JSX.Element {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className={`inline-flex items-center justify-center ${className}`}
        >
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// AnimatedCounter
// ---------------------------------------------------------------------------

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  visible: boolean;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 1.5,
  visible,
  className = '',
}: AnimatedCounterProps): JSX.Element {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) {
      setCount(0);
      return;
    }

    let frame: number;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    function animate(now: number): void {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);

    return (): void => {
      cancelAnimationFrame(frame);
    };
  }, [visible, target, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`font-mono tabular-nums ${className}`}
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

type BadgeStatus = 'running' | 'stopped' | 'error' | 'success';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  visible: boolean;
  className?: string;
}

const statusColors: Record<BadgeStatus, string> = {
  running: COLORS.container,
  stopped: COLORS.neutral,
  error: COLORS.error,
  success: COLORS.success,
};

export function StatusBadge({
  status,
  label,
  visible,
  className = '',
}: StatusBadgeProps): JSX.Element {
  const color = statusColors[status];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
          style={{
            backgroundColor: `${color}20`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          <motion.div
            animate={
              status === 'running'
                ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }
                : {}
            }
            transition={
              status === 'running'
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { COLORS };
