<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["admin"] });

const { list, remove } = useAdminPosts();
const toast = useToast();

const { data: posts, refresh } = await useAsyncData("admin-posts", list);

async function deletePost(id: string, title: string) {
  if (!confirm(`Excluir o post "${title}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await remove(id);
    toast.add({ title: "Post excluído.", color: "success" });
    await refresh();
  } catch {
    toast.add({ title: "Erro ao excluir o post.", color: "error" });
  }
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Posts</h1>
      <UButton to="/admin/posts/new" icon="i-lucide-plus">Novo post</UButton>
    </div>

    <div v-if="!posts?.length" class="py-16 text-center text-muted">
      Nenhum post ainda.
      <NuxtLink to="/admin/posts/new" class="text-primary underline">Criar o primeiro.</NuxtLink>
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="p in posts"
        :key="p.id"
        class="flex items-center justify-between rounded-lg border border-default bg-muted/10 px-4 py-3 transition hover:bg-muted/20"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <UBadge
            :color="p.status === 'published' ? 'success' : 'neutral'"
            size="xs"
            class="shrink-0"
          >
            {{ p.status === "published" ? "Publicado" : "Rascunho" }}
          </UBadge>
          <span class="truncate font-medium">{{ p.content.pt.title }}</span>
          <span class="shrink-0 text-xs text-muted">{{ p.readingTime }} min</span>
        </div>

        <div class="flex shrink-0 items-center gap-1 pl-4">
          <UButton
            :to="`/admin/posts/${p.id}`"
            variant="ghost"
            size="xs"
            icon="i-lucide-pencil"
          />
          <UButton
            variant="ghost"
            size="xs"
            icon="i-lucide-trash-2"
            color="error"
            @click="deletePost(p.id, p.content.pt.title)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
