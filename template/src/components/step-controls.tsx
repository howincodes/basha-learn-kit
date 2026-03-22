import type { JSX } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { useAppStore } from '@/store/app-store';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StepControlsProps {
  totalSteps: number;
  onCompleted?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepControls({ totalSteps, onCompleted }: StepControlsProps): JSX.Element {
  const currentStep = useAppStore((s) => s.currentStep);
  const autoPlay = useAppStore((s) => s.autoPlay);
  const autoPlaySpeed = useAppStore((s) => s.autoPlaySpeed);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const setStep = useAppStore((s) => s.setStep);
  const toggleAutoPlay = useAppStore((s) => s.toggleAutoPlay);

  const isFirst = currentStep === 0;
  const isLast = currentStep >= totalSteps - 1;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -----------------------------------------------------------------------
  // Auto-play timer
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (autoPlay && !isLast) {
      intervalRef.current = setInterval(() => {
        nextStep(totalSteps);
      }, autoPlaySpeed);
    }

    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoPlay, autoPlaySpeed, isLast, nextStep, totalSteps]);

  // Stop auto-play when reaching the last step
  useEffect(() => {
    if (isLast && autoPlay) {
      toggleAutoPlay();
    }
  }, [isLast, autoPlay, toggleAutoPlay]);

  // -----------------------------------------------------------------------
  // Mark completed when reaching last step
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (isLast && onCompleted) {
      onCompleted();
    }
  }, [isLast, onCompleted]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handlePrev = useCallback((): void => {
    prevStep();
  }, [prevStep]);

  const handleNext = useCallback((): void => {
    nextStep(totalSteps);
  }, [nextStep, totalSteps]);

  const handleRestart = useCallback((): void => {
    setStep(0);
  }, [setStep]);

  const handleDotClick = useCallback(
    (index: number): void => {
      setStep(index);
    },
    [setStep],
  );

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-zinc-800 rounded-xl">
      {/* Left: Back + Step info */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className="px-2.5 py-1 text-sm font-medium rounded-lg transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed
            text-neutral-300 hover:bg-white/10 hover:text-white"
          aria-label="Previous step"
        >
          &#9664;
        </button>

        <span className="text-xs text-neutral-400 font-mono tabular-nums min-w-[80px] text-center">
          Step {currentStep + 1} of {totalSteps}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={isLast}
          className="px-2.5 py-1 text-sm font-medium rounded-lg transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed
            text-neutral-300 hover:bg-white/10 hover:text-white"
          aria-label="Next step"
        >
          &#9654;
        </button>
      </div>

      {/* Center: Progress dots */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={(): void => handleDotClick(i)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === currentStep
                ? 'bg-primary scale-125'
                : i < currentStep
                  ? 'bg-primary/50'
                  : 'bg-neutral-600 hover:bg-neutral-500'
            }`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Right: Auto-play + Restart */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAutoPlay}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-sm rounded-lg transition-colors ${
            autoPlay
              ? 'bg-primary/20 text-primary'
              : 'text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
          aria-label={autoPlay ? 'Pause auto-play' : 'Start auto-play'}
        >
          {autoPlay && (
            <motion.span
              className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          {autoPlay ? '⏸' : '▶▶'}
        </button>

        <button
          type="button"
          onClick={handleRestart}
          className="px-2.5 py-1 text-sm text-neutral-400 rounded-lg transition-colors
            hover:bg-white/10 hover:text-white"
          aria-label="Restart visual"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}
