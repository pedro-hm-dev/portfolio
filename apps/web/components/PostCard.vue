<script setup lang="ts">
import type { Post } from "@portfolio/types";

const props = defineProps<{ post: Post }>();

const { t } = useI18n();
const localePath = useLocalePath();
const content = useLocalizedContent(() => props.post.content);
</script>

<template>
  <NuxtLink
    :to="localePath(`/blog/${post.slug}`)"
    class="group flex flex-col gap-3 rounded-xl border border-default bg-elevated/50 p-5 transition hover:border-primary hover:shadow-lg"
  >
    <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
      <span>{{ t("blog.readingTime", { min: post.readingTime }) }}</span>
      <span v-if="post.tags.length" class="flex flex-wrap gap-1.5">
        <UBadge v-for="tag in post.tags" :key="tag" :label="tag" variant="soft" size="sm" />
      </span>
    </div>

    <h3 class="text-lg font-semibold tracking-tight group-hover:text-primary">
      {{ content.title }}
    </h3>
    <p class="line-clamp-3 text-sm text-muted">{{ content.summary }}</p>
  </NuxtLink>
</template>
