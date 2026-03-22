import type { JSX } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { TOPICS, getModuleById, getVisualById } from '@/data/content';
import { useMarkdownContent } from '@/hooks/use-markdown-content';
import { useAppStore } from '@/store/app-store';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { StepControls } from '@/components/step-controls';
import { VisualCanvas } from '@/components/visual-canvas';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MainContent(): JSX.Element {
  const layoutMode = useAppStore((s) => s.layoutMode);
  const currentModuleId = useAppStore((s) => s.currentModuleId);
  const currentVisualId = useAppStore((s) => s.currentVisualId);
  const currentStep = useAppStore((s) => s.currentStep);
  const markVisualCompleted = useAppStore((s) => s.markVisualCompleted);

  const module = currentModuleId ? getModuleById(currentModuleId) : undefined;
  const visual = currentVisualId ? getVisualById(currentVisualId) : undefined;

  const { content: markdownContent, loading: markdownLoading } = useMarkdownContent(
    module?.noteFile ?? '',
  );

  // -----------------------------------------------------------------------
  // Split pane resize
  // -----------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const isDraggingRef = useRef(false);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent): void => {
      e.preventDefault();
      isDraggingRef.current = true;

      const startY = e.clientY;
      const startRatio = splitRatio;
      const container = containerRef.current;
      if (!container) return;

      const containerHeight = container.getBoundingClientRect().height;

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isDraggingRef.current) return;
        const delta = moveEvent.clientY - startY;
        const newRatio = Math.min(Math.max(startRatio + delta / containerHeight, 0.2), 0.8);
        setSplitRatio(newRatio);
      };

      const handleMouseUp = (): void => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [splitRatio],
  );

  // -----------------------------------------------------------------------
  // Completion handler
  // -----------------------------------------------------------------------

  const handleCompleted = useCallback((): void => {
    if (currentVisualId) {
      markVisualCompleted(currentVisualId);
    }
  }, [currentVisualId, markVisualCompleted]);

  // -----------------------------------------------------------------------
  // No visual selected — Welcome screen
  // -----------------------------------------------------------------------

  if (!visual || !module) {
    return <WelcomeScreen />;
  }

  // -----------------------------------------------------------------------
  // Presentation mode — fullscreen, no chrome
  // -----------------------------------------------------------------------

  if (layoutMode === 'presentation') {
    return (
      <div className="flex-1 flex flex-col bg-zinc-950">
        <div className="flex-1 flex items-center justify-center p-8">
          <VisualCanvas visualId={visual.id} step={currentStep} />
        </div>
        <div className="px-4 pb-4">
          <StepControls totalSteps={visual.steps.length} onCompleted={handleCompleted} />
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Notes-only mode
  // -----------------------------------------------------------------------

  if (layoutMode === 'notes') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        <ContentHeader visual={visual} step={currentStep} />
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {markdownLoading ? (
            <div className="text-neutral-500 text-sm">Loading notes...</div>
          ) : markdownContent ? (
            <MarkdownRenderer content={markdownContent} />
          ) : (
            <div className="text-neutral-500 text-sm">
              No notes available for this module yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Split mode
  // -----------------------------------------------------------------------

  if (layoutMode === 'split') {
    return (
      <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        <ContentHeader visual={visual} step={currentStep} />

        {/* Visual canvas — top portion */}
        <div
          className="overflow-hidden flex flex-col"
          style={{ height: `${splitRatio * 100}%` }}
        >
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <VisualCanvas visualId={visual.id} step={currentStep} />
          </div>
          <div className="px-4 pb-2">
            <StepControls totalSteps={visual.steps.length} onCompleted={handleCompleted} />
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="h-1.5 bg-zinc-800 hover:bg-primary/40 cursor-row-resize flex-shrink-0
            transition-colors flex items-center justify-center group"
          onMouseDown={handleResizeStart}
        >
          <div className="w-8 h-0.5 rounded-full bg-neutral-600 group-hover:bg-primary/60" />
        </div>

        {/* Notes panel — bottom portion */}
        <div
          className="overflow-y-auto px-6 py-4"
          style={{ height: `${(1 - splitRatio) * 100}%` }}
        >
          {markdownLoading ? (
            <div className="text-neutral-500 text-sm">Loading notes...</div>
          ) : markdownContent ? (
            <MarkdownRenderer content={markdownContent} />
          ) : (
            <div className="text-neutral-500 text-sm">
              No notes available for this module yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Visual-only mode (default)
  // -----------------------------------------------------------------------

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      <ContentHeader visual={visual} step={currentStep} />

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <VisualCanvas visualId={visual.id} step={currentStep} />
      </div>

      <div className="px-4 pb-4">
        <StepControls totalSteps={visual.steps.length} onCompleted={handleCompleted} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentHeader — shows visual title and step info
// ---------------------------------------------------------------------------

interface ContentHeaderProps {
  visual: { id: string; title: string; steps: { title: string }[] };
  step: number;
}

function ContentHeader({ visual, step }: ContentHeaderProps): JSX.Element {
  const stepTitle = visual.steps[step]?.title;

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
          {visual.id}
        </span>
        <h2 className="text-sm font-semibold text-neutral-200 truncate">{visual.title}</h2>
      </div>
      {stepTitle && (
        <span className="text-xs text-neutral-500 flex-shrink-0 ml-4">
          {stepTitle}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WelcomeScreen — shown when no visual is selected
// ---------------------------------------------------------------------------

function WelcomeScreen(): JSX.Element {
  const navigate = useAppStore((s) => s.navigate);

  const topicSummaries = useMemo(
    () =>
      TOPICS.map((t) => ({
        id: t.id,
        icon: t.icon,
        title: t.title,
        moduleCount: t.modules.length,
        visualCount: t.modules.reduce((sum, m) => sum + m.visuals.length, 0),
        firstModule: t.modules[0],
        firstVisual: t.modules[0]?.visuals[0],
      })),
    [],
  );

  return (
    <div className="flex-1 flex items-center justify-center bg-zinc-950 p-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">Learn</h1>
          <p className="text-neutral-400 text-sm">
            Interactive visual learning guides. Pick a topic to get started.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topicSummaries.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={(): void => {
                if (t.firstVisual && t.firstModule) {
                  navigate(t.id, t.firstModule.id, t.firstVisual.id);
                }
              }}
              disabled={!t.firstVisual}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-white/5
                hover:border-primary/30 hover:bg-zinc-800 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {t.icon}
              </span>
              <span className="text-sm font-medium text-neutral-200">{t.title}</span>
              <span className="text-[10px] text-neutral-500">
                {t.moduleCount} module{t.moduleCount !== 1 ? 's' : ''}
                {t.visualCount > 0 && ` · ${t.visualCount} visual${t.visualCount !== 1 ? 's' : ''}`}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-[11px] text-neutral-600 space-y-1">
          <p>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              ←
            </kbd>
            {' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              →
            </kbd>
            {' '}Navigate steps &nbsp;&middot;&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              1
            </kbd>
            {' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              2
            </kbd>
            {' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              3
            </kbd>
            {' '}Layout modes &nbsp;&middot;&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              f
            </kbd>
            {' '}Fullscreen &nbsp;&middot;&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-neutral-400 font-mono">
              /
            </kbd>
            {' '}Search
          </p>
        </div>
      </div>
    </div>
  );
}
