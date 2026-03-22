import type { JSX, ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualComponentProps {
  step: number;
}

// AI-generated visuals are registered here.
// Do not edit manually — the build-learn-app skill populates this.
const VISUAL_REGISTRY: Record<string, ComponentType<VisualComponentProps>> = {};

function VisualPlaceholder({ visualId }: { visualId: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl">📚</div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-zinc-300 mb-1">{visualId}</h3>
        <p className="text-sm text-zinc-500">Visual not yet generated</p>
      </div>
    </div>
  );
}

interface VisualCanvasProps {
  visualId: string;
  step: number;
}

export function VisualCanvas({ visualId, step }: VisualCanvasProps): JSX.Element {
  const VisualComponent = VISUAL_REGISTRY[visualId];
  return (
    <div className="w-full h-full bg-zinc-950 rounded-xl overflow-hidden p-4">
      <AnimatePresence mode="wait">
        <motion.div key={visualId} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3, type: 'spring', bounce: 0 }} className="w-full h-full">
          {VisualComponent ? <VisualComponent step={step} /> : <VisualPlaceholder visualId={visualId} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
