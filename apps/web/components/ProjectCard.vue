<script setup lang="ts">
import type { Project } from "@portfolio/types";

const props = defineProps<{ project: Project }>();

const localePath = useLocalePath();
const content = useLocalizedContent(() => props.project.content);
</script>

<template>
  <NuxtLink
    :to="localePath(`/projects/${project.slug}`)"
    class="group flex flex-col overflow-hidden rounded-xl border border-default bg-elevated/50 transition hover:border-primary hover:shadow-lg"
  >
    <div class="aspect-video overflow-hidden bg-muted">
      <NuxtImg
        v-if="project.coverImage"
        :src="project.coverImage"
        :alt="content.title"
        class="size-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div v-else class="flex size-full items-center justify-center text-muted">
        <UIcon name="i-lucide-image" class="size-10" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-lg font-semibold tracking-tight group-hover:text-primary">
          {{ content.title }}
        </h3>
        <UIcon
          v-if="project.featured"
          name="i-lucide-star"
          class="mt-1 size-4 shrink-0 text-warning"
        />
      </div>

      <p class="line-clamp-2 text-sm text-muted">{{ content.summary }}</p>

      <div v-if="project.stack.length" class="mt-auto flex flex-wrap gap-1.5 pt-2">
        <UBadge
          v-for="tech in project.stack"
          :key="tech"
          :label="tech"
          variant="soft"
          size="sm"
        />
      </div>
    </div>
  </NuxtLink>
</template>
