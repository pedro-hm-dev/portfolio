<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t("projects.title"),
  description: () => t("projects.subtitle"),
});

const { data: projects, status } = useProjectsList();

// Stack filter derived from the published projects.
const activeStack = ref<string | null>(null);

const allStacks = computed(() => {
  const set = new Set<string>();
  for (const p of projects.value ?? []) p.stack.forEach((s) => set.add(s));
  return [...set].sort((a, b) => a.localeCompare(b));
});

const filtered = computed(() => {
  const list = projects.value ?? [];
  if (!activeStack.value) return list;
  return list.filter((p) => p.stack.includes(activeStack.value!));
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ t("projects.title") }}</h1>
      <p class="text-muted">{{ t("projects.subtitle") }}</p>
    </header>

    <div v-if="allStacks.length" class="flex flex-wrap gap-2">
      <UButton
        :variant="activeStack === null ? 'solid' : 'outline'"
        size="sm"
        @click="activeStack = null"
      >
        {{ t("projects.filterAll") }}
      </UButton>
      <UButton
        v-for="tech in allStacks"
        :key="tech"
        :variant="activeStack === tech ? 'solid' : 'outline'"
        size="sm"
        @click="activeStack = tech"
      >
        {{ tech }}
      </UButton>
    </div>

    <div v-if="status === 'pending'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <USkeleton v-for="i in 6" :key="i" class="aspect-[4/3] rounded-xl" />
    </div>

    <p v-else-if="!filtered.length" class="py-12 text-center text-muted">
      {{ t("projects.empty") }}
    </p>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in filtered" :key="project.id" :project="project" />
    </div>
  </div>
</template>
