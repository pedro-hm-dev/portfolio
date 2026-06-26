<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] });

const { list: listProjects } = useAdminProjects();
const { list: listPosts } = useAdminPosts();

const { data: projects } = await useAsyncData("dash-projects", listProjects);
const { data: posts } = await useAsyncData("dash-posts", listPosts);

const stats = computed(() => ({
  projectsPublished: (projects.value ?? []).filter((p) => p.status === "published").length,
  projectsDraft: (projects.value ?? []).filter((p) => p.status === "draft").length,
  postsPublished: (posts.value ?? []).filter((p) => p.status === "published").length,
  postsDraft: (posts.value ?? []).filter((p) => p.status === "draft").length,
}));
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">Dashboard</h1>

    <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <UCard>
        <p class="text-3xl font-bold">{{ stats.projectsPublished }}</p>
        <p class="text-sm text-muted">Projetos publicados</p>
      </UCard>
      <UCard>
        <p class="text-3xl font-bold text-muted">{{ stats.projectsDraft }}</p>
        <p class="text-sm text-muted">Projetos rascunho</p>
      </UCard>
      <UCard>
        <p class="text-3xl font-bold">{{ stats.postsPublished }}</p>
        <p class="text-sm text-muted">Posts publicados</p>
      </UCard>
      <UCard>
        <p class="text-3xl font-bold text-muted">{{ stats.postsDraft }}</p>
        <p class="text-sm text-muted">Posts rascunho</p>
      </UCard>
    </div>

    <div class="flex gap-3">
      <UButton to="/admin/projects/new" icon="i-lucide-plus">
        Novo projeto
      </UButton>
      <UButton to="/admin/posts/new" variant="outline" icon="i-lucide-plus">
        Novo post
      </UButton>
    </div>
  </div>
</template>
