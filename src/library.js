/* === Hybrid Quest Director ===

Paste near the END of library.js

WHAT THIS VERSION DOES
- Supports one linear MAIN quest chain
- Supports optional SIDE quests that can start, progress, and complete independently
- Lets either player input OR AI output trigger quest updates
- Uses generic example quests suitable for a public repo
- Creates/updates quest cards at START / MID / COMPLETION
- Updates pinned Progress + Current Lead cards

HOW TO USE
1. Edit QUEST_CONFIG only
2. Put main quests in events with track: "main" and order: 1, 2, 3...
3. Put side quests in events with track: "side"
4. For side quests, define activationTerms or activationRegex
5. For mid-stage updates, define midEntry plus midTerms or midRegex
6. For completion, define completion fields as usual

IF USING INNERSELF
- Paste this below InnerSelf
- No extra hook changes needed

IF NOT USING INNERSELF
- Call QuestDirectorHooks.input(text) from your input hook
- Call QuestDirectorHooks.output(text) from your output hook

OPTIONAL MANUAL CONTROLS
- QuestDirector.start("questId")
- QuestDirector.progress("questId")
- QuestDirector.complete("questId")
- QuestDirector.mark("questId")
- QuestDirector.reset()
- QuestDirector.refresh()
*/

(function installHybridQuestDirector() {
  "use strict";

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
      mainStatus: "Main quest status",
      mainLastCompleted: "Last completed main step",
      mainCurrentLead: "Main lead",
      activeSideQuests: "Active side quests",
      completedSideQuests: "Completed side quests"
    },

    initialMainLead: "A first clue points toward the opening step of a larger quest.",

    events: [
      // =========================
      // MAIN QUEST CHAIN EXAMPLES
      // =========================
      {
        id: "main_relic_map",
        track: "main",
        mode: "linear",
        order: 1,
        title: "Main Quest — The Hidden Map",
        shortTitle: "The Hidden Map",
        keys: "hidden map, relic map, first clue, main quest step 1",
        startEntry: "A hidden map hints at the first step in a larger quest.",
        leadEntry: "Find the hidden map and learn where it points.",
        midEntry: "The map is real, but it seems incomplete or encoded.",
        midLead: "Study the map closely and uncover the destination it conceals.",
        completionEntry: "The hidden map has been recovered and its meaning has started to unfold.",
        nextLead: "The map points toward an old chamber tied to the next objective.",
        midTerms: [ "decoded", "translated", "partial map", "hidden markings", "cipher", "strange map" ],
        midRegex: [
          /\b(the map was incomplete|the map was encoded|the markings began to make sense)\b/i
        ],
        locationTerms: [ "archive", "ruins", "vault", "study", "library" ],
        completionTerms: [ "found", "claimed", "recovered", "secured", "obtained", "decoded" ],
        keyTerms: [ "hidden map", "relic map", "map fragment", "map" ],
        completionRegex: [
          /\b(the hidden map was recovered|the relic map was found|the map was finally decoded)\b/i
        ]
      },
      {
        id: "main_old_chamber",
        track: "main",
        mode: "linear",
        order: 2,
        title: "Main Quest — The Old Chamber",
        shortTitle: "The Old Chamber",
        keys: "old chamber, sealed chamber, main quest step 2",
        startEntry: "The recovered map points toward an old sealed chamber.",
        leadEntry: "Reach the old chamber and discover what it protects.",
        midEntry: "The chamber is warded, and opening it may trigger consequences.",
        midLead: "Break, bypass, or understand the chamber's defenses before entering.",
        completionEntry: "The old chamber has been opened and the next stage of the quest revealed.",
        nextLead: "Something inside the chamber points toward a final confrontation.",
        midTerms: [ "warded", "sealed door", "locked chamber", "ritual seal", "broken ward" ],
        midRegex: [
          /\b(the chamber was sealed|the ward was active|the door would not open)\b/i
        ],
        locationTerms: [ "chamber", "vault", "crypt", "ruins", "underground hall" ],
        completionTerms: [ "opened", "entered", "unsealed", "broke", "crossed", "revealed" ],
        keyTerms: [ "old chamber", "sealed chamber", "inner chamber", "hidden chamber" ],
        completionRegex: [
          /\b(the old chamber was opened|the sealed chamber was breached|the chamber revealed its secret)\b/i
        ]
      },
      {
        id: "main_final_confrontation",
        track: "main",
        mode: "linear",
        order: 3,
        title: "Main Quest — Final Confrontation",
        shortTitle: "Final Confrontation",
        keys: "final confrontation, final step, main quest step 3",
        startEntry: "The trail leads toward a final confrontation.",
        leadEntry: "Face the final obstacle and decide how the quest ends.",
        midEntry: "The final confrontation is near, and the cost of victory is becoming clear.",
        midLead: "Prepare for the confrontation and decide what you are willing to risk.",
        completionEntry: "The final confrontation has ended and the quest is complete.",
        nextLead: "The main quest is complete.",
        midTerms: [ "prepared", "gathered allies", "final ritual", "last defense", "last stand" ],
        midRegex: [
          /\b(the end was close|the confrontation was coming|the final choice was near)\b/i
        ],
        locationTerms: [ "sanctum", "summit", "throne room", "ritual site", "final chamber" ],
        completionTerms: [ "defeated", "stopped", "claimed", "survived", "ended", "completed" ],
        keyTerms: [ "final confrontation", "final enemy", "final ritual", "quest" ],
        completionRegex: [
          /\b(the final confrontation was over|the last obstacle was defeated|the quest was complete)\b/i
        ]
      },

      // =========================
      // SIDE QUEST EXAMPLES
      // =========================
      {
        id: "side_missing_scout",
        track: "side",
        mode: "oneoff",
        title: "Side Quest — The Missing Scout",
        shortTitle: "The Missing Scout",
        keys: "missing scout, lost scout, vanished scout",
        activationEntry: "Rumors spread that a scout vanished near the frontier and never returned.",
        startEntry: "A missing scout may still be alive, or may have found something others wanted hidden.",
        leadEntry: "Track down the missing scout and learn what happened.",
        midEntry: "The scout's trail reveals signs of struggle and a secret worth hiding.",
        midLead: "Follow the broken trail and find out what the missing scout discovered.",
        completionEntry: "The truth of the missing scout has been uncovered.",
        activationTerms: [ "missing scout", "lost scout", "vanished scout", "disappeared on patrol" ],
        activationRegex: [
          /\b(a scout went missing|the patrol never came back)\b/i
        ],
        midTerms: [ "trail", "tracks", "blood", "camp", "broken supplies" ],
        midRegex: [
          /\b(the trail was fresh|there were signs of a struggle|the camp had been abandoned)\b/i
        ],
        locationTerms: [ "forest", "road", "outpost", "camp", "frontier" ],
        completionTerms: [ "found", "rescued", "buried", "uncovered", "learned", "confirmed" ],
        keyTerms: [ "missing scout", "scout", "trail", "camp" ],
        completionRegex: [
          /\b(the missing scout was found|the scout's fate was uncovered|the truth of the vanished scout was revealed)\b/i
        ]
      },
      {
        id: "side_strange_well",
        track: "side",
        mode: "oneoff",
        title: "Side Quest — The Strange Well",
        shortTitle: "The Strange Well",
        keys: "strange well, cursed well, old well",
        activationEntry: "Locals warn of an old well that has started causing trouble again.",
        startEntry: "An old well is behaving strangely and may be tied to something dangerous below.",
        leadEntry: "Investigate the strange well and determine whether it is cursed, haunted, or worse.",
        midEntry: "The well is active, and something below it answers when disturbed.",
        midLead: "Descend, observe, or seal the well before the problem spreads.",
        completionEntry: "The mystery of the strange well has been resolved.",
        activationTerms: [ "strange well", "old well", "cursed well", "haunted well" ],
        activationRegex: [
          /\b(the well was wrong|something was moving below the well)\b/i
        ],
        midTerms: [ "echo", "whispering", "deep water", "movement below", "strange sound" ],
        midRegex: [
          /\b(the well answered back|there was something beneath the water|the whispers grew louder)\b/i
        ],
        locationTerms: [ "well", "village", "ruins", "courtyard", "shrine" ],
        completionTerms: [ "sealed", "purified", "entered", "survived", "stopped", "resolved" ],
        keyTerms: [ "strange well", "old well", "curse", "presence below" ],
        completionRegex: [
          /\b(the well was sealed|the strange well was resolved|the curse below the well was broken)\b/i
        ]
      },
      {
        id: "side_bandit_cache",
        track: "side",
        mode: "oneoff",
        title: "Side Quest — The Bandit Cache",
        shortTitle: "The Bandit Cache",
        keys: "bandit cache, hidden cache, stolen goods",
        activationEntry: "A rumor points toward a hidden cache of stolen goods somewhere off the main road.",
        startEntry: "A hidden cache may hold supplies, evidence, or something more valuable than expected.",
        leadEntry: "Find the bandit cache and decide what to do with what it contains.",
        midEntry: "The cache is protected by more than a simple hiding place.",
        midLead: "Open the cache safely and learn who it truly belongs to.",
        completionEntry: "The bandit cache has been found and dealt with.",
        activationTerms: [ "bandit cache", "hidden cache", "stolen goods", "buried loot" ],
        activationRegex: [
          /\b(there was a cache nearby|someone hid stolen goods off the road)\b/i
        ],
        midTerms: [ "trap", "guarded cache", "false trail", "buried chest", "hidden stash" ],
        midRegex: [
          /\b(the cache was trapped|someone was guarding the stash|the loot was hidden well)\b/i
        ],
        locationTerms: [ "road", "camp", "ravine", "woods", "bridge" ],
        completionTerms: [ "found", "claimed", "returned", "opened", "secured", "exposed" ],
        keyTerms: [ "bandit cache", "stash", "stolen goods", "buried loot" ],
        completionRegex: [
          /\b(the bandit cache was found|the hidden stash was opened|the stolen goods were recovered)\b/i
        ]
      }
    ]
  };

  function safeString(v) {
    return typeof v === "string" ? v : "";
  }

  function escapeRegex(text) {
    return safeString(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function textHasAnyTerm(text, terms) {
    const body = safeString(text);
    if (!body || !Array.isArray(terms) || !terms.length) return false;
    return terms.some(function(term) {
      return new RegExp(escapeRegex(term), "i").test(body);
    });
  }

  function textHasAnyRegex(text, regexes) {
    const body = safeString(text);
    if (!body || !Array.isArray(regexes) || !regexes.length) return false;
    return regexes.some(function(rx) {
      return rx instanceof RegExp && rx.test(body);
    });
  }

  function textHasNegativeCompletion(text) {
    return /\b(almost|nearly|not yet|failed to|couldn'?t|could not|unable to|trying to|tried to|looking for|searching for|needed to find|need to find|hoping to find|wanted to find|wasn'?t there|was not there|missing|gone|still hidden)\b/i.test(safeString(text));
  }

  function textHasProximityPair(text, leftTerms, rightTerms, maxGap) {
    const body = safeString(text);
    const gap = Number.isInteger(maxGap) ? maxGap : 40;
    if (!body || !Array.isArray(leftTerms) || !leftTerms.length || !Array.isArray(rightTerms) || !rightTerms.length) return false;

    for (let i = 0; i < leftTerms.length; i++) {
      for (let j = 0; j < rightTerms.length; j++) {
        const a = escapeRegex(leftTerms[i]);
        const b = escapeRegex(rightTerms[j]);
        const forward = new RegExp(a + "[\\s\\S]{0," + gap + "}" + b, "i");
        const backward = new RegExp(b + "[\\s\\S]{0," + gap + "}" + a, "i");
        if (forward.test(body) || backward.test(body)) return true;
      }
    }
    return false;
  }

  function textHasAcquisitionPattern(text, quest) {
    const body = safeString(text);
    if (!body) return false;

    const verbs = Array.isArray(quest.completionTerms) ? quest.completionTerms : [];
    const keys = Array.isArray(quest.keyTerms) ? quest.keyTerms : [];

    for (let i = 0; i < verbs.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        const v = escapeRegex(verbs[i]);
        const k = escapeRegex(keys[j]);
        const verbThenKey = new RegExp("\\b" + v + "\\b[\\s\\S]{0,40}\\b" + k + "\\b", "i");
        const keyThenVerb = new RegExp("\\b" + k + "\\b[\\s\\S]{0,20}\\b(?:was|were|is|are|had been|has been)?\\s*" + v + "\\b", "i");
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
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (safeString(card && card.title).trim().toLowerCase() === t) return card;
    }
    return null;
  }

  function upsertCard(args) {
    const title = args.title;
    const keys = args.keys;
    const entry = args.entry;
    const description = safeString(args.description);
    const pinned = !!args.pinned;

    const cards = ensureCardsArray();
    let card = findCard(title);

    if (!card && typeof addStoryCard === "function") {
      addStoryCard("%@%");
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].title === "%@%") {
          card = cards[i];
          break;
        }
      }
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
      const idx = cards.indexOf(card);
      if (idx > 0) {
        cards.splice(idx, 1);
        cards.unshift(card);
      }
    }

    return card;
  }

  function getTurnKey() {
    const actionCount = Number.isInteger(globalThis.info && globalThis.info.actionCount) ? globalThis.info.actionCount : -1;
    const historyLen = Array.isArray(globalThis.history) ? globalThis.history.length : -1;
    return String(actionCount) + "|" + String(historyLen);
  }

  function getAllQuests() {
    return Array.isArray(QUEST_CONFIG.events) ? QUEST_CONFIG.events : [];
  }

  function getMainQuests() {
    return getAllQuests()
      .filter(function(q) { return q.track === "main"; })
      .sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  }

  function getSideQuests() {
    return getAllQuests().filter(function(q) { return q.track === "side"; });
  }

  function getDefaultQuestState(quest) {
    return {
      id: quest.id,
      stage: "inactive",
      started: false,
      completed: false
    };
  }

  function getState() {
    globalThis.state ??= {};
    if (!state[QUEST_CONFIG.stateKey]) {
      const questStates = {};
      const quests = getAllQuests();
      for (let i = 0; i < quests.length; i++) {
        questStates[quests[i].id] = getDefaultQuestState(quests[i]);
      }

      state[QUEST_CONFIG.stateKey] = {
        mainIndex: 0,
        mainCompletedIds: [],
        sideCompletedIds: [],
        questStates: questStates,
        lastCompletedMainTitle: null,
        lastScanFingerprint: "",
        currentMainLead: QUEST_CONFIG.initialMainLead
      };
    }
    return state[QUEST_CONFIG.stateKey];
  }

  function getQuestState(questId) {
    const s = getState();
    if (!s.questStates[questId]) {
      const quest = getAllQuests().find(function(q) { return q.id === questId; });
      if (quest) s.questStates[questId] = getDefaultQuestState(quest);
    }
    return s.questStates[questId] || null;
  }

  function getCurrentMainQuest() {
    const s = getState();
    const main = getMainQuests();
    return main[s.mainIndex] || null;
  }

  function getLatestText(explicitText) {
    if (safeString(explicitText).trim()) return safeString(explicitText);
    if (safeString(globalThis.text).trim()) return safeString(globalThis.text);

    const last = Array.isArray(globalThis.history) ? globalThis.history[globalThis.history.length - 1] : null;
    return safeString(last && (last.text || last.rawText));
  }

  function buildQuestCardEntry(quest, questState) {
    if (!quest || !questState) return "";
    if (questState.stage === "completed") return quest.completionEntry || quest.leadEntry || "";
    if (questState.stage === "mid") return quest.midEntry || quest.leadEntry || quest.startEntry || "";
    if (questState.stage === "started") return quest.startEntry || quest.leadEntry || "";
    return quest.activationEntry || quest.startEntry || quest.leadEntry || "";
  }

  function refreshQuestCard(quest) {
    const qs = getQuestState(quest.id);
    return upsertCard({
      title: quest.title,
      keys: quest.keys,
      entry: buildQuestCardEntry(quest, qs),
      description: "Auto-managed quest card.",
      pinned: false
    });
  }

  function getActiveSideQuests() {
    const sides = getSideQuests();
    return sides.filter(function(q) {
      const qs = getQuestState(q.id);
      return qs && (qs.stage === "started" || qs.stage === "mid");
    });
  }

  function buildLeadEntry() {
    const s = getState();
    const main = getCurrentMainQuest();
    const activeSides = getActiveSideQuests();

    const lines = [];
    lines.push("- Main: " + (main ? (s.currentMainLead || main.leadEntry || main.startEntry || "No current main lead.") : "No active main quest."));

    if (activeSides.length) {
      lines.push("- Side quests:");
      for (let i = 0; i < activeSides.length; i++) {
        const q = activeSides[i];
        const qs = getQuestState(q.id);
        const lead = qs.stage === "mid"
          ? (q.midLead || q.leadEntry || q.startEntry || q.shortTitle || q.title)
          : (q.leadEntry || q.startEntry || q.shortTitle || q.title);
        lines.push("  - " + (q.shortTitle || q.title) + ": " + lead);
      }
    } else {
      lines.push("- Side quests: none active.");
    }

    return lines.join("\n");
  }

  function buildProgressEntry() {
    const s = getState();
    const main = getMainQuests();
    const activeSides = getActiveSideQuests();

    const completedMainTitles = s.mainCompletedIds.length
      ? s.mainCompletedIds.map(function(id) {
          const q = main.find(function(item) { return item.id === id; });
          return q ? (q.shortTitle || q.title) : null;
        }).filter(Boolean).join("; ")
      : "none yet";

    const completedSideTitles = s.sideCompletedIds.length
      ? s.sideCompletedIds.map(function(id) {
          const q = getSideQuests().find(function(item) { return item.id === id; });
          return q ? (q.shortTitle || q.title) : null;
        }).filter(Boolean).join("; ")
      : "none yet";

    const activeSideTitles = activeSides.length
      ? activeSides.map(function(q) { return q.shortTitle || q.title; }).join("; ")
      : "none";

    return [
      "- " + QUEST_CONFIG.progressLabels.mainStatus + ": " + s.mainCompletedIds.length + "/" + main.length + " steps completed.",
      "- " + QUEST_CONFIG.progressLabels.mainLastCompleted + ": " + (s.lastCompletedMainTitle || "none") + ".",
      "- " + QUEST_CONFIG.progressLabels.mainCurrentLead + ": " + (s.currentMainLead || QUEST_CONFIG.initialMainLead),
      "- Completed main steps: " + completedMainTitles + ".",
      "- " + QUEST_CONFIG.progressLabels.activeSideQuests + ": " + activeSideTitles + ".",
      "- " + QUEST_CONFIG.progressLabels.completedSideQuests + ": " + completedSideTitles + "."
    ].join("\n");
  }

  function ensureMainQuestStarted() {
    const main = getCurrentMainQuest();
    if (!main) return;

    const qs = getQuestState(main.id);
    if (qs.stage === "inactive") {
      qs.stage = "started";
      qs.started = true;
      getState().currentMainLead = main.leadEntry || main.startEntry || QUEST_CONFIG.initialMainLead;
      refreshQuestCard(main);
    }
  }

  function refreshCoreCards() {
    ensureMainQuestStarted();

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
      entry: buildLeadEntry(),
      description: "Auto-managed current quest lead.",
      pinned: true
    });

    const currentMain = getCurrentMainQuest();
    if (currentMain) refreshQuestCard(currentMain);

    const activeSides = getActiveSideQuests();
    for (let i = 0; i < activeSides.length; i++) {
      refreshQuestCard(activeSides[i]);
    }
  }

  function startQuest(quest) {
    if (!quest) return false;
    const qs = getQuestState(quest.id);
    if (!qs || qs.stage !== "inactive") return false;

    qs.stage = "started";
    qs.started = true;

    if (quest.track === "main") {
      getState().currentMainLead = quest.leadEntry || quest.startEntry || QUEST_CONFIG.initialMainLead;
    }

    refreshQuestCard(quest);
    refreshCoreCards();

    try { state.message = "Quest started: " + quest.title; } catch (_) {}
    return true;
  }

  function progressQuest(quest) {
    if (!quest) return false;
    const qs = getQuestState(quest.id);
    if (!qs || qs.stage === "inactive" || qs.stage === "mid" || qs.stage === "completed") return false;

    qs.stage = "mid";

    if (quest.track === "main") {
      getState().currentMainLead = quest.midLead || quest.leadEntry || quest.startEntry || QUEST_CONFIG.initialMainLead;
    }

    refreshQuestCard(quest);
    refreshCoreCards();

    try { state.message = "Quest progressed: " + quest.title; } catch (_) {}
    return true;
  }

  function completeQuest(quest) {
    if (!quest) return false;
    const s = getState();
    const qs = getQuestState(quest.id);
    if (!qs || qs.stage === "completed") return false;

    qs.stage = "completed";
    qs.completed = true;

    refreshQuestCard(quest);

    if (quest.track === "main") {
      if (s.mainCompletedIds.indexOf(quest.id) === -1) s.mainCompletedIds.push(quest.id);
      s.lastCompletedMainTitle = quest.title;
      s.mainIndex = Math.min(s.mainIndex + 1, getMainQuests().length);
      s.currentMainLead = quest.nextLead || "The main quest advances.";
      const nextMain = getCurrentMainQuest();
      if (nextMain) startQuest(nextMain);
    } else if (quest.track === "side") {
      if (s.sideCompletedIds.indexOf(quest.id) === -1) s.sideCompletedIds.push(quest.id);
    }

    refreshCoreCards();

    try { state.message = "Quest completed: " + quest.title; } catch (_) {}
    return true;
  }

  function questActivationMatched(text, quest) {
    return textHasAnyRegex(text, quest.activationRegex) || textHasAnyTerm(text, quest.activationTerms);
  }

  function questMidMatched(text, quest) {
    return textHasAnyRegex(text, quest.midRegex) || textHasAnyTerm(text, quest.midTerms);
  }

  function questCompletionMatched(text, quest) {
    const body = safeString(text);
    if (!body.trim() || !quest) return false;
    if (textHasNegativeCompletion(body)) return false;
    if (textHasAnyRegex(body, quest.completionRegex)) return true;

    const hasAcquisition = textHasAcquisitionPattern(body, quest);
    if (!hasAcquisition) return false;

    const hasSpecificKey = textHasAnyTerm(body, quest.keyTerms);
    const hasLocation = textHasAnyTerm(body, quest.locationTerms);
    const keyNearVerb = textHasProximityPair(body, quest.keyTerms, quest.completionTerms, 40);
    const locationNearKey = textHasProximityPair(body, quest.locationTerms, quest.keyTerms, 120);

    if (hasSpecificKey && keyNearVerb) return true;
    if (hasLocation && hasSpecificKey && locationNearKey && keyNearVerb) return true;

    return false;
  }

  function buildScanFingerprint(hook, text) {
    const turnKey = getTurnKey();
    const compactText = safeString(text).trim().slice(0, 700);
    return turnKey + "::" + hook + "::" + compactText;
  }

  function scanQuests(text, hook) {
    const body = safeString(text);
    if (!body.trim()) {
      refreshCoreCards();
      return false;
    }

    const s = getState();
    const fingerprint = buildScanFingerprint(hook, body);
    if (s.lastScanFingerprint === fingerprint) {
      refreshCoreCards();
      return false;
    }
    s.lastScanFingerprint = fingerprint;

    let changed = false;

    // MAIN QUEST: only current main quest progresses
    const main = getCurrentMainQuest();
    if (main) {
      const mainState = getQuestState(main.id);

      if (mainState.stage === "inactive") {
        changed = startQuest(main) || changed;
      }

      if (mainState.stage === "started" && (main.midEntry || (main.midTerms && main.midTerms.length) || (main.midRegex && main.midRegex.length))) {
        if (questMidMatched(body, main)) {
          changed = progressQuest(main) || changed;
        }
      }

      if ((mainState.stage === "started" || mainState.stage === "mid") && questCompletionMatched(body, main)) {
        changed = completeQuest(main) || changed;
      }
    }

    // SIDE QUESTS: can activate/progress/complete independently
    const sides = getSideQuests();
    for (let i = 0; i < sides.length; i++) {
      const q = sides[i];
      const qs = getQuestState(q.id);

      if (qs.stage === "inactive" && questActivationMatched(body, q)) {
        changed = startQuest(q) || changed;
      }

      if (qs.stage === "started" && (q.midEntry || (q.midTerms && q.midTerms.length) || (q.midRegex && q.midRegex.length))) {
        if (questMidMatched(body, q)) {
          changed = progressQuest(q) || changed;
        }
      }

      if ((qs.stage === "started" || qs.stage === "mid") && questCompletionMatched(body, q)) {
        changed = completeQuest(q) || changed;
      }
    }

    refreshCoreCards();
    return changed;
  }

  function runCore(hook, explicitText) {
    if (hook !== "input" && hook !== "output") return false;
    refreshCoreCards();
    return scanQuests(getLatestText(explicitText), hook);
  }

  globalThis.QuestDirector = {
    config: QUEST_CONFIG,

    run: function(hook, explicitText) {
      try { return runCore(hook, explicitText); } catch (_) { return false; }
    },

    runInput: function(explicitText) {
      try { return runCore("input", explicitText); } catch (_) { return false; }
    },

    runOutput: function(explicitText) {
      try { return runCore("output", explicitText); } catch (_) { return false; }
    },

    start: function(id) {
      const q = getAllQuests().find(function(item) { return item.id === id; });
      return q ? startQuest(q) : false;
    },

    progress: function(id) {
      const q = getAllQuests().find(function(item) { return item.id === id; });
      return q ? progressQuest(q) : false;
    },

    complete: function(id) {
      const q = getAllQuests().find(function(item) { return item.id === id; });
      return q ? completeQuest(q) : false;
    },

    mark: function(id) {
      const q = getAllQuests().find(function(item) { return item.id === id; });
      return q ? completeQuest(q) : false;
    },

    refresh: function() {
      refreshCoreCards();
    },

    reset: function() {
      state[QUEST_CONFIG.stateKey] = null;
      delete state[QUEST_CONFIG.stateKey];
      getState();
      refreshCoreCards();
    }
  };

  globalThis.QuestDirectorHooks = {
    input: function(text) {
      try { globalThis.QuestDirector.run("input", text); } catch (_) {}
      return text;
    },
    output: function(text) {
      try { globalThis.QuestDirector.run("output", text); } catch (_) {}
      return text;
    }
  };

  if (typeof globalThis.InnerSelf === "function" && !globalThis.InnerSelf.__questDirectorWrapped) {
    const original = globalThis.InnerSelf;
    const wrapped = function(hook) {
      const result = original(hook);
      try { globalThis.QuestDirector.run(hook, globalThis.text); } catch (_) {}
      return result;
    };
    wrapped.__questDirectorWrapped = true;
    globalThis.InnerSelf = wrapped;
  }

  try {
    globalThis.QuestDirector.refresh();
  } catch (_) {}
})();
