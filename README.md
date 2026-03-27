# Questline
### Automated quest progression for AI Dungeon

Questline is a plug-in quest director for AI Dungeon. It keeps long-form adventures on track by automatically tracking milestones, updating the current objective, and creating quest progress cards as the story advances.

Instead of manually editing Story Cards every time the party finds an item, completes a step, or moves to the next chapter, Questline handles that progression for you.

It is designed for scenarios where AI memory drift causes problems with:
- multi-step quests
- item hunts
- chapter sequencing
- event chains
- travel arcs
- long-form story continuity

Questline is **config-driven**. You reuse the same engine across different scenarios by editing one data object at the top of the script.

---

## What Questline Does

Questline manages quest progression through script-controlled Story Cards.

It automatically:
- keeps the **current quest lead** visible
- tracks which quest steps are complete
- creates completed milestone cards
- advances the active step when the story output indicates success
- reduces the amount of manual card maintenance needed during long adventures

It is especially useful when you want:
- the AI to stay pointed at the current plot
- the story to remember what was already completed
- event progression without hand-editing cards every few turns

---

## What Questline Does *Not* Do

Questline is not meant to replace your whole scenario setup.

You should still manage these manually:
- Plot Essentials
- Story Summary
- character cards
- major world cards
- tone / style instructions
- author notes

Questline should be the source of truth for **quest progression**, not for the entire world state.

---

## Main Features

- **Automatic quest tracking**  
  Detects when a quest step is completed from story output.

- **Active objective management**  
  Keeps the current quest lead in front of the AI through a pinned Story Card.

- **Milestone logging**  
  Creates a Story Card for each completed event.

- **Config-driven design**  
  Reuse the same script engine for different scenarios.

- **Minimal maintenance**  
  Players do not need to manually update progress cards.

- **Flexible install**  
  Works as a standalone AI Dungeon script or alongside existing frameworks like Inner Self.

- **Long-form friendly**  
  Helps stabilize adventures that need sequencing and continuity.

---

## How It Works

Questline runs during the **output** phase.

Each turn, it:

1. checks the current active quest step
2. reads the latest AI-generated text
3. checks that text for signals that the active step was completed
4. marks the step complete if matched
5. updates the quest progress card
6. updates the current quest lead card
7. creates a completed event card
8. advances to the next configured step

This means the AI keeps seeing the current quest objective without the player needing to manually manage progression cards.

---
### Start the scenario with the first trigger already seeded

Questline works best when the story opening already names or points toward the **first active event**.

For example, if the first quest step is:

- `First Key — House of Borrowed Memories`

then the opener should already include something like:

> The gold-bound book opens and reveals the first page: the House of Borrowed Memories.

This helps in three ways:
- it puts the first destination into context immediately
- it aligns the story text with the script’s first active event
- it gives the AI a concrete place to move toward from turn one

Best practice:
- **seed the first event in the opening**
- **do not mark it complete in the opening**

The opening should establish the first lead, not finish the first step.

## Recommended Memory Setup

Questline works best when the rest of your memory setup stays lean.

### Plot Essentials
Use for:
- core protagonist facts
- relationship state
- always-relevant world truths
- the fact that the quest exists

Do **not** use Plot Essentials to track step-by-step quest progress.

### Story Summary
Use for:
- broad backstory
- major prior arcs
- how the current scenario began

Do **not** rely on Story Summary for live quest state.

### Story Cards
Use for:
- character cards
- world cards
- script-managed quest cards
- completed milestone cards
- the active quest lead

That split gives Questline the best chance of keeping the story moving cleanly.

---

## Install Guide

Questline can run in two ways.

---

### Option 1: Add-on install for Inner Self or another existing wrapper

If your scenario already uses a script framework like **Inner Self**, you usually do **not** need to change your Input / Context / Output tabs.

#### Steps
1. Open your scenario
2. Go to `DETAILS` → `Scripting`
3. Enable scripts
4. Open `EDIT SCRIPTS`
5. Open the `Library` tab
6. Paste the Questline code near the end of your existing `library.js`
7. Edit the `QUEST_CONFIG` object
8. Save

Questline will hook into the existing wrapper automatically.

---

### Option 2: Standalone install (no other scripts)

If you are **not** using Inner Self or any other scripting framework, the `Library` tab alone is **not enough**.

AI Dungeon only runs active code from the Input / Context / Output tabs. The Library tab is shared code storage. So Questline needs a small wrapper in the **Output** tab.

#### Library tab
Paste the full Questline script into the `Library` tab.

#### Output tab
Paste this:

```js
const modifier = (text) => {
  try { QuestDirector.run("output"); } catch (e) {}
  return { text };
};
modifier(text);
