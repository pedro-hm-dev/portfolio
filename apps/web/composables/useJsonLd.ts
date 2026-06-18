import type { MaybeRefOrGetter } from "vue";

/**
 * Injects a <script type="application/ld+json"> with the given schema.org node
 * (or a node holding an "@graph"). Pass a getter so it stays reactive to locale
 * and async content.
 */
export function useJsonLd(node: MaybeRefOrGetter<Record<string, unknown>>) {
  useHead(() => ({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({ "@context": "https://schema.org", ...toValue(node) }),
      },
    ],
  }));
}
