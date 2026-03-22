import type { Topic } from '@/types';

// AI-generated content registry. Do not edit manually.
// The build-learn-app skill populates this based on codebase analysis.
export const TOPICS: Topic[] = [];

// Lookup helpers
const topicMap = new Map<string, Topic>();
const moduleMap = new Map<string, { module: any; topic: Topic }>();
const visualMap = new Map<string, { visual: any; module: any }>();

function rebuildMaps(): void {
  topicMap.clear(); moduleMap.clear(); visualMap.clear();
  for (const topic of TOPICS) {
    topicMap.set(topic.id, topic);
    for (const mod of topic.modules) {
      moduleMap.set(mod.id, { module: mod, topic });
      for (const vis of mod.visuals) {
        visualMap.set(vis.id, { visual: vis, module: mod });
      }
    }
  }
}
rebuildMaps();

export function getTopicById(id: string) { return topicMap.get(id); }
export function getModuleById(id: string) { return moduleMap.get(id)?.module; }
export function getVisualById(id: string) { return visualMap.get(id)?.visual; }
export function getTopicByModuleId(id: string) { return moduleMap.get(id)?.topic; }
