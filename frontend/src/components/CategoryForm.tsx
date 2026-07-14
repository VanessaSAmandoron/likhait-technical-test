/**
 * Form component for creating / editing an expense category
 */

import React, { useState } from "react";
import { TextField, Button } from "../vibes";
import {
  EMOJI_OPTIONS,
  DEFAULT_CATEGORY_EMOJI,
} from "../constants/categoryEmojis";
import { COLORS } from "../constants/colors";

interface CategoryFormProps {
  initialData?: { name?: string; emoji?: string | null };
  onSubmit: (name: string, emoji: string) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Keep only symbol / emoji characters, dropping letters, numbers,
 * whitespace and punctuation so the icon field accepts symbols only.
 */
function sanitizeEmoji(value: string): string {
  // Extended_Pictographic + symbols, plus the joiner (200D), variation
  // selector (FE0F), skin-tone modifiers and regional indicators so that
  // multi-codepoint emoji survive intact.
  const allowed =
    /[\p{Extended_Pictographic}\p{S}‍️\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}]/u;
  return Array.from(value)
    .filter((char) => allowed.test(char))
    .join("")
    .slice(0, 16);
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Category",
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [emoji, setEmoji] = useState<string>(
    initialData?.emoji || DEFAULT_CATEGORY_EMOJI,
  );
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: COLORS.text.primary,
  };

  const emojiGridStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const emojiButtonStyle = (selected: boolean): React.CSSProperties => ({
    fontSize: "1.25rem",
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.375rem",
    cursor: "pointer",
    background: selected ? COLORS.primary.p06 : COLORS.background.main,
    border: `1px solid ${selected ? COLORS.primary.p06 : COLORS.border}`,
    transition: "all 0.15s",
  });

  const hintStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: COLORS.text.secondary,
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (error) {
      setError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setError(undefined);
    try {
      await onSubmit(trimmedName, emoji || DEFAULT_CATEGORY_EMOJI);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Category Name"
        type="text"
        placeholder="e.g. Groceries"
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        error={error}
        fullWidth
        autoFocus
        required
      />

      <div>
        <label style={labelStyle}>Icon</label>
        <div style={emojiGridStyle}>
          {EMOJI_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              style={emojiButtonStyle(option === emoji)}
              onClick={() => setEmoji(option)}
              aria-label={`Select icon ${option}`}
              aria-pressed={option === emoji}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <TextField
        label="Or enter your own icon"
        type="text"
        placeholder="Paste an emoji"
        value={emoji}
        onChange={(e) => setEmoji(sanitizeEmoji(e.target.value))}
      />
      <span style={hintStyle}>Symbols and emoji only — no letters or numbers.</span>

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
