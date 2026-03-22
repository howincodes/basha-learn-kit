import type { JSX, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VisualWrapperProps {
  step: number;
  stepDescription?: string;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VisualWrapper({
  step,
  stepDescription,
  children,
}: VisualWrapperProps): JSX.Element {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Main visual area */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
        <div className="w-full max-w-3xl" style={{ minHeight: 320 }}>
          {children}
        </div>
      </div>

      {/* Step description — animated fade at the bottom */}
      <AnimatePresence mode="wait">
        {stepDescription && (
          <motion.div
            key={`step-desc-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0 }}
            className="px-6 pb-4"
          >
            <p className="text-sm text-neutral-400 leading-relaxed text-center max-w-2xl mx-auto">
              {stepDescription}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
