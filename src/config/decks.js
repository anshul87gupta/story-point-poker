/* feature: configurable card deck — presets plus per-card toggling handled in DeckSettingsPanel */
export const DECKS = {
  scrum: { label: "deckScrum", cards: ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"] },
  fibonacci: { label: "deckFibonacci", cards: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"] },
  tshirt: { label: "deckTshirt", cards: ["XS", "S", "M", "L", "XL", "XXL", "?"] },
  powers2: { label: "deckPowers2", cards: ["0", "1", "2", "4", "8", "16", "32", "64", "?"] },
};
