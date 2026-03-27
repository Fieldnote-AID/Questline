## Install Guide

Questline can run in two ways:

### Option 1: With Inner Self or another existing script wrapper
If your scenario already uses a script framework like **Inner Self**, you usually do **not** need to change your Input / Context / Output tabs.

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
AI Dungeon only runs code from the Input / Context / Output tabs, so Questline needs a tiny wrapper in the `Output` tab.

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
