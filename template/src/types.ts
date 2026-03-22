export type LayoutMode = 'visual' | 'split' | 'notes' | 'presentation';
export type Theme = 'dark' | 'light';

export interface Topic {
  id: string;
  title: string;
  tier: number;
  icon: string; // emoji
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  topicId: string;
  noteFile: string; // relative path from learning/foundations/
  visuals: VisualDef[];
}

export interface VisualDef {
  id: string;
  title: string;
  moduleId: string;
  steps: StepDef[];
}

export interface StepDef {
  title: string;
  description: string;
}

export interface ProgressState {
  completedVisuals: Set<string>;
  lastViewed: Record<string, string>; // topicId -> visualId
}
