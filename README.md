# Questline
### Automated quest progression for AI Dungeon

Made by [YOUR NAME HERE]

* * *

## Overview

Questline is an AI Dungeon scripting add-on that keeps long-form adventures on track by automatically managing quest progression.

It updates the current objective, records completed milestones, and creates progress cards as the story advances. Instead of manually editing Story Cards every time the party finds an item, reaches a location, or finishes a quest step, Questline handles that progression for you.

The script is config-driven, so it can be reused across different scenarios by changing a single data object at the top of the script.

Questline is especially useful for:
- multi-step quests
- long adventures with item progression
- event chains that need sequencing
- story structures where AI memory drift normally causes problems

* * *

## Main Features

| Feature | Description |
|---|---|
| Automatic Quest Tracking | Detects quest progress from story output and updates quest state automatically |
| Active Objective Management | Keeps the current lead visible so the AI stays pointed at the right step |
| Milestone Logging | Creates completed event cards as the story advances |
| Config-Driven Design | Reuse the same script engine across multiple scenarios with a simple config object |
| No Manual Card Upkeep | Players do not need to edit quest progress cards by hand |
| Script-Only Install | Lives in `library.js` and works with existing Input / Context / Output wrappers |
| Scenario Flexibility | Works for artifact hunts, investigation arcs, chapter progression, dungeon crawls, and more |

* * *

## Permission

Questline is free to use, modify, and include in personal or published AI Dungeon scenarios.

If you improve it, expand it, or adapt it into something cooler, feel free to share that too.

* * *

## Scenario Script Install Guide

1. Open the AI Dungeon website on desktop
2. Create a new scenario or edit an existing one
3. Open the `DETAILS` tab
4. Scroll down to `Scripting` and toggle `Scripts Enabled`
5. Select `EDIT SCRIPTS`

### Input tab
Leave your existing wrapper as-is:

```js
InnerSelf("input");
const modifier = (text) => {
  return { text };
};
modifier(text);
