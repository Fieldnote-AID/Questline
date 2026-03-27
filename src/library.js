/* === Generic Questline Director ===
   Paste near the END of library.js
   No Input / Context / Output changes needed.

   HOW TO USE:
   1. Edit QUEST_CONFIG only.
   2. Set your events.
   3. Done.

   Optional manual controls from console/script:
   - QuestDirector.mark("k1")
   - QuestDirector.reset()
   - QuestDirector.refresh()
*/

(function installGenericQuestDirector() {
  "use strict";

  const QUEST_CONFIG = {
  stateKey: "GenericQuestDirector_MyQuest",
  cardType: "class",

  progressCard: {
    title: "Quest Progress",
    keys: "quest, progress, objective, journey"
  },

  leadCard: {
    title: "Current Quest Lead",
    keys: "current quest, current objective, next step, lead"
  },

  progressLabels: {
    status: "Quest status",
    lastCompleted: "Last completed milestone",
    currentLead: "Current lead",
    completed: "Completed milestones"
  },

  initialLead:
    "The journal points toward the first destination. Seed this same place in your story opening.",

  events: [
    {
      id: "e1",
      order: 1,
      title: "Event 1 — First Destination",
      shortTitle: "First Destination",
      keys: "First Destination, first relic, first clue",
      completionEntry:
        "The first objective was completed at the First Destination.",
      leadEntry:
        "The journal points toward the First Destination, where the first objective can be completed.",
      nextLead:
        "The journal now points toward the Second Destination.",
      locationTerms: [
        "First Destination",
        "other name for first destination"
      ],
      completionTerms: [
        "found",
        "claimed",
        "took",
        "won",
        "recovered",
        "obtained",
        "solved",
        "activated"
      ],
      keyTerms: [
        "first relic",
        "first clue",
        "the objective",
        "the item"
      ],
      completionRegex: [
        /(the relic was theirs|the clue was solved|the mechanism activated)/i
      ]
    },

    {
      id: "e2",
      order: 2,
      title: "Event 2 — Second Destination",
      shortTitle: "Second Destination",
      keys: "Second Destination, second relic, second clue",
      completionEntry:
        "The second objective was completed at the Second Destination.",
      leadEntry:
        "The journal points toward the Second Destination.",
      nextLead:
        "The journal now points toward the Final Destination.",
      locationTerms: [
        "Second Destination"
      ],
      completionTerms: [
        "found",
        "claimed",
        "took",
        "won",
        "recovered",
        "obtained",
        "solved",
        "activated"
      ],
      keyTerms: [
        "second relic",
        "second clue",
        "the objective",
        "the item"
      ],
      completionRegex: [
        /(the relic was theirs|the clue was solved|the mechanism activated)/i
      ]
    },

    {
      id: "final",
      order: 3,
      title: "Final Event — Final Destination",
      shortTitle: "Final Destination",
      keys: "Final Destination, final relic, finale",
      completionEntry:
        "The final objective was completed and the quest ended.",
      leadEntry:
        "The journal points toward the Final Destination.",
      nextLead:
        "The quest is complete.",
      locationTerms: [
        "Final Destination"
      ],
      completionTerms: [
        "found",
        "claimed",
        "placed",
        "restored",
        "activated",
        "completed"
      ],
      keyTerms: [
        "final relic",
        "the objective",
        "the item",
        "the quest"
      ],
      completionRegex: [
        /(the ritual was complete|the quest was over|the final door opened)/i
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

  function ensureCardsArray() {
    globalThis.storyCards ??= [];
    return storyCards;
  }

  function findCard(title) {
    const cards = ensureCardsArray();
    const t = title.trim().toLowerCase();
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

  function getState() {
    globalThis.state ??= {};
    state[QUEST_CONFIG.stateKey] ??= {
      activeIndex: 0,
      completedIds: [],
      completedMap: {},
      lastCompletedTitle: null,
      currentLead: QUEST_CONFIG.initialLead
    };
    return state[QUEST_CONFIG.stateKey];
  }

  function getActiveEvent() {
    const s = getState();
    return QUEST_CONFIG.events[s.activeIndex] || null;
  }

  function getLatestText() {
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
      `- ${QUEST_CONFIG.progressLabels.status}: ${s.completedIds.length}/${QUEST_CONFIG.events.length - 1} main steps completed.`,
      `- ${QUEST_CONFIG.progressLabels.lastCompleted}: ${s.lastCompletedTitle || "none"}.`,
      `- ${QUEST_CONFIG.progressLabels.currentLead}: ${s.currentLead}`,
      `- ${QUEST_CONFIG.progressLabels.completed}: ${completedTitles}.`
    ].join("\n");
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
  }

  function markComplete(event) {
    const s = getState();
    if (s.completedMap[event.id]) return false;

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
    const hasLocation = textHasAnyTerm(text, event.locationTerms);
    const hasCompletionVerb = textHasAnyTerm(text, event.completionTerms);
    const hasKeyTerm = textHasAnyTerm(text, event.keyTerms);
    const hasRegexCompletion = textHasAnyRegex(text, event.completionRegex);

    return hasRegexCompletion || ((hasLocation || hasKeyTerm) && hasCompletionVerb);
  }

  function scanActiveEvent(text) {
    const body = safeString(text);
    if (!body.trim()) return;

    const active = getActiveEvent();
    if (!active) return;

    if (eventWasCompletedInText(body, active)) {
      markComplete(active);
    } else {
      refreshCoreCards();
    }
  }

  globalThis.QuestDirector = {
    config: QUEST_CONFIG,

    run(hook) {
      if (hook !== "output") return;
      refreshCoreCards();
      scanActiveEvent(getLatestText());
    },

    mark(id) {
      const event = QUEST_CONFIG.events.find(e => e.id === id);
      if (event) markComplete(event);
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
        currentLead: QUEST_CONFIG.initialLead
      };
      refreshCoreCards();
    }
  };

  if (typeof globalThis.InnerSelf === "function" && !globalThis.InnerSelf.__questDirectorWrapped) {
    const original = globalThis.InnerSelf;
    const wrapped = function(hook) {
      const result = original(hook);
      try { globalThis.QuestDirector.run(hook); } catch (_) {}
      return result;
    };
    wrapped.__questDirectorWrapped = true;
    globalThis.InnerSelf = wrapped;
  } else if (typeof globalThis.InnerSelf !== "function") {
    try { globalThis.QuestDirector.refresh(); } catch (_) {}
  }
})();
