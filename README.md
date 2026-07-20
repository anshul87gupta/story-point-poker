# Story Point Poker — component structure

This is the feature-component split of the original single-file `StoryPointPoker.jsx`
prototype. Behavior is unchanged — this is a pure refactor, not a feature change.

## Structure

```
src/
  theme.js                 Color palette (C) + pie chart slice colors
  config/
    decks.js                Card deck presets (Scrum, Fibonacci, T-shirt, Powers of 2)
  i18n/
    translations.js         EN/DE/HI strings, language labels, speech-recognition locale map
  utils/
    helpers.js               avatarEmoji, generateRoomCode, formatClock, isTypingTarget, cardToNumber
    alignment.js              computeAlignment, alignmentLabel, alignmentColor
  hooks/
    useSpeechToText.js        Web Speech API wrapper (logic only, no UI)
  components/
    common/
      Switch.jsx               Reusable toggle switch
    timer/
      RingTimer.jsx            Circular countdown ring (presentational)
      TimerWidget.jsx           Sprint-budget + per-story dual timer
    players/
      PlayerMenu.jsx            Per-player 3-dot settings menu
      PlayersPanel.jsx          Player list + inline rename + deck settings trigger
    deck/
      DeckSettingsPanel.jsx     Deck type + per-card toggle popover
      PokerCard.jsx             Single estimation card
    sprint/
      MicButton.jsx             Presentational mic button (uses useSpeechToText)
      SprintGoalBanner.jsx      Sprint Goal field
      DefinitionOfDoneField.jsx Definition of Done field
    insights/
      PieResult.jsx             Results pie chart
      AlignmentPanel.jsx        "Moderator Insights" panel (alignment score, averages)
      ScoreTrendChart.jsx       "Re-estimation Progress" line chart
    auth/
      AuthMenu.jsx              Sign Up / Sign In / Log Out UI (no backend yet)
  StoryPointPoker.jsx        Main page — composes everything above, owns all shared state
```

## Design notes

- **State stays centralized in `StoryPointPoker.jsx`.** Feature components are intentionally
  "dumb" (props in, callbacks out) except where state is genuinely local and self-contained
  (e.g. `TimerWidget`'s countdown state, `AuthMenu`'s open/closed state, `PlayersPanel`'s
  inline-rename-in-progress state). This mirrors how you'll likely want to structure things
  once a real backend/store (Reverb sync, or a state manager) exists — the page component is
  the natural seam where server state will eventually plug in.
- **`useSpeechToText` is a hook, not a component.** It only exists to demonstrate the kind of
  logic/presentation split worth doing more of as the app grows — pull business logic into
  hooks, keep components focused on rendering.
- **Styling is still inline `style` objects + Tailwind utility classes**, matching the original.
  No CSS-in-JS library or Tailwind config changes were introduced by this split.
- **No new dependencies.** Still just `react` and `lucide-react`.

## Next steps (not done in this pass)

- Wire this into your actual Vite/Laravel project (`resources/js` or a standalone Vite React app).
- Replace `AuthMenu`'s local `signedIn` state with real auth once the Laravel backend exists.
- Replace `generateRoomCode` / the cosmetic invite link with real Reverb-backed rooms.
