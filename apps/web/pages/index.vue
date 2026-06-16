<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t("home.title"),
  description: () => t("home.subtitle"),
});
</script>

<template>
  <section class="flex flex-col items-start gap-4">
    <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">{{ t("home.title") }}</h1>
    <p class="text-lg text-muted">{{ t("home.subtitle") }}</p>
  </section>
</template>
