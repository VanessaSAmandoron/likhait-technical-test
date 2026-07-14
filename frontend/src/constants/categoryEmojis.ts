/**
 * Emoji mappings for expense categories
 */

export const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍔",
  Transportation: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📄",
  Healthcare: "🏥",
  Education: "📚",
  Travel: "✈️",
  Other: "📦",
};

export const EMOJI_OPTIONS = [
  "🍔",
  "🚗",
  "🎬",
  "🛍️",
  "📄",
  "🏥",
  "📚",
  "✈️",
  "🏠",
  "💡",
  "💰",
  "🎁",
  "🐶",
  "☕",
  "🏋️",
  "🎮",
  "🛒",
  "📦",
] as const;

export const DEFAULT_CATEGORY_EMOJI = "📦";

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || DEFAULT_CATEGORY_EMOJI;
}
