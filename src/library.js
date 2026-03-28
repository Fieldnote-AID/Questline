/* === Generic Quest Director ===
   Paste near the END of library.js

   HOW TO USE:
   1. Edit QUEST_CONFIG only.
   2. Set your events.
   3. Done.

   If pasted below InnerSelf:
   - No extra hook changes needed.

   If NOT using InnerSelf:
   - Call QuestDirectorHooks.input(text) from your input hook
   - Call QuestDirectorHooks.output(text) from your output hook

   What this version does:
   - Only checks the current active quest
   - Advances quests in order
   - Lets either player input OR AI output trigger completion
   - Uses the actual text from the current hook
   - Creates a standalone story card for the newly active quest
   - Updates the completed quest card when a quest is finished
   - Updates the pinned Progress + Current Lead cards

   Optional manual controls from script:
   - QuestDirector.mark("step1")
   - QuestDirector.reset()
   - QuestDirector.refresh()
*/

(function installGenericQuestDirector() {
  "use strict";

  const QUEST_CONFIG = {
    stateKey: "GenericQuestDirector_Template",
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
      status: "Quest status",
      lastCompleted: "Last completed step",
      currentLead: "Current lead",
      completed: "Completed steps"
    },

    initialLead:
      "The first objective has been revealed. Follow the current lead to begin the quest chain.",

    events: [
      {
        id: "step1",
        order: 1,
        title: "Step 1 — First Objective",
        shortTitle: "First Objective",
        keys: "step 1, first objective, first milestone",
        completionEntry:
          "The first objective was completed.",
        leadEntry:
          "The first objective is now active.",
        nextLead:
          "A new lead points toward the second objective.",

        locationTerms: [
          "first objective location",
          "first objective target"
        ],

        completionTerms: [
          "found",
          "claimed",
          "recovered",
          "secured",
          "obtained",
          "activated",
          "delivered",
          "defeated",
          "cleared",
          "finished",
          "completed"
        ],

        keyTerms: [
          "first objective",
          "first milestone",
          "quest item",
          "target"
        ],

        completionRegex: [
          /\b(the objective was complete|the target was defeated|the item was secured)\b/i
        ]
      },

      {
        id: "step2",
        order: 2,
        title: "Step 2 — Second Objective",
        shortTitle: "Second Objective",
        keys: "step 2, second objective, second milestone",
        completionEntry:
          "The second objective was completed.",
        leadEntry:
          "The second objective is now active.",
        nextLead:
          "A new lead points toward the third objective.",
        locationTerms: [
          "second objective location",
          "second objective target"
        ],
        completionTerms: [
          "found",
          "claimed",
          "recovered",
          "secured",
          "obtained",
          "activated",
          "delivered",
          "defeated",
          "cleared",
          "finished",
          "completed"
        ],
        keyTerms: [
          "second objective",
          "second milestone",
          "quest item",
          "target"
        ],
        completionRegex: [
          /\b(the objective was complete|the target was defeated|the item was secured)\b/i
        ]
      },

      {
        id: "step3",
        order: 3,
        title: "Step 3 — Final Objective",
        shortTitle: "Final Objective",
        keys: "step 3, final objective, final milestone",
        completionEntry:
          "The final objective was completed.",
        leadEntry:
          "The final objective is now active.",
        nextLead:
          "The quest is complete.",
        locationTerms: [
          "final objective location",
          "final objective target"
        ],
        completionTerms: [
          "found",
          "claimed",
          "recovered",
          "secured",
          "obtained",
          "activated",
          "delivered",
          "defeated",
          "cleared",
          "finished",
          "completed"
        ],
        keyTerms: [
          "final objective",
          "final milestone",
          "quest item",
          "target"
        ],
        completionRegex: [
          /\b(the final objective was complete|the quest was complete|victory was secured)\b/i
        ]
      }
    ]
  };

  function safeString(v) {
    return typeof v === "string" ? v : "";
  }

  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function textHasAnyTerm(text, terms) {
    if (!Array.isArray(terms) || !terms.length) return false;
    return terms.some(term => new RegExp(escapeRegex(term), "i").test(text));
  }

  function textHasAnyRegex(text, regexes) {
    if (!Array.isArray(regexes) || !regexes.length) return false;
    return regexes.some(rx => rx instanceof RegExp && rx.test(text));
  }

  function textHasProximityPair(text, leftTerms, rightTerms, maxGap = 40) {
    const body = safeString(text);
    if (!body) return false;
    if (!Array.isArray(leftTerms) || !leftTerms.length) return false;
    if (!Array.isArray(rightTerms) || !rightTerms.length) return false;

    for (const left of leftTerms) {
      for (const right of rightTerms) {
        const a = escapeRegex(left);
        const b = escapeRegex(right);

        const forward = new RegExp(`${a}[\\s\\S]{0,${maxGap}}${b}`, "i");
        const backward = new RegExp(`${b}[\\s\\S]{0,${maxGap}}${a}`, "i");

        if (forward.test(body) || backward.test(body)) return true;
      }
    }

    return false;
  }

  function textHasNegativeCompletion(text) {
    return /\b(almost|nearly|not yet|failed to|couldn'?t|could not|unable to|trying to|tried to|looking for|searching for|needed to find|need to find|hoping to find|wanted to find|wasn'?t there|was not there|missing|gone|still hidden)\b/i.test(
      safeString(text)
    );
  }

  function textHasAcquisitionPattern(text, event) {
    const body = safeString(text);
    if (!body) return false;

    const verbs = Array.isArray(event.completionTerms) ? event.completionTerms : [];
    const keys = Array.isArray(event.keyTerms) ? event.keyTerms : [];

    for (const verb of verbs) {
      for (const key of keys) {
        const v = escapeRegex(verb);
        const k = escapeRegex(key);

        const verbThenKey = new RegExp(`\\b${v}\\b[\\s\\S]{0,40}\\b${k}\\b`, "i");
        const keyThenVerb = new RegExp(`\\b${k}\\b[\\s\\S]{0,20}\\b(?:was|were|is|are|had been|has been)?\\s*${v}\\b`, "i");

        if (verbThenKey.test(body) || keyThenVerb.test(body)) return true;
      }
    }

    return false;
  }

  function ensureCardsArray() {
    globalThis.storyCards ??= [];
    return storyCards;
  }

  function findCard(title) {
    const cards = ensureCardsArray();
    const t = safeString(title).trim().toLowerCase();
    return cards.find(c => safeString(c?.title).trim().toLowerCase() === t) || null;
  }

  function upsertCard({ title, keys, entry, description = "", pinned = false }) {
    const cards = ensureCardsArray();
    let card = findCard(title);

    if (!card && typeof addStoryCard === "function") {
      addStoryCard("%@%");
      card = cards.find(c => c.title === "%@%") || null;
    }

    if (!card) {
      card = { title: "%@%", keys: "", entry: "", description: "", type: QUEST_CONFIG.cardType };
      cards.unshift(card);
    }

    card.type = QUEST_CONFIG.cardType;
    card.title = title;
    card.keys = keys;
    card.entry = entry;
    card.description = description;

    if (pinned) {
      const i = cards.indexOf(card);
      if (i > 0) {
        cards.splice(i, 1);
        cards.unshift(card);
      }
    }

    return card;
  }

  function getTurnKey() {
    const actionCount = Number.isInteger(globalThis.info?.actionCount) ? globalThis.info.actionCount : -1;
    const historyLen = Array.isArray(globalThis.history) ? history.length : -1;
    return `${actionCount}|${historyLen}`;
  }

  function getState() {
    globalThis.state ??= {};
    state[QUEST_CONFIG.stateKey] ??= {
      activeIndex: 0,
      completedIds: [],
      completedMap: {},
      lastCompletedTitle: null,
      currentLead: QUEST_CONFIG.initialLead,
      lastScanFingerprint: ""
    };
    return state[QUEST_CONFIG.stateKey];
  }

  function getActiveEvent() {
    const s = getState();
    return QUEST_CONFIG.events[s.activeIndex] || null;
  }

  function getLatestText(explicitText) {
    if (safeString(explicitText).trim()) return safeString(explicitText);
    if (safeString(globalThis.text).trim()) return globalThis.text;
    const last = Array.isArray(globalThis.history) ? history[history.length - 1] : null;
    return safeString(last?.text || last?.rawText);
  }

  function buildProgressEntry() {
    const s = getState();
    const completedTitles = s.completedIds.length
      ? s.completedIds
          .map(id => QUEST_CONFIG.events.find(e => e.id === id))
          .filter(Boolean)
          .map(e => e.shortTitle || e.title)
          .join("; ")
      : "none yet";

    return [
      `- ${QUEST_CONFIG.progressLabels.status}: ${s.completedIds.length}/${QUEST_CONFIG.events.length} steps completed.`,
      `- ${QUEST_CONFIG.progressLabels.lastCompleted}: ${s.lastCompletedTitle || "none"}.`,
      `- ${QUEST_CONFIG.progressLabels.currentLead}: ${s.currentLead}`,
      `- ${QUEST_CONFIG.progressLabels.completed}: ${completedTitles}.`
    ].join("\n");
  }

  function syncActiveQuestCard() {
    const active = getActiveEvent();
    if (!active) return null;

    return upsertCard({
      title: active.title,
      keys: active.keys,
      entry: active.leadEntry,
      description: "Auto-created active quest card.",
      pinned: false
    });
  }

  function refreshCoreCards() {
    const s = getState();
    const active = getActiveEvent();

    upsertCard({
      title: QUEST_CONFIG.progressCard.title,
      keys: QUEST_CONFIG.progressCard.keys,
      entry: buildProgressEntry(),
      description: "Auto-managed quest progress.",
      pinned: true
    });

    upsertCard({
      title: QUEST_CONFIG.leadCard.title,
      keys: QUEST_CONFIG.leadCard.keys,
      entry: active ? active.leadEntry : s.currentLead,
      description: "Auto-managed current quest lead.",
      pinned: true
    });

    syncActiveQuestCard();
  }

  function markComplete(event) {
    const s = getState();
    if (!event || s.completedMap[event.id]) return false;

    s.completedMap[event.id] = true;
    s.completedIds.push(event.id);
    s.lastCompletedTitle = event.title;
    s.currentLead = event.nextLead;
    s.activeIndex = Math.min(s.activeIndex + 1, QUEST_CONFIG.events.length);

    upsertCard({
      title: event.title,
      keys: event.keys,
      entry: event.completionEntry,
      description: "Auto-created completed quest milestone.",
      pinned: false
    });

    refreshCoreCards();

    try {
      state.message = `Quest updated: ${event.title}`;
    } catch (_) {}

    return true;
  }

  function eventWasCompletedInText(text, event) {
    const body = safeString(text);
    if (!body.trim() || !event) return false;

    if (textHasNegativeCompletion(body)) return false;
    if (textHasAnyRegex(body, event.completionRegex)) return true;

    const hasAcquisition = textHasAcquisitionPattern(body, event);
    if (!hasAcquisition) return false;

    const hasSpecificKey = textHasAnyTerm(body, event.keyTerms);
    const hasLocation = textHasAnyTerm(body, event.locationTerms);
    const keyNearVerb = textHasProximityPair(body, event.keyTerms, event.completionTerms, 40);
    const locationNearKey = textHasProximityPair(body, event.locationTerms, event.keyTerms, 120);

    if (hasSpecificKey && keyNearVerb) return true;
    if (hasLocation && hasSpecificKey && locationNearKey && keyNearVerb) return true;

    return false;
  }

  function buildScanFingerprint(hook, text, activeId) {
    const turnKey = getTurnKey();
    const compactText = safeString(text).trim().slice(0, 600);
    return `${turnKey}::${hook}::${activeId || "none"}::${compactText}`;
  }

  function scanActiveEvent(text, hook) {
    const body = safeString(text);
    const active = getActiveEvent();

    if (!active) {
      refreshCoreCards();
      return false;
    }

    if (!body.trim()) {
      refreshCoreCards();
      return false;
    }

    const s = getState();
    const fingerprint = buildScanFingerprint(hook, body, active.id);

    if (s.lastScanFingerprint === fingerprint) {
      refreshCoreCards();
      return false;
    }

    s.lastScanFingerprint = fingerprint;

    if (eventWasCompletedInText(body, active)) {
      return markComplete(active);
    }

    refreshCoreCards();
    return false;
  }

  function runCore(hook, explicitText) {
    if (hook !== "input" && hook !== "output") return false;
    refreshCoreCards();
    return scanActiveEvent(getLatestText(explicitText), hook);
  }

  globalThis.QuestDirector = {
    config: QUEST_CONFIG,

    run(hook, explicitText) {
      try {
        return runCore(hook, explicitText);
      } catch (_) {
        return false;
      }
    },

    runInput(explicitText) {
      try {
        return runCore("input", explicitText);
      } catch (_) {
        return false;
      }
    },

    runOutput(explicitText) {
      try {
        return runCore("output", explicitText);
      } catch (_) {
        return false;
      }
    },

    mark(id) {
      const event = QUEST_CONFIG.events.find(e => e.id === id);
      if (event) return markComplete(event);
      return false;
    },

    refresh() {
      refreshCoreCards();
    },

    reset() {
      state[QUEST_CONFIG.stateKey] = {
        activeIndex: 0,
        completedIds: [],
        completedMap: {},
        lastCompletedTitle: null,
        currentLead: QUEST_CONFIG.initialLead,
        lastScanFingerprint: ""
      };
      refreshCoreCards();
    }
  };

  // Standalone helpers for adventures that are NOT using InnerSelf.
  // Call these from your real input/output hooks if InnerSelf is absent.
  globalThis.QuestDirectorHooks = {
    input(text) {
      try {
        globalThis.QuestDirector.run("input", text);
      } catch (_) {}
      return text;
    },

    output(text) {
      try {
        globalThis.QuestDirector.run("output", text);
      } catch (_) {}
      return text;
    }
  };

  // Optional automatic integration with InnerSelf.
  if (typeof globalThis.InnerSelf === "function" && !globalThis.InnerSelf.__questDirectorWrapped) {
    const original = globalThis.InnerSelf;
    const wrapped = function(hook) {
      const result = original(hook);
      try {
        globalThis.QuestDirector.run(hook, globalThis.text);
      } catch (_) {}
      return result;
    };
    wrapped.__questDirectorWrapped = true;
    globalThis.InnerSelf = wrapped;
  }

  try { globalThis.QuestDirector.refresh(); } catch (_) {}
})();
