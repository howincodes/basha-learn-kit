# basha-learn-kit

AI-powered interactive learning app generator for any codebase. Turn your project into a visual, animated learning experience for your team.

Built by [@farisbasha](https://github.com/farisbasha)

## What It Does

Give it any codebase. An AI agent (Claude Code) will:

1. Analyze your project — architecture, tech stack, patterns, business logic
2. Ask you what to cover and how deep to go
3. Generate interactive markdown learning notes
4. Generate animated SVG visual diagrams
5. Scaffold a React app with sidebar navigation, step-through controls, and progress tracking

The result is a local learning app your team can use to understand the codebase visually.

## Quick Start

### 1. Copy the skill to your project

```bash
# Option A: Download the skill directory
mkdir -p .claude/skills/build-learn-app
curl -o .claude/skills/build-learn-app/SKILL.md \
  https://raw.githubusercontent.com/howincodes/basha-learn-kit/main/skill/build-learn-app/SKILL.md

# Option B: Clone and copy
git clone https://github.com/howincodes/basha-learn-kit.git /tmp/learn-kit
cp -r /tmp/learn-kit/skill/build-learn-app .claude/skills/
```

### 2. Run it with Claude Code

```bash
claude
> /build-learn-app
```

Claude will ask you calibration questions, then autonomously generate the entire learning app.

### 3. Start the learning app

```bash
cd learning/app  # or wherever the app was scaffolded
npm install
npm run dev
# Open http://localhost:5200
```

## What Gets Generated

```
your-project/
├── .claude/skills/build-learn-app.md   ← The skill (you added this)
├── learning/
│   ├── app/                            ← React learning app (generated)
│   │   ├── src/
│   │   │   ├── components/visuals/     ← Animated SVG diagrams
│   │   │   ├── data/content.ts         ← Topic/module/visual registry
│   │   │   └── ...
│   │   └── package.json
│   └── notes/                          ← Markdown learning notes (generated)
│       ├── architecture/
│       ├── database/
│       └── ...
└── src/                                ← Your actual project code
```

## Calibration Options

The skill asks 6 questions before generating:

| Question | Options |
|----------|---------|
| **What to cover** | Full stack, specific features, new tech, architecture, custom |
| **Depth level** | Surface (5-10 visuals), working knowledge (10-20), deep internals (20+) |
| **End user** | Junior dev, mid-level joining team, senior dev |
| **Visual density** | Key concepts only, comprehensive, maximum |
| **Existing docs** | Yes (render them), No (generate from code), Partial (supplement) |
| **App location** | Default: `./learning/app/` |

## Reusable Visual Templates

The template includes 8 data-driven visual components so the AI doesn't need to write custom SVG for every diagram:

| Template | Use Case |
|----------|----------|
| `<FlowDiagram>` | Architecture diagrams, data flows |
| `<ComparisonTable>` | A vs B comparisons |
| `<LayerStack>` | Docker layers, network stacks |
| `<StateMachine>` | Job lifecycles, state transitions |
| `<Pipeline>` | Middleware chains, CI/CD flows |
| `<TerminalOutput>` | CLI walkthroughs |
| `<Timeline>` | Event sequences, request traces |
| `<ArchitectureDiagram>` | Service architecture layouts |

The AI uses these templates with project-specific data, and falls back to custom SVG for unique visuals.

## Tech Stack

The generated app uses:

- **React 19** + **TypeScript** (strict mode)
- **Vite** for dev server and builds
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Shiki** for syntax highlighting
- **Zustand** for state management (with localStorage persistence)
- **react-markdown** for rendering notes

## Features

- Dark/light theme
- 4 layout modes: Visual, Split, Notes-only, Presentation
- Keyboard shortcuts (arrow keys, space for auto-play, 1/2/3 for modes)
- Step-through animated visuals with auto-play
- Progress tracking (persisted to localStorage)
- Full-text search across notes
- Syntax-highlighted code blocks with copy button
- Responsive design

## License

MIT
