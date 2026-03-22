import type { JSX } from 'react';
import { useEffect } from 'react';

import { TOPICS } from '@/data/content';
import { useAppStore } from '@/store/app-store';
import type { LayoutMode } from '@/store/app-store';
import { Sidebar } from '@/components/sidebar';
import { MainContent } from '@/components/main-content';

// ---------------------------------------------------------------------------
// Layout mode key mapping
// ---------------------------------------------------------------------------

const LAYOUT_KEY_MAP: Record<string, LayoutMode> = {
  '1': 'visual',
  '2': 'split',
  '3': 'notes',
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App(): JSX.Element {
  const theme = useAppStore((s) => s.theme);
  const layoutMode = useAppStore((s) => s.layoutMode);
  const currentVisualId = useAppStore((s) => s.currentVisualId);

  const navigate = useAppStore((s) => s.navigate);
  const prevStep = useAppStore((s) => s.prevStep);
  const nextStep = useAppStore((s) => s.nextStep);
  const setLayoutMode = useAppStore((s) => s.setLayoutMode);
  const toggleAutoPlay = useAppStore((s) => s.toggleAutoPlay);

  // -----------------------------------------------------------------------
  // Resolve current visual step count for nextStep()
  // -----------------------------------------------------------------------

  const currentVisualStepCount = useAppStore((s) => {
    if (!s.currentVisualId) return 0;
    for (const topic of TOPICS) {
      for (const mod of topic.modules) {
        const visual = mod.visuals.find((v) => v.id === s.currentVisualId);
        if (visual) return visual.steps.length;
      }
    }
    return 0;
  });

  // -----------------------------------------------------------------------
  // Default navigation — first topic, first module, first visual on load
  // -----------------------------------------------------------------------

  useEffect(() => {
    const state = useAppStore.getState();
    if (!state.currentVisualId) {
      const firstTopic = TOPICS[0];
      const firstModule = firstTopic?.modules[0];
      const firstVisual = firstModule?.visuals[0];
      if (firstTopic && firstModule && firstVisual) {
        navigate(firstTopic.id, firstModule.id, firstVisual.id);
      }
    }
  }, [navigate]);

  // -----------------------------------------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------------------------------------

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      // Ignore when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to blur out of inputs
        if (e.key === 'Escape') {
          target.blur();
          return;
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (currentVisualStepCount > 0) {
            nextStep(currentVisualStepCount);
          }
          break;

        case '1':
        case '2':
        case '3': {
          const mode = LAYOUT_KEY_MAP[e.key];
          if (mode) {
            setLayoutMode(mode);
          }
          break;
        }

        case 'f':
          setLayoutMode(
            layoutMode === 'presentation' ? 'visual' : 'presentation',
          );
          break;

        case ' ':
          e.preventDefault();
          if (currentVisualId) {
            toggleAutoPlay();
          }
          break;

        case 'Escape':
          if (layoutMode === 'presentation') {
            setLayoutMode('visual');
          }
          break;

        case '/':
          e.preventDefault();
          // Focus the sidebar search input
          const searchInput = document.querySelector<HTMLInputElement>(
            '[data-sidebar-search]',
          );
          if (searchInput) {
            searchInput.focus();
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    prevStep,
    nextStep,
    setLayoutMode,
    toggleAutoPlay,
    layoutMode,
    currentVisualId,
    currentVisualStepCount,
  ]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className={`${theme} h-screen w-screen flex overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-950 text-neutral-200' : 'bg-white text-zinc-900'
      }`}
    >
      {layoutMode !== 'presentation' && <Sidebar />}
      <MainContent />
    </div>
  );
}
