const WORDS_PER_MINUTE = 200;

/** Estimates reading time in minutes from markdown text (min 1). */
export function readingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
