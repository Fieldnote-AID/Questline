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
    stateKey: "GenericQuestDirector_SevenKeys",
    cardType: "class",

    progressCard: {
      title: "Seven Keys Quest Progress",
      keys: "seven keys, golden keys, gold-bound book, quest, magic, Fillory, Seth, Margo, Eliot, Quentin, Alice, Penny"
    },

    leadCard: {
      title: "Current Quest Lead",
      keys: "current quest, next key, golden key, gold-bound book, quest, magic, Fillory, Seth, Margo, Eliot, Quentin, Alice, Penny"
    },

    progressLabels: {
      status: "Seven-key quest status",
      lastCompleted: "Last completed milestone",
      currentLead: "Current revealed page",
      completed: "Completed milestones"
    },

    initialLead:
      "The gold-bound book points toward the House of Borrowed Memories. Each room takes a memory, and the first golden key comes only when truth is chosen over comfort.",

    events: [
      {
        id: "k1",
        order: 1,
        title: "First Key — House of Borrowed Memories",
        shortTitle: "House of Borrowed Memories",
        keys: "House of Borrowed Memories, Borrowed Memories, First Key, first golden key, memory house",
        completionEntry:
          "The first golden key was found in the House of Borrowed Memories, where each room demanded a surrendered memory. The key came only when truth was chosen over comfort.",
        leadEntry:
          "The gold-bound book points toward the House of Borrowed Memories. Each room takes a memory, and the first golden key comes only when truth is chosen over comfort.",
        nextLead:
          "The gold-bound book points toward the Moonlit Mosaic, where changing phases rearrange time and intent.",

        // Mentioning any of these helps establish the active location/event
        locationTerms: [
          "House of Borrowed Memories",
          "Borrowed Memories",
          "memory house"
        ],

        // Completion is detected if the output contains one of these plus a key phrase,
        // or one of the regexes below.
        completionTerms: [
          "found",
          "claimed",
          "took",
          "won",
          "recovered",
          "obtained"
        ],

        keyTerms: [
          "first key",
          "first golden key",
          "golden key",
          "the key"
        ],

        completionRegex: [
          /(the key came free|the key was theirs|the key was ours|the key was his|the key was hers)/i
        ]
      },

      {
        id: "k2",
        order: 2,
        title: "Second Key — Moonlit Mosaic",
        shortTitle: "Moonlit Mosaic",
        keys: "Moonlit Mosaic, lunar mosaic, Second Key, second golden key, moon key",
        completionEntry:
          "The second golden key was won inside the Moonlit Mosaic, a shifting lunar puzzle that punished hesitation and false timing.",
        leadEntry:
          "The gold-bound book points toward the Moonlit Mosaic, where changing phases rearrange time and intent.",
        nextLead:
          "The gold-bound book points toward the Choir of the Drowned, where grief, tide, and voice bind the third key.",
        locationTerms: ["Moonlit Mosaic", "lunar mosaic"],
        completionTerms: ["found", "claimed", "took", "won", "recovered", "obtained"],
        keyTerms: ["second key", "second golden key", "golden key", "the key"],
        completionRegex: [/(the key came free|the key was theirs|the key was ours)/i]
      },

      {
        id: "k3",
        order: 3,
        title: "Third Key — Choir of the Drowned",
        shortTitle: "Choir of the Drowned",
        keys: "Choir of the Drowned, Drowned Choir, Third Key, third golden key, sea key",
        completionEntry:
          "The third golden key was taken from the Choir of the Drowned, where the dead yielded harmony only after the living admitted what they were afraid to lose.",
        leadEntry:
          "The gold-bound book points toward the Choir of the Drowned, where grief, tide, and voice bind the third key.",
        nextLead:
          "The gold-bound book points toward the Train of Unwritten Books, which never stops in the same place twice.",
        locationTerms: ["Choir of the Drowned", "Drowned Choir"],
        completionTerms: ["found", "claimed", "took", "won", "recovered", "obtained"],
        keyTerms: ["third key", "third golden key", "golden key", "the key"],
        completionRegex: [/(the key came free|the key was theirs|the key was ours)/i]
      },

      {
        id: "k4",
        order: 4,
        title: "Fourth Key — Train of Unwritten Books",
        shortTitle: "Train of Unwritten Books",
        keys: "Train of Unwritten Books, Unwritten Books, Fourth Key, fourth golden key, train key",
        completionEntry:
          "The fourth golden key was recovered aboard the Train of Unwritten Books, where every compartment held stories that could still become real.",
        leadEntry:
          "The gold-bound book points toward the Train of Unwritten Books, which never stops in the same place twice.",
        nextLead:
          "The gold-bound book points toward the Orchard of the Dead God, where fertility and rot share the same root.",
        locationTerms: ["Train of Unwritten Books", "Unwritten Books"],
        completionTerms: ["found", "claimed", "took", "won", "recovered", "obtained"],
        keyTerms: ["fourth key", "fourth golden key", "golden key", "the key"],
        completionRegex: [/(the key came free|the key was theirs|the key was ours)/i]
      },

      {
        id: "k5",
        order: 5,
        title: "Fifth Key — Orchard of the Dead God",
        shortTitle: "Orchard of the Dead God",
        keys: "Orchard of the Dead God, dead god orchard, Fifth Key, fifth golden key, orchard key",
        completionEntry:
          "The fifth golden key was taken from the Orchard of the Dead God, where rotten divinity still bore fruit and power had to be touched without worshipping it.",
        leadEntry:
          "The gold-bound book points toward the Orchard of the Dead God, where fertility and rot share the same root.",
        nextLead:
          "The gold-bound book points toward the Glass Desert, where reflection and mirage guard the sixth key.",
        locationTerms: ["Orchard of the Dead God", "dead god orchard"],
        completionTerms: ["found", "claimed", "took", "won", "recovered", "obtained"],
        keyTerms: ["fifth key", "fifth golden key", "golden key", "the key"],
        completionRegex: [/(the key came free|the key was theirs|the key was ours)/i]
      },

      {
        id: "k6",
        order: 6,
        title: "Sixth Key — Glass Desert",
        shortTitle: "Glass Desert",
        keys: "Glass Desert, mirror desert, Sixth Key, sixth golden key, desert key",
        completionEntry:
          "The sixth golden key was found in the Glass Desert, where mirrored selves and heat-born illusions made every choice feel like self-betrayal.",
        leadEntry:
          "The gold-bound book points toward the Glass Desert, where reflection and mirage guard the sixth key.",
        nextLead:
          "The gold-bound book points toward the Clockwork Hare and the final key, where pursuit and fate collapse into the same path.",
        locationTerms: ["Glass Desert", "mirror desert"],
        completionTerms: ["found", "claimed", "took", "won", "recovered", "obtained"],
        keyTerms: ["sixth key", "sixth golden key", "golden key", "the key"],
        completionRegex: [/(the key came free|the key was theirs|the key was ours)/i]
      },

      {
        id: "k7",
        order: 7,
        title: "Seventh Key — Clockwork Hare",
        shortTitle: "Clockwork Hare",
        keys: "Clockwork Hare, broken clock tree, Seventh Key, seventh golden key, final key",
        completionEntry:
          "The seventh golden key was won by following the Clockwork Hare through a broken chronology, where future, memory, and pursuit kept folding over each other.",
        leadEntry:
          "The gold-bound book points toward the Clockwork Hare and the final key, where pursuit and fate collapse into the same path.",
        nextLead:
          "All seven keys are gathered. The gold-bound book points toward the seven gears at the Edge of the World.",
        locationTerms: ["Clockwork Hare", "broken clock tree"],
        completionTerms: ["found", "claimed", "took", "won", "recovered", "obtained"],
        keyTerms: ["seventh key", "seventh golden key", "final key", "golden key", "the key"],
        completionRegex: [/(the key came free|the key was theirs|the key was ours)/i]
      },

      {
        id: "final",
        order: 8,
        title: "The Edge of the World — The Seven Gears",
        shortTitle: "The Seven Gears",
        keys: "Edge of the World, Seven Gears, gears, turn the world on, restore magic",
        completionEntry:
          "At the Edge of the World, the keys were set into the ancient gears that turn the world toward magic. Magic returned, but the door beyond opened too, and passage demanded a debt.",
        leadEntry:
          "All seven keys are gathered. The gold-bound book points toward the seven gears at the Edge of the World.",
        nextLead:
          "The quest is complete. Magic lives again, but the cost of passage has come due.",
        locationTerms: ["Edge of the World", "Seven Gears", "gears"],
        completionTerms: ["set", "placed", "inserted", "turned", "restored"],
        keyTerms: ["all seven keys", "seven keys", "the keys", "magic"],
        completionRegex: [/(magic returned|magic lives again|the gears turned)/i]
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
