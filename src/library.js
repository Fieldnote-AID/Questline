/* === Hybrid Quest Director: Multi-Linear Version ===

Paste near the END of library.js

WHAT THIS VERSION DOES
- Supports MULTIPLE linear quest chains at once
- Each linear chain has its own progress, lead, and autoStart behavior
- Supports optional SIDE quests that can start, progress, and complete independently
- Lets either player input OR AI output trigger quest updates
- Creates/updates quest cards at START / MID / COMPLETION
- Updates pinned Progress + Current Lead cards

HOW TO USE
1. Edit QUEST_CONFIG only
2. Put ordered questline steps in events with:
   - track: "linear"
   - chain: "main" / "guild" / "investigation" / etc
   - order: 1, 2, 3...
3. Put side quests in events with track: "side"
4. For a questline that should start immediately on scenario kickoff:
   - set QUEST_CONFIG.linearTracks.<chainId>.autoStart = true
5. For a questline that should NOT start immediately:
   - set QUEST_CONFIG.linearTracks.<chainId>.autoStart = false
   - then start it via:
     a) the first quest's activationTerms / activationRegex
     b) QuestDirector.startChain("chainId")
     c) QuestDirector.start("questId") on that chain's current step
6. Backward compatibility:
   - track: "main" is treated like track: "linear", chain: "main"

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
- QuestDirector.startChain("chainId")
- QuestDirector.refresh()
- QuestDirector.reset()
*/

(function installHybridQuestDirector() {
  "use strict";

  const QUEST_CONFIG = {
    stateKey: "HybridQuestDirector_MultiLinear_Template",
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

    // Per-chain config.
    // autoStart controls whether the FIRST step in that chain begins automatically
    // during scenario kickoff / refresh.
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
    },

    events: [
      // =========================
      // LINEAR CHAIN: MAIN
      // =========================
      {
        id: "main_relic_map",
        track: "linear",
        chain: "main",
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
        activationTerms: [ "hidden map", "relic map", "map fragment" ],
        activationRegex: [
          /\b(a hidden map surfaced|someone found part of a map)\b/i
        ],
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
        track: "linear",
        chain: "main",
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

      // =========================
      // LINEAR CHAIN: GUILD
      // =========================
      {
        id: "guild_invitation",
        track: "linear",
        chain: "guild",
        mode: "linear",
        order: 1,
        title: "Guild Quest — The Invitation",
        shortTitle: "The Invitation",
        keys: "guild invitation, sealed invitation, guild summons",
        startEntry: "A private guild has begun to take interest.",
        leadEntry: "Follow the invitation and learn what the guild wants.",
        midEntry: "The guild's offer comes with conditions and hidden motives.",
        midLead: "Decide whether to accept the guild's terms or push deeper for answers.",
        completionEntry: "The guild's invitation has been answered, and the relationship is now real.",
        nextLead: "The guild expects a proving task before offering trust.",
        activationTerms: [ "guild invitation", "sealed invitation", "guild summons", "private guild" ],
        activationRegex: [
          /\b(an invitation arrived|the guild reached out|someone summoned them to the guild)\b/i
        ],
        midTerms: [ "terms", "conditions", "hidden agenda", "offer", "suspicious contract" ],
        midRegex: [
          /\b(the offer had conditions|the guild wanted something in return)\b/i
        ],
        locationTerms: [ "guildhall", "manor", "hall", "chapterhouse", "meeting room" ],
        completionTerms: [ "accepted", "answered", "met", "joined", "agreed", "entered" ],
        keyTerms: [ "guild invitation", "invitation", "guild summons", "offer" ],
        completionRegex: [
          /\b(the invitation was accepted|they answered the guild's summons|the guild meeting was concluded)\b/i
        ]
      },
      {
        id: "guild_proving_task",
        track: "linear",
        chain: "guild",
        mode: "linear",
        order: 2,
        title: "Guild Quest — The Proving Task",
        shortTitle: "The Proving Task",
        keys: "guild proving task, initiation task, guild trial",
        startEntry: "The guild has assigned a proving task.",
        leadEntry: "Complete the proving task and decide how much of yourself to reveal.",
        midEntry: "The proving task is more dangerous than the guild admitted.",
        midLead: "Finish the task without giving the guild more leverage than it deserves.",
        completionEntry: "The proving task is done, and the guild must now decide what comes next.",
        nextLead: "The guild questline is complete.",
        midTerms: [ "ambush", "test", "set up", "dangerous assignment", "trap" ],
        midRegex: [
          /\b(the test was real|the task was a trap|the proving task went wrong)\b/i
        ],
        locationTerms: [ "ruins", "vault", "street", "warehouse", "crypt" ],
        completionTerms: [ "completed", "survived", "finished", "delivered", "returned", "proved" ],
        keyTerms: [ "proving task", "guild trial", "initiation task", "assignment" ],
        completionRegex: [
          /\b(the proving task was complete|they survived the guild trial|the initiation task was finished)\b/i
        ]
      },

      // =========================
      // SIDE QUEST EXAMPLE
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

  function humanizeId(text) {
    const raw = safeString(text).replace(/[_-]+/g, " ").trim();
    if (!raw) return "Questline";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function getAllQuests() {
    return Array.isArray(QUEST_CONFIG.events) ? QUEST_CONFIG.events : [];
  }

  function getQuestTrackType(quest) {
    if (!quest) return "";
    if (quest.track === "side") return "side";
    if (quest.track === "linear") return "linear";
    if (quest.track === "main") return "linear";
    if (quest.mode === "linear") return "linear";
    return "";
  }

  function getQuestChainId(quest) {
    if (getQuestTrackType(quest) !== "linear") return "";
    const raw = safeString(
      quest.chain ||
      quest.line ||
      (quest.track === "main" ? "main" : "")
    ).trim();
    return raw || "main";
  }

  function buildDefaultLinearTrackConfig(chainId) {
    const isMain = chainId === "main";
    const fallbackLead = isMain
      ? safeString(QUEST_CONFIG.initialMainLead || "A first clue points toward the opening step of a larger quest.")
      : "No active lead.";

    return {
      label: isMain ? "Main Quest" : humanizeId(chainId),
      autoStart: isMain,
      initialLead: fallbackLead,
      inactiveLead: fallbackLead,
      completeLead: isMain ? "The main quest is complete." : (humanizeId(chainId) + " is complete.")
    };
  }

  function getLinearTrackConfigs() {
    const map = {};
    const raw = QUEST_CONFIG.linearTracks;

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const configIds = Object.keys(raw);
      for (let i = 0; i < configIds.length; i++) {
        const chainId = configIds[i];
        const base = buildDefaultLinearTrackConfig(chainId);
        const cfg = raw[chainId] || {};
        map[chainId] = {
          label: safeString(cfg.label) || base.label,
          autoStart: typeof cfg.autoStart === "boolean" ? cfg.autoStart : base.autoStart,
          initialLead: safeString(cfg.initialLead) || base.initialLead,
          inactiveLead: safeString(cfg.inactiveLead) || safeString(cfg.initialLead) || base.inactiveLead,
          completeLead: safeString(cfg.completeLead) || base.completeLead
        };
      }
    }

    const quests = getAllQuests();
    for (let i = 0; i < quests.length; i++) {
      const q = quests[i];
      if (getQuestTrackType(q) !== "linear") continue;
      const chainId = getQuestChainId(q);
      if (!map[chainId]) {
        map[chainId] = buildDefaultLinearTrackConfig(chainId);
      }
    }

    if (!Object.keys(map).length) {
      map.main = buildDefaultLinearTrackConfig("main");
    }

    return map;
  }

  function getLinearTrackIds() {
    return Object.keys(getLinearTrackConfigs());
  }

  function getLinearTrackConfig(chainId) {
    const configs = getLinearTrackConfigs();
    return configs[chainId] || buildDefaultLinearTrackConfig(chainId);
  }

  function getLinearQuests(chainId) {
    return getAllQuests()
      .filter(function(q) {
        return getQuestTrackType(q) === "linear" && getQuestChainId(q) === chainId;
      })
      .sort(function(a, b) {
        return (a.order || 0) - (b.order || 0);
      });
  }

  function getSideQuests() {
    return getAllQuests().filter(function(q) {
      return getQuestTrackType(q) === "side";
    });
  }

  function getDefaultQuestState(quest) {
    return {
      id: quest.id,
      stage: "inactive",
      started: false,
      completed: false
    };
  }

  function getDefaultLinearTrackState(chainId) {
    const cfg = getLinearTrackConfig(chainId);
    return {
      id: chainId,
      active: false,
      currentIndex: 0,
      completedIds: [],
      lastCompletedTitle: null,
      currentLead: safeString(cfg.initialLead || cfg.inactiveLead || "No active lead.")
    };
  }

  function getState() {
    globalThis.state ??= {};
    state[QUEST_CONFIG.stateKey] ??= {};

    const s = state[QUEST_CONFIG.stateKey];
    s.questStates ??= {};
    s.linearTracks ??= {};
    s.sideCompletedIds = Array.isArray(s.sideCompletedIds) ? s.sideCompletedIds : [];
    s.lastScanFingerprint = typeof s.lastScanFingerprint === "string" ? s.lastScanFingerprint : "";

    const quests = getAllQuests();
    for (let i = 0; i < quests.length; i++) {
      const q = quests[i];
      if (!s.questStates[q.id]) {
        s.questStates[q.id] = getDefaultQuestState(q);
      }
    }

    const chainIds = getLinearTrackIds();
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      if (!s.linearTracks[chainId]) {
        s.linearTracks[chainId] = getDefaultLinearTrackState(chainId);
      } else {
        const ls = s.linearTracks[chainId];
        ls.active = !!ls.active;
        ls.currentIndex = Number.isInteger(ls.currentIndex) ? ls.currentIndex : 0;
        ls.completedIds = Array.isArray(ls.completedIds) ? ls.completedIds : [];
        ls.lastCompletedTitle = safeString(ls.lastCompletedTitle) || null;
        ls.currentLead = safeString(ls.currentLead) || getDefaultLinearTrackState(chainId).currentLead;
      }
    }

    return s;
  }

  function getQuestState(questId) {
    const s = getState();
    if (!s.questStates[questId]) {
      const quest = getAllQuests().find(function(q) { return q.id === questId; });
      if (quest) s.questStates[questId] = getDefaultQuestState(quest);
    }
    return s.questStates[questId] || null;
  }

  function getLinearTrackState(chainId) {
    const s = getState();
    if (!s.linearTracks[chainId]) {
      s.linearTracks[chainId] = getDefaultLinearTrackState(chainId);
    }
    return s.linearTracks[chainId];
  }

  function getCurrentLinearQuest(chainId) {
    const qs = getLinearTrackState(chainId);
    const quests = getLinearQuests(chainId);
    return quests[qs.currentIndex] || null;
  }

  function isLinearTrackComplete(chainId) {
    const quests = getLinearQuests(chainId);
    if (!quests.length) return false;
    const ls = getLinearTrackState(chainId);
    return ls.completedIds.length >= quests.length || ls.currentIndex >= quests.length;
  }

  function getInactiveTrackLead(chainId) {
    const cfg = getLinearTrackConfig(chainId);
    return safeString(cfg.inactiveLead || cfg.initialLead || "No active lead.");
  }

  function getDefaultTrackLead(chainId) {
    const cfg = getLinearTrackConfig(chainId);
    return safeString(cfg.initialLead || cfg.inactiveLead || "No active lead.");
  }

  function getCompleteTrackLead(chainId) {
    const cfg = getLinearTrackConfig(chainId);
    return safeString(cfg.completeLead || (cfg.label ? cfg.label + " is complete." : "Questline is complete."));
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

  function ensureAutoStartedLinearTracks() {
    const chainIds = getLinearTrackIds();

    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const cfg = getLinearTrackConfig(chainId);
      const ls = getLinearTrackState(chainId);

      if (!cfg.autoStart || ls.active || isLinearTrackComplete(chainId)) continue;

      const currentQuest = getCurrentLinearQuest(chainId);
      if (!currentQuest) continue;

      const currentState = getQuestState(currentQuest.id);
      if (!currentState || currentState.stage !== "inactive") continue;

      ls.active = true;
      ls.currentLead = currentQuest.leadEntry || currentQuest.startEntry || getDefaultTrackLead(chainId);
      currentState.stage = "started";
      currentState.started = true;

      refreshQuestCard(currentQuest);
    }
  }

  function buildLeadEntry() {
    const lines = [];
    const chainIds = getLinearTrackIds();
    const activeSides = getActiveSideQuests();

    lines.push("- " + (QUEST_CONFIG.progressLabels.linearTracks || "Linear questlines") + ":");
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const cfg = getLinearTrackConfig(chainId);
      const ls = getLinearTrackState(chainId);
      const currentQuest = getCurrentLinearQuest(chainId);

      let lead;
      if (isLinearTrackComplete(chainId)) {
        lead = getCompleteTrackLead(chainId);
      } else if (!ls.active) {
        lead = getInactiveTrackLead(chainId);
      } else if (currentQuest) {
        const currentState = getQuestState(currentQuest.id);
        if (currentState && currentState.stage === "mid") {
          lead = currentQuest.midLead || ls.currentLead || currentQuest.leadEntry || currentQuest.startEntry || getDefaultTrackLead(chainId);
        } else {
          lead = ls.currentLead || currentQuest.leadEntry || currentQuest.startEntry || getDefaultTrackLead(chainId);
        }
      } else {
        lead = getCompleteTrackLead(chainId);
      }

      lines.push("  - " + cfg.label + ": " + lead);
    }

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
    const lines = [];
    const chainIds = getLinearTrackIds();
    const activeSides = getActiveSideQuests();

    lines.push("- " + (QUEST_CONFIG.progressLabels.linearTracks || "Linear questlines") + ":");
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const cfg = getLinearTrackConfig(chainId);
      const ls = getLinearTrackState(chainId);
      const quests = getLinearQuests(chainId);

      const completedTitles = ls.completedIds.length
        ? ls.completedIds.map(function(id) {
            const q = quests.find(function(item) { return item.id === id; });
            return q ? (q.shortTitle || q.title) : null;
          }).filter(Boolean).join("; ")
        : "none yet";

      let status;
      if (!quests.length) {
        status = "no steps configured";
      } else if (isLinearTrackComplete(chainId)) {
        status = "complete (" + ls.completedIds.length + "/" + quests.length + ")";
      } else if (!ls.active) {
        status = "inactive (0/" + quests.length + ")";
      } else {
        status = ls.completedIds.length + "/" + quests.length + " steps completed";
      }

      lines.push("  - " + cfg.label + ": " + status + ".");
      lines.push("    - Last completed: " + (ls.lastCompletedTitle || "none") + ".");
      lines.push("    - Completed steps: " + completedTitles + ".");
    }

    const completedSideTitles = getState().sideCompletedIds.length
      ? getState().sideCompletedIds.map(function(id) {
          const q = getSideQuests().find(function(item) { return item.id === id; });
          return q ? (q.shortTitle || q.title) : null;
        }).filter(Boolean).join("; ")
      : "none yet";

    const activeSideTitles = activeSides.length
      ? activeSides.map(function(q) { return q.shortTitle || q.title; }).join("; ")
      : "none";

    lines.push("- " + (QUEST_CONFIG.progressLabels.activeSideQuests || "Active side quests") + ": " + activeSideTitles + ".");
    lines.push("- " + (QUEST_CONFIG.progressLabels.completedSideQuests || "Completed side quests") + ": " + completedSideTitles + ".");

    return lines.join("\n");
  }

  function refreshCoreCards() {
    ensureAutoStartedLinearTracks();

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

    const chainIds = getLinearTrackIds();
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const ls = getLinearTrackState(chainId);
      const currentQuest = getCurrentLinearQuest(chainId);
      if (ls.active && currentQuest) {
        refreshQuestCard(currentQuest);
      }
    }

    const activeSides = getActiveSideQuests();
    for (let i = 0; i < activeSides.length; i++) {
      refreshQuestCard(activeSides[i]);
    }
  }

  function startQuest(quest, options) {
    options = options || {};
    if (!quest) return false;

    const questTrack = getQuestTrackType(quest);
    const qs = getQuestState(quest.id);
    if (!qs || qs.stage !== "inactive") return false;

    if (questTrack === "linear") {
      const chainId = getQuestChainId(quest);
      const currentQuest = getCurrentLinearQuest(chainId);
      if (!currentQuest || currentQuest.id !== quest.id) return false;

      const ls = getLinearTrackState(chainId);
      ls.active = true;
      ls.currentLead = quest.leadEntry || quest.startEntry || getDefaultTrackLead(chainId);
    }

    qs.stage = "started";
    qs.started = true;

    refreshQuestCard(quest);
    if (!options.skipRefresh) refreshCoreCards();

    if (!options.silent) {
      try { state.message = "Quest started: " + quest.title; } catch (_) {}
    }

    return true;
  }

  function progressQuest(quest, options) {
    options = options || {};
    if (!quest) return false;

    const questTrack = getQuestTrackType(quest);
    const qs = getQuestState(quest.id);
    if (!qs || qs.stage === "inactive" || qs.stage === "mid" || qs.stage === "completed") return false;

    if (questTrack === "linear") {
      const chainId = getQuestChainId(quest);
      const currentQuest = getCurrentLinearQuest(chainId);
      if (!currentQuest || currentQuest.id !== quest.id) return false;

      const ls = getLinearTrackState(chainId);
      ls.active = true;
      ls.currentLead = quest.midLead || quest.leadEntry || quest.startEntry || getDefaultTrackLead(chainId);
    }

    qs.stage = "mid";

    refreshQuestCard(quest);
    if (!options.skipRefresh) refreshCoreCards();

    if (!options.silent) {
      try { state.message = "Quest progressed: " + quest.title; } catch (_) {}
    }

    return true;
  }

  function completeQuest(quest, options) {
    options = options || {};
    if (!quest) return false;

    const s = getState();
    const questTrack = getQuestTrackType(quest);
    const qs = getQuestState(quest.id);
    if (!qs || qs.stage === "completed") return false;

    if (questTrack === "linear") {
      const chainId = getQuestChainId(quest);
      const currentQuest = getCurrentLinearQuest(chainId);
      if (!currentQuest || currentQuest.id !== quest.id) return false;

      const ls = getLinearTrackState(chainId);
      const chainQuests = getLinearQuests(chainId);

      qs.stage = "completed";
      qs.completed = true;
      refreshQuestCard(quest);

      if (ls.completedIds.indexOf(quest.id) === -1) ls.completedIds.push(quest.id);
      ls.lastCompletedTitle = quest.title;
      ls.currentIndex = Math.min(ls.currentIndex + 1, chainQuests.length);

      const nextQuest = getCurrentLinearQuest(chainId);
      if (nextQuest) {
        const nextState = getQuestState(nextQuest.id);
        if (nextState && nextState.stage === "inactive") {
          nextState.stage = "started";
          nextState.started = true;
        }
        ls.active = true;
        ls.currentLead = nextQuest.leadEntry || nextQuest.startEntry || quest.nextLead || getDefaultTrackLead(chainId);
        refreshQuestCard(nextQuest);
      } else {
        ls.currentLead = quest.nextLead || getCompleteTrackLead(chainId);
      }
    } else {
      qs.stage = "completed";
      qs.completed = true;
      refreshQuestCard(quest);

      if (s.sideCompletedIds.indexOf(quest.id) === -1) s.sideCompletedIds.push(quest.id);
    }

    if (!options.skipRefresh) refreshCoreCards();

    if (!options.silent) {
      try { state.message = "Quest completed: " + quest.title; } catch (_) {}
    }

    return true;
  }

  function startChain(chainId, options) {
    options = options || {};
    const currentQuest = getCurrentLinearQuest(chainId);
    if (!currentQuest) return false;

    const ls = getLinearTrackState(chainId);
    if (isLinearTrackComplete(chainId)) return false;

    if (ls.active) {
      const qs = getQuestState(currentQuest.id);
      if (qs && (qs.stage === "started" || qs.stage === "mid")) return false;
      if (qs && qs.stage === "inactive") {
        return startQuest(currentQuest, options);
      }
    }

    ls.active = true;
    return startQuest(currentQuest, options);
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

    // LINEAR CHAINS: only current quest in each chain can progress
    const chainIds = getLinearTrackIds();
    for (let i = 0; i < chainIds.length; i++) {
      const chainId = chainIds[i];
      const cfg = getLinearTrackConfig(chainId);
      const ls = getLinearTrackState(chainId);
      const currentQuest = getCurrentLinearQuest(chainId);

      if (!currentQuest || isLinearTrackComplete(chainId)) continue;

      if (!ls.active) {
        const shouldStart =
          cfg.autoStart ||
          questActivationMatched(body, currentQuest) ||
          questMidMatched(body, currentQuest) ||
          questCompletionMatched(body, currentQuest);

        if (shouldStart) {
          changed = startQuest(currentQuest, { skipRefresh: true, silent: true }) || changed;
        }
      }

      const currentState = getQuestState(currentQuest.id);
      if (!currentState || currentState.stage === "inactive" || currentState.stage === "completed") {
        continue;
      }

      if (currentState.stage === "started" && (currentQuest.midEntry || (currentQuest.midTerms && currentQuest.midTerms.length) || (currentQuest.midRegex && currentQuest.midRegex.length))) {
        if (questMidMatched(body, currentQuest)) {
          changed = progressQuest(currentQuest, { skipRefresh: true, silent: true }) || changed;
        }
      }

      const stateAfterMid = getQuestState(currentQuest.id);
      if (stateAfterMid && (stateAfterMid.stage === "started" || stateAfterMid.stage === "mid") && questCompletionMatched(body, currentQuest)) {
        changed = completeQuest(currentQuest, { skipRefresh: true, silent: true }) || changed;
      }
    }

    // SIDE QUESTS: can activate/progress/complete independently
    const sides = getSideQuests();
    for (let i = 0; i < sides.length; i++) {
      const q = sides[i];
      const qs = getQuestState(q.id);

      if (qs.stage === "inactive" && questActivationMatched(body, q)) {
        changed = startQuest(q, { skipRefresh: true, silent: true }) || changed;
      }

      const stateAfterStart = getQuestState(q.id);
      if (stateAfterStart && stateAfterStart.stage === "started" && (q.midEntry || (q.midTerms && q.midTerms.length) || (q.midRegex && q.midRegex.length))) {
        if (questMidMatched(body, q)) {
          changed = progressQuest(q, { skipRefresh: true, silent: true }) || changed;
        }
      }

      const stateAfterMid = getQuestState(q.id);
      if (stateAfterMid && (stateAfterMid.stage === "started" || stateAfterMid.stage === "mid") && questCompletionMatched(body, q)) {
        changed = completeQuest(q, { skipRefresh: true, silent: true }) || changed;
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

    startChain: function(chainId) {
      return startChain(chainId);
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
