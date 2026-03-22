import type { JSX } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { TOPICS } from '@/data/content';
import { useAppStore } from '@/store/app-store';
import type { LayoutMode, Theme } from '@/store/app-store';
import type { Module, Topic, VisualDef } from '@/types';

// ---------------------------------------------------------------------------
// Tier labels
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<number, string> = {
  1: 'Infrastructure',
  2: 'Frameworks',
  3: 'Data & Processing',
  4: 'DevOps',
};

// ---------------------------------------------------------------------------
// Layout mode options
// ---------------------------------------------------------------------------

const LAYOUT_OPTIONS: { mode: LayoutMode; label: string; icon: string }[] = [
  { mode: 'visual', label: 'Visual', icon: '🖼' },
  { mode: 'split', label: 'Split', icon: '⬛' },
  { mode: 'notes', label: 'Notes', icon: '📝' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTopicVisualCount(topic: Topic): number {
  return topic.modules.reduce((sum, m) => sum + m.visuals.length, 0);
}

function getCompletedCount(topic: Topic, completedVisuals: string[]): number {
  const visualIds = topic.modules.flatMap((m) => m.visuals.map((v) => v.id));
  return visualIds.filter((id) => completedVisuals.includes(id)).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Sidebar(): JSX.Element {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const layoutMode = useAppStore((s) => s.layoutMode);
  const setLayoutMode = useAppStore((s) => s.setLayoutMode);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const currentTopicId = useAppStore((s) => s.currentTopicId);
  const currentModuleId = useAppStore((s) => s.currentModuleId);
  const currentVisualId = useAppStore((s) => s.currentVisualId);
  const completedVisuals = useAppStore((s) => s.completedVisuals);
  const navigate = useAppStore((s) => s.navigate);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(currentTopicId);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(currentModuleId);

  // -----------------------------------------------------------------------
  // Filtering
  // -----------------------------------------------------------------------

  const filteredTopics = useMemo((): Topic[] => {
    if (!searchQuery.trim()) return TOPICS;

    const q = searchQuery.toLowerCase();
    return TOPICS.map((topic) => {
      const topicMatches = topic.title.toLowerCase().includes(q);
      const filteredModules = topic.modules.filter(
        (m) =>
          topicMatches ||
          m.title.toLowerCase().includes(q) ||
          m.visuals.some((v) => v.title.toLowerCase().includes(q)),
      );
      if (topicMatches) return topic;
      if (filteredModules.length === 0) return null;
      return { ...topic, modules: filteredModules };
    }).filter((t): t is Topic => t !== null);
  }, [searchQuery]);

  // Group topics by tier
  const groupedByTier = useMemo((): Map<number, Topic[]> => {
    const map = new Map<number, Topic[]>();
    for (const topic of filteredTopics) {
      const existing = map.get(topic.tier) ?? [];
      existing.push(topic);
      map.set(topic.tier, existing);
    }
    return map;
  }, [filteredTopics]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleTopicClick = useCallback(
    (topicId: string): void => {
      setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
    },
    [],
  );

  const handleModuleClick = useCallback(
    (moduleId: string): void => {
      setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
    },
    [],
  );

  const handleVisualClick = useCallback(
    (topic: Topic, module: Module, visual: VisualDef): void => {
      navigate(topic.id, module.id, visual.id);
      setExpandedTopicId(topic.id);
      setExpandedModuleId(module.id);
    },
    [navigate],
  );

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          key="sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex flex-col h-full bg-zinc-900 border-r border-white/5 overflow-hidden flex-shrink-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h1 className="text-sm font-semibold text-neutral-200 tracking-wide uppercase">
              Learn
            </h1>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-white/5">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M11.5 11.5L14 14M9.5 5.5a4 4 0 11-8 0 4 4 0 018 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={searchInputRef}
                data-sidebar-search
                type="text"
                value={searchQuery}
                onChange={(e): void => setSearchQuery(e.target.value)}
                placeholder="Search topics... ( / )"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-zinc-800 border border-white/5 rounded-lg
                  text-neutral-200 placeholder:text-neutral-500
                  focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20
                  transition-colors"
              />
            </div>
          </div>

          {/* Topic list */}
          <nav className="flex-1 overflow-y-auto py-2" aria-label="Topics">
            {Array.from(groupedByTier.entries()).map(([tier, topics]) => (
              <div key={tier} className="mb-2">
                {/* Tier label */}
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  {TIER_LABELS[tier] ?? `Tier ${tier}`}
                </div>

                {topics.map((topic) => {
                  const isExpanded = expandedTopicId === topic.id;
                  const totalVisuals = getTopicVisualCount(topic);
                  const completed = getCompletedCount(topic, completedVisuals);
                  const progressPct = totalVisuals > 0 ? (completed / totalVisuals) * 100 : 0;

                  return (
                    <div key={topic.id}>
                      {/* Topic row */}
                      <button
                        type="button"
                        onClick={(): void => handleTopicClick(topic.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                          currentTopicId === topic.id
                            ? 'bg-white/5 text-white'
                            : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{topic.icon}</span>
                        <span className="text-sm font-medium flex-1 truncate">{topic.title}</span>

                        {/* Progress bar */}
                        {totalVisuals > 0 && (
                          <div className="w-8 h-1 rounded-full bg-white/10 flex-shrink-0 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-success transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        )}

                        {/* Expand chevron */}
                        <svg
                          className={`w-3 h-3 text-neutral-500 transition-transform duration-200 flex-shrink-0 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 16 16"
                        >
                          <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* Expanded modules */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            {topic.modules.map((mod) => {
                              const isModExpanded = expandedModuleId === mod.id;
                              const hasVisuals = mod.visuals.length > 0;

                              return (
                                <div key={mod.id}>
                                  {/* Module row */}
                                  <button
                                    type="button"
                                    onClick={(): void => handleModuleClick(mod.id)}
                                    className={`w-full flex items-center gap-2 pl-10 pr-4 py-1.5 text-left transition-colors ${
                                      currentModuleId === mod.id
                                        ? 'text-primary'
                                        : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                                  >
                                    <span className="text-xs flex-1 truncate">{mod.title}</span>
                                    {hasVisuals && (
                                      <span className="text-[10px] text-neutral-600">
                                        {mod.visuals.length}v
                                      </span>
                                    )}
                                  </button>

                                  {/* Expanded visuals */}
                                  <AnimatePresence>
                                    {isModExpanded && hasVisuals && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.12 }}
                                        className="overflow-hidden"
                                      >
                                        {mod.visuals.map((visual) => {
                                          const isActive = currentVisualId === visual.id;
                                          const isCompleted = completedVisuals.includes(visual.id);

                                          return (
                                            <button
                                              key={visual.id}
                                              type="button"
                                              onClick={(): void =>
                                                handleVisualClick(topic, mod, visual)
                                              }
                                              className={`w-full flex items-center gap-2 pl-14 pr-4 py-1 text-left transition-colors ${
                                                isActive
                                                  ? 'text-white border-l-2 border-primary bg-primary/5'
                                                  : 'text-neutral-500 hover:text-neutral-300 border-l-2 border-transparent'
                                              }`}
                                            >
                                              {isCompleted && (
                                                <span className="text-success text-[10px] flex-shrink-0">
                                                  ✓
                                                </span>
                                              )}
                                              <span className="text-[11px] truncate">
                                                {visual.id}: {visual.title}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))}

            {filteredTopics.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-neutral-500">
                No topics match &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </nav>

          {/* Footer: Theme toggle + Layout mode */}
          <div className="border-t border-white/5 px-3 py-3 space-y-2">
            {/* Layout mode selector */}
            <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={(): void => setLayoutMode(opt.mode)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors text-center ${
                    layoutMode === opt.mode
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="mr-1">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-neutral-400
                hover:text-neutral-200 transition-colors rounded-lg hover:bg-white/5"
            >
              <ThemeIcon theme={theme} />
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </motion.aside>
      )}

      {/* Collapsed sidebar toggle */}
      {!sidebarOpen && (
        <motion.button
          key="sidebar-toggle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          type="button"
          onClick={toggleSidebar}
          className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-zinc-800 border border-white/10
            text-neutral-300 hover:text-white hover:bg-zinc-700 transition-colors shadow-lg"
          aria-label="Open sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ThemeIcon({ theme }: { theme: Theme }): JSX.Element {
  if (theme === 'dark') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 9.5a5.5 5.5 0 01-7-7A5.5 5.5 0 1013.5 9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
