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

## Recommended Memory Setup
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

## Scenario Script Install Guide

Use the AI Dungeon website on PC (or view as desktop if mobile-only).

Questline can be installed in **two ways**:

- **Standalone** — for scenarios that are not using any other scripts
- **Add-on to Inner Self** — for scenarios that already use Inner Self

---

## Standalone Install

Use this version if your scenario is **not** already using Inner Self or another scripting framework.

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
  // Any other input modifier scripts can go here
  return { text };
};
modifier(text);
```

### Step 3: Set up the Context tab
1. Select the **Context** tab on the left
2. Delete all code within said tab
3. Copy and paste the following code into your empty Context tab:

```js
// Your "Context" tab should look like this
const modifier = (text) => {
  // Any other context modifier scripts can go here
  return { text, stop };
};
modifier(text);
```

### Step 4: Set up the Output tab
1. Select the **Output** tab on the left
2. Delete all code within said tab
3. Copy and paste the following code into your empty Output tab:

```js
// Your "Output" tab should look like this
const modifier = (text) => {
  try { QuestDirector.run("output"); } catch (e) {}
  // Any other output modifier scripts can go here
  return { text };
};
modifier(text);
```

### Step 5: Set up the Library tab
1. Select the **Library** tab on the left
2. Delete all code within said tab
3. Open the Questline **Library code** in a new browser tab
4. Copy the full code from that page
5. Paste it into your empty Library tab
6. Edit the `QUEST_CONFIG` object near the top of the Questline block
7. Click the big yellow `SAVE` button in the top right corner

And you're done!

All adventures played from your scenario will now include Questline.

---

## Install as an Add-on to Inner Self

Use this version if your scenario **already uses Inner Self**.

### Step 1: Open your scenario
1. Create a new scenario or edit an existing scenario
2. Open the `DETAILS` tab at the top while editing your scenario
3. Scroll down to `Scripting` and toggle ON → `Scripts Enabled`
4. Select `EDIT SCRIPTS`

### Step 2: Keep your existing Input tab
1. Select the **Input** tab on the left
2. Leave your existing Inner Self wrapper in place

Your Input tab should look like this:

```js
// Your "Input" tab should look like this
InnerSelf("input");
const modifier = (text) => {
  // Any other input modifier scripts can go here
  return { text };
};
modifier(text);
```

### Step 3: Keep your existing Context tab
1. Select the **Context** tab on the left
2. Leave your existing Inner Self wrapper in place

Your Context tab should look like this:

```js
// Your "Context" tab should look like this
InnerSelf("context");
const modifier = (text) => {
  // Any other context modifier scripts can go here
  return { text, stop };
};
modifier(text);
```

### Step 4: Keep your existing Output tab
1. Select the **Output** tab on the left
2. Leave your existing Inner Self wrapper in place

Your Output tab should look like this:

```js
// Your "Output" tab should look like this
InnerSelf("output");
const modifier = (text) => {
  // Any other output modifier scripts can go here
  return { text };
};
modifier(text);
```

### Step 5: Add Questline to the Library tab
1. Select the **Library** tab on the left
2. Keep your existing Inner Self library code
3. Paste the Questline code near the end of `library.js`
4. Edit the `QUEST_CONFIG` object near the top of the Questline block
5. Click the big yellow `SAVE` button in the top right corner

And you're done!

All adventures played from your scenario will now include Questline alongside Inner Self.

---

## Important Setup Note

Questline works best when the **story opener already seeds the first active event**.

If your first quest step is something like:

- `First Key — House of Borrowed Memories`

then the opening should already mention that place directly.

Good example:

> The gold-bound book opens and reveals the first page: the House of Borrowed Memories.

Best practice:
- seed the first event in the opener
- do **not** complete it in the opener

This aligns the story text with Questline’s first active step and gives the AI a concrete destination from turn one.

---

## After Installing

You should still manage these manually:
- AI Instructions
- Story Summary
- Plot Essentials
- Author’s Note
- character cards
- world cards

Questline should manage:
- current quest lead
- quest progress
- completed milestone cards

---

## Notes

- If you are using Questline by itself, the **Output** tab wrapper is required.
- If you are already using Inner Self, leave the Input / Context / Output wrappers alone and only add Questline to `library.js`.
- You generally should **not** manually pre-create quest progression cards if Questline is managing them.
- Questline works best when event names and leads are concrete and distinctive.


