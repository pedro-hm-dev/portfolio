<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const site = useSiteConfig();

const slug = computed(() => String(route.params.slug));
const { data: post, error } = await usePost(slug);

if (error.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: t("blog.notFound"), fatal: true });
}

onMounted(() => {
  const session = useSessionStore();
  session.trackPost(slug.value);
});

const content = useLocalizedContent(() => post.value!.content);

useSeoMeta({
  title: () => content.value.title,
  description: () => content.value.summary,
  ogImage: () => post.value?.coverImage,
});

useJsonLd(() => ({
  "@type": "BlogPosting",
  headline: content.value.title,
  description: content.value.summary,
  url: `${site.url}${route.path}`,
  author: { "@type": "Person", name: "Pedro Maciel", url: site.url },
  ...(post.value?.coverImage ? { image: post.value.coverImage } : {}),
  ...(post.value?.publishedAt ? { datePublished: post.value.publishedAt } : {}),
  ...(post.value?.tags.length ? { keywords: post.value.tags.join(", ") } : {}),
}));
</script>

<template>
  <article v-if="post" class="mx-auto flex max-w-3xl flex-col gap-8">
    <NuxtLink
      :to="localePath('/blog')"
      class="inline-flex items-center gap-1 text-sm text-muted transition hover:text-default"
    >
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      {{ t("blog.back") }}
    </NuxtLink>

    <header class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ content.title }}</h1>
      <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
        <span>{{ t("blog.readingTime", { min: post.readingTime }) }}</span>
        <span v-if="post.tags.length" class="flex flex-wrap gap-1.5">
          <UBadge v-for="tag in post.tags" :key="tag" :label="tag" variant="soft" size="sm" />
        </span>
      </div>
    </header>

    <NuxtImg
      v-if="post.coverImage"
      :src="post.coverImage"
      :alt="content.title"
      class="aspect-video w-full rounded-xl object-cover"
    />

    <MDC :value="content.body" class="prose max-w-none dark:prose-invert" />
  </article>
</template>
