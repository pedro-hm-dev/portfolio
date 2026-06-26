<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const site = useSiteConfig();

useSeoMeta({
  title: () => t("home.title"),
  description: () => t("home.subtitle"),
});

useJsonLd(() => ({
  "@graph": [
    { "@type": "Person", name: "Pedro Maciel", url: site.url, description: t("home.subtitle") },
    { "@type": "WebSite", name: site.name, url: site.url },
  ],
}));

const { data: projects, status } = useProjectsList();
const featured = computed(() => (projects.value ?? []).filter((p) => p.featured).slice(0, 3));
const showcase = computed(() => (featured.value.length ? featured.value : (projects.value ?? []).slice(0, 3)));
</script>

<template>
  <div class="flex flex-col gap-16">
    <section class="flex flex-col items-start gap-4">
      <h1 class="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-6xl">{{ t("home.title") }}</h1>
      <p class="animate-fade-in-up max-w-2xl text-lg text-muted" style="animation-delay: 0.1s">{{ t("home.subtitle") }}</p>
    </section>

    <section v-if="status === 'pending' || showcase.length" class="flex flex-col gap-6">
      <div class="animate-fade-in-up flex items-end justify-between" style="animation-delay: 0.15s">
        <h2 class="text-2xl font-semibold tracking-tight">{{ t("home.featured") }}</h2>
        <ULink :to="localePath('/projects')" class="text-sm font-medium text-primary">
          {{ t("home.viewAll") }} →
        </ULink>
      </div>

      <div v-if="status === 'pending'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 3" :key="i" class="aspect-[4/3] rounded-xl" />
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="(project, i) in showcase"
          :key="project.id"
          :project="project"
          class="animate-fade-in-up"
          :style="{ animationDelay: `${0.2 + i * 0.08}s` }"
        />
      </div>
    </section>
  </div>
</template>
