import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'dark' | 'light';
export type LayoutMode = 'visual' | 'split' | 'notes' | 'presentation';

export interface AppState {
  // Appearance
  theme: Theme;
  layoutMode: LayoutMode;
  sidebarOpen: boolean;

  // Navigation
  currentTopicId: string | null;
  currentModuleId: string | null;
  currentVisualId: string | null;
  currentStep: number;

  // Playback
  autoPlay: boolean;
  autoPlaySpeed: number;

  // Progress
  completedVisuals: string[];
  lastViewed: Record<string, string>; // topicId -> visualId

  // Search
  searchQuery: string;
}

export interface AppActions {
  // Appearance
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleSidebar: () => void;

  // Navigation
  navigate: (topicId: string, moduleId: string, visualId: string) => void;
  setStep: (step: number) => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;

  // Playback
  toggleAutoPlay: () => void;
  setAutoPlaySpeed: (ms: number) => void;

  // Progress
  markVisualCompleted: (visualId: string) => void;

  // Search
  setSearchQuery: (query: string) => void;
}

export type AppStore = AppState & AppActions;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const INITIAL_STATE: AppState = {
  theme: 'dark',
  layoutMode: 'visual',
  sidebarOpen: true,

  currentTopicId: null,
  currentModuleId: null,
  currentVisualId: null,
  currentStep: 0,

  autoPlay: false,
  autoPlaySpeed: 4000,

  completedVisuals: [],
  lastViewed: {},

  searchQuery: '',
};

// ---------------------------------------------------------------------------
// Keys persisted to localStorage — everything else is transient.
// ---------------------------------------------------------------------------

type PersistedKeys = 'theme' | 'layoutMode' | 'completedVisuals' | 'lastViewed';

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      // -- Appearance -------------------------------------------------------

      setTheme: (theme: Theme): void => {
        set({ theme });
      },

      toggleTheme: (): void => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        }));
      },

      setLayoutMode: (mode: LayoutMode): void => {
        set({ layoutMode: mode });
      },

      toggleSidebar: (): void => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      // -- Navigation -------------------------------------------------------

      navigate: (
        topicId: string,
        moduleId: string,
        visualId: string,
      ): void => {
        set((state) => ({
          currentTopicId: topicId,
          currentModuleId: moduleId,
          currentVisualId: visualId,
          currentStep: 0,
          autoPlay: false,
          lastViewed: { ...state.lastViewed, [topicId]: visualId },
        }));
      },

      setStep: (step: number): void => {
        set({ currentStep: Math.max(0, step) });
      },

      nextStep: (totalSteps: number): void => {
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, totalSteps - 1),
        }));
      },

      prevStep: (): void => {
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        }));
      },

      // -- Playback ---------------------------------------------------------

      toggleAutoPlay: (): void => {
        set((state) => ({ autoPlay: !state.autoPlay }));
      },

      setAutoPlaySpeed: (ms: number): void => {
        set({ autoPlaySpeed: ms });
      },

      // -- Progress ---------------------------------------------------------

      markVisualCompleted: (visualId: string): void => {
        set((state) => {
          if (state.completedVisuals.includes(visualId)) {
            return state;
          }
          return {
            completedVisuals: [...state.completedVisuals, visualId],
          };
        });
      },

      // -- Search -----------------------------------------------------------

      setSearchQuery: (query: string): void => {
        set({ searchQuery: query });
      },
    }),
    {
      name: 'learn-app-state',
      partialize: (state): Pick<AppState, PersistedKeys> => ({
        theme: state.theme,
        layoutMode: state.layoutMode,
        completedVisuals: state.completedVisuals,
        lastViewed: state.lastViewed,
      }),
    },
  ),
);
