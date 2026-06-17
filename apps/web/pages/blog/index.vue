<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t("blog.title"),
  description: () => t("blog.subtitle"),
});

const { data: posts, status } = usePostsList();
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ t("blog.title") }}</h1>
      <p class="text-muted">{{ t("blog.subtitle") }}</p>
    </header>

    <div v-if="status === 'pending'" class="grid gap-6 sm:grid-cols-2">
      <USkeleton v-for="i in 4" :key="i" class="h-40 rounded-xl" />
    </div>

    <p v-else-if="!posts?.length" class="py-12 text-center text-muted">
      {{ t("blog.empty") }}
    </p>

    <div v-else class="grid gap-6 sm:grid-cols-2">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>
