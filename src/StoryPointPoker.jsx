import React, { useState, useEffect } from "react";
import { Info, Globe, Copy, Check, MessageCircle, Mail, Share2, Lock, ClipboardList } from "lucide-react";

import { C } from "./theme";
import { DECKS } from "./config/decks";
import { translations, LANG_LABELS, SPEECH_LOCALES } from "./i18n/translations";
import { avatarEmoji, generateRoomCode, cardToNumber, validateName, isRoomFull } from "./utils/helpers";
import { NAME_MAX_LENGTH, MAX_PLAYERS_PER_ROOM } from "./config/limits";
import { computeAlignment } from "./utils/alignment";

import PlayersPanel from "./components/players/PlayersPanel";
import RoomFullNotice from "./components/players/RoomFullNotice";
import AlignmentPanel from "./components/insights/AlignmentPanel";
import ScoreTrendChart from "./components/insights/ScoreTrendChart";
import TimerWidget from "./components/timer/TimerWidget";
import PokerCard from "./components/deck/PokerCard";
import PieResult from "./components/insights/PieResult";
import SprintGoalBanner from "./components/sprint/SprintGoalBanner";
import DefinitionOfDoneField from "./components/sprint/DefinitionOfDoneField";
import AuthMenu from "./components/auth/AuthMenu";

/* Used only by the moderator's "simulate a player joining" demo control (see RoomFullNotice
   for why this exists — there's no real backend/routing yet for someone to actually join via
   the invite link). Not used anywhere else in the app. */
const DEMO_JOINERS = [
  { name: "Priya", emoji: "🐼" },
  { name: "Aman", emoji: "🐧" },
  { name: "Sara", emoji: "🦊" },
  { name: "Wei", emoji: "🐸" },
  { name: "Diego", emoji: "🤖" },
  { name: "Fatima", emoji: "🎮" },
  { name: "Liam", emoji: "🐼" },
  { name: "Noor", emoji: "🦊" },
];

export default function StoryPointPoker() {
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const speechLang = SPEECH_LOCALES[lang] || "en-US";

  const [view, setView] = useState("create"); // create | invite | voting | results
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(null);
  const [players, setPlayers] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [roundKey, setRoundKey] = useState(0);

  const [deckType, setDeckType] = useState("scrum");
  const [disabledCards, setDisabledCards] = useState([]);
  const [deckSettingsOpen, setDeckSettingsOpen] = useState(false);
  const activeCards = DECKS[deckType].cards.filter((v) => !disabledCards.includes(v));

  const [roundHistory, setRoundHistory] = useState([]);

  const [roomCode, setRoomCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);
  const inviteLink = roomCode ? `https://storypointpoker.app/room/${roomCode}` : "";

  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintGoalDraft, setSprintGoalDraft] = useState("");
  const [editingSprintGoal, setEditingSprintGoal] = useState(false);

  const [storyDoD, setStoryDoD] = useState("");
  const [storyDoDDraft, setStoryDoDDraft] = useState("");
  const [editingDoD, setEditingDoD] = useState(false);

  const [roomFullNoticeOpen, setRoomFullNoticeOpen] = useState(false);

  function handleCreateRoom() {
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }
    setNameError(null);
    const trimmed = name.trim();
    setPlayers([{ id: "self", name: trimmed, emoji: avatarEmoji(trimmed), isModerator: true, isObserver: false, vote: null }]);
    setRoomCode(generateRoomCode());
    setView("invite");
  }

  function handleStartEstimating() {
    const self = players.find((p) => p.id === "self");
    if (!self || !self.isModerator) return;
    setPlayers((prev) => (prev.some((p) => p.id === "p2") || isRoomFull(prev) ? prev : [...prev, { id: "p2", name: "Rahul", emoji: "🎮", isModerator: false, isObserver: false, vote: null }]));
    setView("voting");
  }

  // feature: room capacity — real, production-ready cap + blocking-message UI. Since there's
  // no backend/routing yet for a real second browser to actually join via the invite link,
  // this control lets the moderator simulate that join so the cap and the exact message an
  // 11th player would see can be tested today.
  function handleSimulateJoin() {
    if (isRoomFull(players)) {
      setRoomFullNoticeOpen(true);
      return;
    }
    const pick = DEMO_JOINERS[(players.length - 1) % DEMO_JOINERS.length];
    const newId = `demo-${Date.now()}`;
    setPlayers((prev) => [...prev, { id: newId, name: pick.name, emoji: pick.emoji, isModerator: false, isObserver: false, vote: null }]);
  }

  function copyInviteLink() {
    if (!inviteLink) return;
    const onCopied = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink).then(onCopied).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = inviteLink;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        onCopied();
      } catch (e) {
        /* clipboard unsupported — the link is still visible and selectable manually */
      }
      document.body.removeChild(ta);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`Join our Planning Poker session: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }
  function shareEmail() {
    const subject = encodeURIComponent(t.appTitle);
    const body = encodeURIComponent(`Join our Planning Poker session: ${inviteLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  }
  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: t.appTitle, text: t.inviteHeading, url: inviteLink }).catch(() => {});
    }
  }

  function startEditSprintGoal() {
    setSprintGoalDraft(sprintGoal);
    setEditingSprintGoal(true);
  }
  function saveSprintGoal() {
    setSprintGoal(sprintGoalDraft.trim());
    setEditingSprintGoal(false);
  }
  function startEditDoD() {
    setStoryDoDDraft(storyDoD);
    setEditingDoD(true);
  }
  function saveDoD() {
    setStoryDoD(storyDoDDraft.trim());
    setEditingDoD(false);
  }

  function handleSelectCard(value) {
    if (revealed) return;
    setPlayers((prev) => prev.map((p) => (p.id === "self" && !p.isObserver ? { ...p, vote: value } : p)));
  }

  function handleReveal() {
    const self = players.find((p) => p.id === "self");
    if (!self || !self.isModerator || self.vote == null) return;
    const options = activeCards.filter((v) => v !== "?");
    const updated = players.map((p) => (p.id === "self" || p.isObserver ? p : { ...p, vote: options[Math.floor(Math.random() * options.length)] }));
    setPlayers(updated);
    const score = computeAlignment(updated, activeCards);
    if (score != null) setRoundHistory((prev) => [...prev, score]);
    setRevealed(true);
    setView("results");
  }

  function handleStartNewRound() {
    const self = players.find((p) => p.id === "self");
    if (!self || !self.isModerator) return;
    setPlayers((prev) => prev.map((p) => ({ ...p, vote: null })));
    setRevealed(false);
    setRoundHistory([]);
    setRoundKey((k) => k + 1);
    setStoryDoD("");
    setEditingDoD(false);
    setView("voting");
  }

  function handleReEstimate() {
    const self = players.find((p) => p.id === "self");
    if (!self || !self.isModerator) return;
    setPlayers((prev) => prev.map((p) => ({ ...p, vote: null })));
    setRevealed(false);
    setView("voting");
  }

  function toggleModerator(id) {
    setPlayers((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;
      if (!target.isModerator) {
        return prev.map((p) => ({ ...p, isModerator: p.id === id }));
      }
      const successor = prev.find((p) => p.id !== id);
      return prev.map((p) => ({ ...p, isModerator: successor ? p.id === successor.id : p.id === id }));
    });
  }
  function toggleObserver(id) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, isObserver: !p.isObserver, vote: null } : p)));
  }
  function renamePlayer(id, newName) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
    if (id === "self") setName(newName);
  }
  function leaveRoom(id) {
    if (id === "self") {
      setView("create");
      setPlayers([]);
      setRoomCode(null);
      setSprintGoal("");
      setEditingSprintGoal(false);
      setStoryDoD("");
      setEditingDoD(false);
      setNameError(null);
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function changeDeckType(newType) {
    setDeckType(newType);
    setDisabledCards([]);
    setPlayers((prev) => prev.map((p) => ({ ...p, vote: null })));
    setRevealed(false);
  }
  function toggleCardEnabled(value) {
    setDisabledCards((prev) => {
      const isCurrentlyActive = !prev.includes(value);
      if (isCurrentlyActive) {
        const remainingNumeric = DECKS[deckType].cards.filter((v) => v !== "?" && !prev.includes(v));
        if (value !== "?" && remainingNumeric.length <= 2) return prev;
        return [...prev, value];
      }
      return prev.filter((v) => v !== value);
    });
    setPlayers((prev) => prev.map((p) => ({ ...p, vote: null })));
    setRevealed(false);
  }

  const self = players.find((p) => p.id === "self");
  const votesForPie = revealed ? players.filter((p) => !p.isObserver).map((p) => ({ value: p.vote })) : [];
  const currentScore = roundHistory.length ? roundHistory[roundHistory.length - 1] : null;

  // feature: Moderator Insights — Average Points (numeric mean) and Average Card (nearest card in the active deck)
  const revealedVoters = revealed ? players.filter((p) => !p.isObserver && p.vote != null && p.vote !== "?") : [];
  const activeNumericCards = activeCards.filter((v) => v !== "?");
  const numericVoteValues = revealedVoters.map((p) => cardToNumber(p.vote)).filter((v) => v != null);
  const isNumericDeck = revealedVoters.length > 0 && numericVoteValues.length === revealedVoters.length;
  const avgPoints = isNumericDeck ? Math.round(numericVoteValues.reduce((a, b) => a + b, 0) / numericVoteValues.length) : null;
  let avgCard = null;
  if (revealedVoters.length > 0) {
    if (isNumericDeck && avgPoints != null) {
      avgCard = activeNumericCards.reduce((closest, c) => {
        const cn = cardToNumber(c);
        if (cn == null) return closest;
        if (closest == null) return c;
        return Math.abs(cn - avgPoints) < Math.abs(cardToNumber(closest) - avgPoints) ? c : closest;
      }, null);
    } else {
      const indices = revealedVoters.map((p) => activeNumericCards.indexOf(p.vote)).filter((i) => i >= 0);
      if (indices.length) {
        const avgIdx = Math.round(indices.reduce((a, b) => a + b, 0) / indices.length);
        avgCard = activeNumericCards[avgIdx] ?? null;
      }
    }
  }

  return (
    <div
      onClick={() => {
        if (openMenuFor) setOpenMenuFor(null);
        if (deckSettingsOpen) setDeckSettingsOpen(false);
      }}
      style={{ minHeight: 480, fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: C.bg }}
      className="w-full"
    >
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3 bg-white" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: C.primary }}>
            P
          </div>
          <h1 className="font-semibold text-base tracking-tight" style={{ color: C.navy }}>
            {t.appTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1" style={{ color: C.textMuted }}>
            <Globe className="w-4 h-4" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer" style={{ color: C.navy }}>
              {Object.keys(translations).map((code) => (
                <option key={code} value={code}>
                  {LANG_LABELS[code]}
                </option>
              ))}
            </select>
          </div>
          {view === "create" ? (
            <>
              <Info className="w-5 h-5 cursor-pointer" style={{ color: C.textMuted }} />
              <AuthMenu t={t} />
            </>
          ) : (
            <>
              <span className="text-sm font-medium" style={{ color: C.navy }}>
                {self?.name}
              </span>
              <AuthMenu t={t} />
            </>
          )}
        </div>
      </header>

      {/* CREATE ROOM VIEW */}
      {view === "create" && (
        <div className="max-w-screen-2xl mx-auto flex flex-col items-center text-center px-4 pt-16 sm:pt-24 pb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: C.navy }}>
            {t.createHeading}
          </h2>
          <p className="text-sm sm:text-base mb-8" style={{ color: C.textMuted }}>
            {t.createSub}
          </p>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
            placeholder={t.namePlaceholder}
            maxLength={NAME_MAX_LENGTH}
            aria-invalid={!!nameError}
            className="w-full max-w-xs sm:max-w-sm rounded px-4 py-3 focus:outline-none border"
            style={{ borderColor: nameError ? C.alarmBorder : C.border, color: C.navy }}
          />
          {nameError ? (
            <p className="text-xs mt-1.5 mb-4" style={{ color: C.alarmText }}>
              {t[nameError]}
            </p>
          ) : (
            <div className="mb-6" />
          )}
          <button
            onClick={handleCreateRoom}
            className="font-medium text-sm rounded px-6 py-2.5 w-full max-w-xs sm:w-auto text-white"
            style={{ backgroundColor: C.primary, color: "#fff", cursor: "pointer" }}
          >
            {t.createRoom}
          </button>
        </div>
      )}

      {/* INVITE / WAITING ROOM VIEW */}
      {view === "invite" && (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-16 lg:items-start">
            <div className="lg:col-span-5 xl:col-span-4">
              <PlayersPanel
                t={t}
                players={players}
                revealed={false}
                openMenuFor={openMenuFor}
                setOpenMenuFor={setOpenMenuFor}
                onToggleModerator={toggleModerator}
                onToggleObserver={toggleObserver}
                onRename={renamePlayer}
                onLeave={leaveRoom}
                isModerator={!!self?.isModerator}
                deckType={deckType}
                onChangeDeckType={changeDeckType}
                disabledCards={disabledCards}
                onToggleCard={toggleCardEnabled}
                deckSettingsOpen={deckSettingsOpen}
                setDeckSettingsOpen={setDeckSettingsOpen}
                onSimulateJoin={handleSimulateJoin}
              />

              <div className="mt-4">
                <SprintGoalBanner
                  t={t}
                  goal={sprintGoal}
                  draft={sprintGoalDraft}
                  setDraft={setSprintGoalDraft}
                  editing={editingSprintGoal}
                  isModerator={!!self?.isModerator}
                  onStartEdit={startEditSprintGoal}
                  onSave={saveSprintGoal}
                  speechLang={speechLang}
                />
              </div>
            </div>

            <div className="text-center lg:text-left mt-8 sm:mt-10 lg:mt-0 lg:col-span-7 xl:col-span-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2" style={{ color: C.navy }}>
                {t.inviteHeading}
              </h2>
              <p className="text-sm sm:text-base mb-6 lg:max-w-lg" style={{ color: C.textMuted }}>
                {t.inviteSub}
              </p>

              <div className="flex items-stretch gap-2 max-w-lg mx-auto lg:mx-0 mb-2">
                <div
                  className="flex-1 rounded px-3 py-2.5 text-sm sm:text-base font-medium text-left border overflow-hidden"
                  style={{ borderColor: C.border, color: C.primary, backgroundColor: "#fff", wordBreak: "break-all" }}
                >
                  {inviteLink}
                </div>
                <button
                  onClick={copyInviteLink}
                  className="shrink-0 flex items-center gap-1.5 rounded px-3 py-2.5 text-sm font-medium border"
                  style={{ borderColor: copied ? C.green : C.border, color: copied ? C.green : C.navy, backgroundColor: "#fff" }}
                  aria-label={t.copyLink}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copied ? t.copied : t.copyLink}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-5 mb-8">
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.shareWhatsApp}
                </button>
                <button onClick={shareEmail} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: C.primary }}>
                  <Mail className="w-4 h-4" />
                  {t.shareEmail}
                </button>
                {canNativeShare && (
                  <button
                    onClick={shareNative}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border"
                    style={{ borderColor: C.border, color: C.navy, backgroundColor: "#fff" }}
                  >
                    <Share2 className="w-4 h-4" />
                    {t.shareMore}
                  </button>
                )}
              </div>

              {self?.isModerator ? (
                <>
                  <p className="text-sm max-w-md mx-auto lg:mx-0 mb-6" style={{ color: C.textMuted }}>
                    {t.moderatorHint}
                  </p>
                  <button onClick={handleStartEstimating} className="font-medium text-sm rounded px-8 py-3 text-white w-full max-w-xs sm:w-auto" style={{ backgroundColor: C.primary }}>
                    {t.startEstimating}
                  </button>
                </>
              ) : (
                <p className="text-sm" style={{ color: C.textMuted }}>
                  {t.waitingModeratorStart}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* THREE-COLUMN LAYOUT: left = players + alignment (fixed), middle = sprint goal, DoD, then cards/results (fixed size), right = timer + trend */}
      {(view === "voting" || view === "results") && (
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 px-4 sm:px-6 py-4 sm:py-6 lg:items-start">
          {/* LEFT SIDEBAR */}
          <div className="w-full min-w-0 flex flex-col gap-4 order-1 lg:col-span-3">
            <PlayersPanel
              t={t}
              players={players}
              revealed={view === "results"}
              openMenuFor={openMenuFor}
              setOpenMenuFor={setOpenMenuFor}
              onToggleModerator={toggleModerator}
              onToggleObserver={toggleObserver}
              onRename={renamePlayer}
              onLeave={leaveRoom}
              isModerator={!!self?.isModerator}
              deckType={deckType}
              onChangeDeckType={changeDeckType}
              disabledCards={disabledCards}
              onToggleCard={toggleCardEnabled}
              deckSettingsOpen={deckSettingsOpen}
              setDeckSettingsOpen={setDeckSettingsOpen}
              onSimulateJoin={handleSimulateJoin}
            />
            <AlignmentPanel t={t} history={roundHistory} avgPoints={avgPoints} avgCard={avgCard} />
          </div>

          {/* MIDDLE: Sprint Goal, then Definition of Done, then cards/results — always in this vertical order */}
          <div className="w-full min-w-0 flex flex-col items-center justify-center order-3 lg:order-2 lg:col-span-6" style={{ minHeight: 440 }}>
            <SprintGoalBanner
              t={t}
              goal={sprintGoal}
              draft={sprintGoalDraft}
              setDraft={setSprintGoalDraft}
              editing={editingSprintGoal}
              isModerator={!!self?.isModerator}
              onStartEdit={startEditSprintGoal}
              onSave={saveSprintGoal}
              speechLang={speechLang}
            />
            {view === "voting" ? (
              <>
                <DefinitionOfDoneField
                  t={t}
                  dod={storyDoD}
                  draft={storyDoDDraft}
                  setDraft={setStoryDoDDraft}
                  editing={editingDoD}
                  isModerator={!!self?.isModerator}
                  onStartEdit={startEditDoD}
                  onSave={saveDoD}
                  speechLang={speechLang}
                />
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5 max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                  {activeCards.map((val) => (
                    <PokerCard key={val} value={val} selected={self?.vote === val} disabled={self?.isObserver} onClick={() => handleSelectCard(val)} />
                  ))}
                </div>
                {self?.isModerator ? (
                  <button
                    onClick={handleReveal}
                    disabled={!self || self.vote == null}
                    className="mt-8 sm:mt-10 font-medium text-sm rounded px-6 py-2.5 text-white"
                    style={{
                      backgroundColor: self && self.vote != null ? C.primary : C.border,
                      color: self && self.vote != null ? "#fff" : C.textFaint,
                      cursor: self && self.vote != null ? "pointer" : "not-allowed",
                    }}
                  >
                    {t.reveal}
                  </button>
                ) : (
                  <div className="mt-8 sm:mt-10 flex flex-col items-center gap-2">
                    <button disabled className="font-medium text-sm rounded px-6 py-2.5 flex items-center gap-2" style={{ backgroundColor: C.border, color: C.textFaint, cursor: "not-allowed" }}>
                      <Lock className="w-4 h-4" />
                      {t.reveal}
                    </button>
                    <span className="text-xs" style={{ color: C.textMuted }}>
                      {t.waitingModerator}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {storyDoD && (
                  <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl mb-5">
                    <div className="rounded px-3 py-2 flex items-start gap-2 bg-white border" style={{ borderColor: C.border }}>
                      <ClipboardList className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.textMuted }} />
                      <span className="text-xs" style={{ color: C.navy }}>
                        <span className="font-semibold">{t.definitionOfDoneLabel}: </span>
                        {storyDoD}
                      </span>
                    </div>
                  </div>
                )}
                <PieResult votes={votesForPie} />
                {self?.isModerator ? (
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center mt-8">
                    <button onClick={handleStartNewRound} className="font-medium text-sm rounded px-5 py-2.5 text-white" style={{ backgroundColor: C.primary }}>
                      {t.startNewRound}
                    </button>
                    {currentScore !== 100 && (
                      <button onClick={handleReEstimate} className="font-medium text-sm rounded px-5 py-2.5 bg-white border" style={{ borderColor: C.border, color: C.navy }}>
                        {t.reEstimate}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs mt-8" style={{ color: C.textMuted }}>
                    {t.waitingModeratorRound}
                  </span>
                )}
              </>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full min-w-0 flex flex-col gap-4 order-2 lg:order-3 lg:col-span-3">
            <TimerWidget key={roundKey} t={t} />
            <ScoreTrendChart t={t} history={roundHistory} />
          </div>
        </div>
      )}

      {roomFullNoticeOpen && <RoomFullNotice t={t} roomCreatorName={players.find((p) => p.isModerator)?.name} onClose={() => setRoomFullNoticeOpen(false)} />}
    </div>
  );
}
