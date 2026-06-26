<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const site = useSiteConfig();

const slug = computed(() => String(route.params.slug));
const { data: project, error } = await useProject(slug);

if (error.value || !project.value) {
  throw createError({ statusCode: 404, statusMessage: t("projects.notFound"), fatal: true });
}

onMounted(() => {
  const session = useSessionStore();
  session.trackProject(slug.value);
});

const content = useLocalizedContent(() => project.value!.content);

useSeoMeta({
  title: () => content.value.title,
  description: () => content.value.summary,
  ogImage: () => project.value?.coverImage,
});

useJsonLd(() => ({
  "@type": "CreativeWork",
  name: content.value.title,
  description: content.value.summary,
  url: `${site.url}${route.path}`,
  author: { "@type": "Person", name: "Pedro Maciel", url: site.url },
  ...(project.value?.coverImage ? { image: project.value.coverImage } : {}),
  ...(project.value?.stack.length ? { keywords: project.value.stack.join(", ") } : {}),
  ...(project.value?.links.repo ? { codeRepository: project.value.links.repo } : {}),
}));
</script>

<template>
  <article v-if="project" class="flex flex-col gap-8">
    <NuxtLink
      :to="localePath('/projects')"
      class="inline-flex items-center gap-1 text-sm text-muted transition hover:text-default"
    >
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      {{ t("projects.back") }}
    </NuxtLink>

    <header class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ content.title }}</h1>
      <p class="text-lg text-muted">{{ content.summary }}</p>

      <div v-if="project.stack.length" class="flex flex-wrap gap-1.5">
        <UBadge v-for="tech in project.stack" :key="tech" :label="tech" variant="soft" />
      </div>

      <div v-if="project.links.repo || project.links.demo" class="flex flex-wrap gap-3">
        <UButton
          v-if="project.links.repo"
          :to="project.links.repo"
          target="_blank"
          icon="i-lucide-github"
          variant="outline"
          size="sm"
        >
          {{ t("projects.repo") }}
        </UButton>
        <UButton
          v-if="project.links.demo"
          :to="project.links.demo"
          target="_blank"
          icon="i-lucide-external-link"
          size="sm"
        >
          {{ t("projects.demo") }}
        </UButton>
      </div>
    </header>

    <NuxtImg
      v-if="project.coverImage"
      :src="project.coverImage"
      :alt="content.title"
      class="aspect-video w-full rounded-xl object-cover"
    />

    <MDC :value="content.body" class="prose max-w-none dark:prose-invert" />
  </article>
</template>
