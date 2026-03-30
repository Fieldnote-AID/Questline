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

### UPDATE - SIDE QUESTS

- Questline now allows for non linear side quests in addition to the above.

Questline is **config-driven**. You reuse the same engine across different scenarios by editing one data object near the top of the script.

---

## What Questline Does

Questline manages quest progression through script-controlled Story Cards.

It automatically:
- keeps the **current quest lead** visible
- tracks which quest steps are complete
- creates a **standalone active quest card** for the current step
- creates **completed milestone cards**
- advances the active step when either **player input** or **AI output** indicates success
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
  Detects when a quest step is completed from either player text or story output.

- **Active objective management**  
  Keeps the current quest lead in front of the AI through a pinned Story Card.

- **Active quest card creation**  
  Creates a standalone Story Card for the newly active quest step.

- **Milestone logging**  
  Creates a Story Card for each completed event.

- **Config-driven design**  
  Reuse the same script engine for different scenarios.

- **Minimal maintenance**  
  Players do not need to manually update progress cards.

- **Flexible install**  
  Works with Inner Self, but does not require Inner Self.

- **Long-form friendly**  
  Helps stabilize adventures that need sequencing and continuity.

---

## How It Works

Questline checks only the **current active quest step**.

Each turn, it can scan:
- **player input**
- **AI-generated output**

When the current step is matched, Questline:

1. marks the step complete
2. updates the quest progress card
3. updates the current quest lead card
4. updates or creates the completed milestone card
5. creates or updates the next active quest card
6. advances to the next configured step

This means the AI keeps seeing the current quest objective without the player needing to manually manage progression cards.

---

## Recommended Memory Setup

Questline works best when the rest of your memory setup stays lean.

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
- active quest cards
- completed milestone cards
- the current quest lead

That split gives Questline the best chance of keeping the story moving cleanly.

---

## Scenario Script Install Guide

Use the AI Dungeon website on PC (or view as desktop if mobile-only).

Questline can be installed in **two ways**:

- **Standalone** — for scenarios that are not using Inner Self
- **Add-on to Inner Self** — for scenarios that already use Inner Self

---

## Standalone Install

Use this version if your scenario is **not** already using Inner Self.

### Step 1: Open your scenario
1. Create a new scenario or edit an existing scenario
2. Open the `DETAILS` tab at the top while editing your scenario
3. Scroll down to `Scripting` and toggle ON → `Scripts Enabled`
4. Select `EDIT SCRIPTS`

### Step 2: Set up the Input tab
1. Select the **Input** tab on the left
2. Delete all code within said tab
3. Copy and paste the following code into your empty Input tab:

```js
// Your "Input" tab should look like this
const modifier = (text) => {
  try { text = QuestDirectorHooks.input(text); } catch (e) {}
  // Any other input modifier scripts can go here
  return { text };
};
modifier(text);
