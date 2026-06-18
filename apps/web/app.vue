<script setup lang="ts">
const { t, locale, setLocale } = useI18n();
const localePath = useLocalePath();
const colorMode = useColorMode();

const otherLocale = computed(() => (locale.value === "pt" ? "en" : "pt"));

// Emits <html lang/dir>, canonical + hreflang alternates (pt-BR/en-US/x-default)
// and og:locale on every page, derived from the current route + i18n config.
const localeHead = useLocaleHead({ dir: true, lang: true, seo: true });
useHead(localeHead);
</script>

<template>
  <UApp>
    <header class="flex items-center justify-between border-b border-default px-6 py-4">
      <NuxtLink :to="localePath('/')" class="text-lg font-bold">Pedro Maciel</NuxtLink>
      <nav class="flex items-center gap-3">
        <NuxtLink
          :to="localePath('/projects')"
          class="text-sm text-muted transition hover:text-default"
          active-class="text-default"
        >
          {{ t("nav.projects") }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/blog')"
          class="text-sm text-muted transition hover:text-default"
          active-class="text-default"
        >
          {{ t("nav.blog") }}
        </NuxtLink>
        <UButton variant="ghost" size="sm" @click="setLocale(otherLocale)">
          {{ otherLocale.toUpperCase() }}
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
        />
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-12">
      <NuxtPage />
    </main>
  </UApp>
</template>
