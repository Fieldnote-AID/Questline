# Questline

Automated quest progression for AI Dungeon.

Questline is a config-driven quest director for AI Dungeon. It tracks quest progression through Story Cards, keeps the current objective visible, and updates quest state when either player input or AI output shows that a step has advanced.

The current version supports:

- multiple linear questlines at the same time
- per-chain startup behavior
- optional side quests that can activate independently
- automatic quest progress and lead cards
- InnerSelf compatibility without extra hook changes when pasted below InnerSelf

Instead of hand-editing Story Cards every time a chapter advances, a key item is claimed, or a side objective wakes up, Questline updates the relevant cards for you.

---

## What Questline Does

Questline manages quest progression through script-controlled Story Cards.

It automatically:

- keeps a pinned **Quest Progress** card updated
- keeps a pinned **Current Quest Lead** card updated
- tracks multiple **linear questlines** independently
- tracks **active** and **completed** side quests
- creates or updates a Story Card for each active quest step
- creates or updates a completed quest card when a step finishes
- advances linear questlines in order
- lets either **player input** or **AI output** trigger quest updates

It is especially useful when you want:

- long-form quest continuity
- optional quest branches
- multiple structured questlines in one scenario
- fewer manual Story Card edits during play

---

## What Questline Does Not Do

Questline is not meant to replace your entire memory setup.

You should still manage these manually:

- Plot Essentials
- Story Summary
- character cards
- major world cards
- tone and style instructions
- Author's Note

Questline should be your source of truth for **quest progression**, not for the whole world state.

---

## Core Model

Questline supports two quest types:

### 1. Linear questlines

Use these for ordered progression like:

- main story arcs
- guild questlines
- investigation chains
- chapter sequences
- route-specific progression

Each linear quest step uses:

- `track: "linear"`
- `chain: "main"` or another chain id
- `order: 1, 2, 3...`

Each linear chain has its own:

- current step
- current lead
- completion state
- startup behavior

### 2. Side quests

Use these for optional objectives that can activate independently of the linear chains.

Each side quest uses:

- `track: "side"`
- `activationTerms` and/or `activationRegex`
- optional mid-stage matching
- completion matching

Side quests can start, progress, and complete without interrupting the linear chains.

---

## Startup Behavior

Each linear chain is configured under `QUEST_CONFIG.linearTracks`.

Example:

```js
linearTracks: {
  main: {
    label: "Main Quest",
    autoStart: true,
    initialLead: "A first clue points toward the opening step of a larger quest.",
    inactiveLead: "A first clue points toward the opening step of a larger quest.",
    completeLead: "The main quest is complete."
  },
  guild: {
    label: "Guild Questline",
    autoStart: false,
    initialLead: "No guild lead is active yet.",
    inactiveLead: "No guild lead is active yet.",
    completeLead: "The guild questline is complete."
  }
}
```

### If `autoStart: true`

The first step in that chain starts automatically during scenario kickoff or refresh.

### If `autoStart: false`

That chain stays inactive until it is started by one of these:

- the first step's `activationTerms` or `activationRegex`
- `QuestDirector.startChain("chainId")`
- `QuestDirector.start("questId")` for that chain's current step

This is the main behavior change from the older single-chain version.

---

## Backward Compatibility

Older configs still work.

If you use:

```js
track: "main"
```

Questline treats it as:

```js
track: "linear",
chain: "main"
```

That makes it easier to migrate older scenarios without rewriting everything at once.

---

## Matching Model

Questline can evaluate both:

- player input
- AI-generated output

It checks quest text using:

- explicit regex matches
- keyword matches
- proximity matches between verbs and quest terms
- negative guards to avoid false completions like "almost", "not yet", or "still hidden"

For side quests, the general flow is:

- inactive -> started
- started -> mid
- mid -> completed

For linear questlines, only the **current step** in that chain can progress.

---

## What the Cards Show

Questline maintains two pinned cards:

### Quest Progress

Shows:

- each linear questline and its completion status
- completed steps per chain
- active side quests
- completed side quests

### Current Quest Lead

Shows:

- the current lead for each linear chain
- inactive-chain lead text when a chain has not started yet
- complete-chain lead text when a chain has finished
- currently active side quest leads

Questline also creates or updates step cards for active and completed quests.

---

## Minimal Config Shape

```js
const QUEST_CONFIG = {
  stateKey: "HybridQuestDirector_Template",
  cardType: "class",

  progressCard: {
    title: "Quest Progress",
    keys: "quest progress, active quest, objective tracker, milestone tracker"
  },

  leadCard: {
    title: "Current Quest Lead",
    keys: "current quest lead, active objective, next objective, current objective"
  },

  progressLabels: {
    linearTracks: "Linear questlines",
    activeSideQuests: "Active side quests",
    completedSideQuests: "Completed side quests"
  },

  linearTracks: {
    main: {
      label: "Main Quest",
      autoStart: true,
      initialLead: "A first clue points toward the opening step of a larger quest.",
      inactiveLead: "A first clue points toward the opening step of a larger quest.",
      completeLead: "The main quest is complete."
    }
  },

  events: [
    {
      id: "main_step_1",
      track: "linear",
      chain: "main",
      mode: "linear",
      order: 1,
      title: "Main Quest — First Objective",
      shortTitle: "First Objective",
      keys: "first objective, main quest step 1",
      startEntry: "The first objective is now in play.",
      leadEntry: "Reach the first objective and learn what it means.",
      midEntry: "The first objective is real, but more complicated than it looked.",
      midLead: "Push deeper and finish the first objective.",
      completionEntry: "The first objective was completed.",
      nextLead: "A new lead points toward the second objective.",
      activationTerms: ["first objective"],
      midTerms: ["clue", "partial answer"],
      locationTerms: ["vault", "ruins"],
      completionTerms: ["found", "claimed", "completed"],
      keyTerms: ["first objective", "target"],
      completionRegex: [
        /\b(the first objective was completed|the target was secured)\b/i
      ]
    },
    {
      id: "side_missing_scout",
      track: "side",
      mode: "oneoff",
      title: "Side Quest — The Missing Scout",
      shortTitle: "The Missing Scout",
      keys: "missing scout, lost scout, vanished scout",
      activationEntry: "Rumors spread that a scout vanished near the frontier.",
      startEntry: "A missing scout may still be alive.",
      leadEntry: "Track down the missing scout and learn what happened.",
      midEntry: "The scout's trail reveals signs of struggle.",
      midLead: "Follow the broken trail and uncover the truth.",
      completionEntry: "The truth of the missing scout has been uncovered.",
      activationTerms: ["missing scout", "lost scout"],
      midTerms: ["trail", "tracks", "camp"],
      locationTerms: ["forest", "outpost", "camp"],
      completionTerms: ["found", "rescued", "uncovered"],
      keyTerms: ["missing scout", "scout"],
      completionRegex: [
        /\b(the missing scout was found|the scout's fate was uncovered)\b/i
      ]
    }
  ]
};
```

---

## Install Guide

Use the AI Dungeon website on desktop if possible.

Questline can be installed in two ways:

- **Standalone** — for scenarios not using InnerSelf
- **Add-on to InnerSelf** — for scenarios already using InnerSelf

### Standalone install

If your scenario is **not** using InnerSelf:

#### 1. Input tab

```js
const modifier = (text) => {
  try { text = QuestDirectorHooks.input(text); } catch (e) {}
  return { text };
};
modifier(text);
```

#### 2. Output tab

```js
const modifier = (text) => {
  try { text = QuestDirectorHooks.output(text); } catch (e) {}
  return { text };
};
modifier(text);
```

#### 3. Library tab

Paste the Questline library code into your scenario library and edit `QUEST_CONFIG` only.

### InnerSelf install

If your scenario **already uses InnerSelf**:

- paste Questline **below InnerSelf** in your library
- do not add extra hook changes

Questline will integrate automatically when installed that way.

---

## Recommended Authoring Practices

### Keep the rest of memory lean

Questline works best when Plot Essentials and Story Summary are not overloaded with live quest state.

### Use the opener for fiction, not for forced completions

If a chain uses `autoStart: true`, the first step starts automatically.

That means your opener should:

- establish the first lead naturally
- point the player toward the first destination or problem
- avoid phrasing that accidentally sounds like the first step is already complete

If a chain uses `autoStart: false`, your opener can either:

- leave the chain dormant
- mention the trigger terms that wake it up
- let the player activate it later through play

### Prefer explicit completion language for important steps

Regex and term matching are flexible, but clearer completion language reduces false positives and false negatives.

### Separate permanent world truth from quest state

Use Questline cards for quest state.
Use your normal scenario memory tools for enduring world information.

---

## Manual Controls

Questline exposes optional manual controls:

```js
QuestDirector.start("questId")
QuestDirector.progress("questId")
QuestDirector.complete("questId")
QuestDirector.mark("questId")
QuestDirector.startChain("chainId")
QuestDirector.refresh()
QuestDirector.reset()
```

Useful when you want to:

- start an optional route manually
- force a step to advance
- reset quest state during testing

---

## Migration Notes

If you are upgrading from the older single-main-chain version:

- change ordered main steps from `track: "main"` to `track: "linear"` plus `chain: "main"` when convenient
- add `linearTracks` to control per-chain startup and lead behavior
- move optional routes into their own linear chains instead of trying to fake everything inside one main chain
- keep side quests on `track: "side"`

Older `track: "main"` configs still work, but the new structure is more expressive and easier to extend.

---

## Repository Use

Edit `QUEST_CONFIG` only.

That is the intended surface area for reuse across scenarios.

