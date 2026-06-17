import type { Localized } from "@portfolio/types";

/** Picks the content for the active locale (falls back to PT). */
export function useLocalizedContent<T>(content: MaybeRefOrGetter<Localized<T>>) {
  const { locale } = useI18n();
  return computed<T>(() => {
    const value = toValue(content);
    return value[locale.value as keyof Localized<T>] ?? value.pt;
  });
}
