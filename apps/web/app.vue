<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();
const colorMode = useColorMode();

const otherLocale = computed(() => (locale.value === "pt" ? "en" : "pt"));
</script>

<template>
  <UApp>
    <header class="flex items-center justify-between border-b border-default px-6 py-4">
      <NuxtLink :to="$localePath('/')" class="text-lg font-bold">Pedro Maciel</NuxtLink>
      <nav class="flex items-center gap-3">
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
