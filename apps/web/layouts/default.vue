<script setup lang="ts">
const { t, locale, setLocale } = useI18n();
const localePath = useLocalePath();
const colorMode = useColorMode();

const otherLocale = computed(() => (locale.value === "pt" ? "en" : "pt"));
</script>

<template>
  <div>
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
      <slot />
    </main>
  </div>
</template>
