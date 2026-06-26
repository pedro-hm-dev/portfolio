<script setup lang="ts">
const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  router.push("/admin/login");
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <aside class="flex w-52 shrink-0 flex-col border-r border-default bg-muted/20">
      <div class="border-b border-default px-4 py-4">
        <p class="text-sm font-semibold">Painel Admin</p>
        <p class="truncate text-xs text-muted">{{ auth.user?.email }}</p>
      </div>

      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <NuxtLink
          to="/admin"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          active-class="bg-muted font-medium"
          exact
        >
          <UIcon name="i-lucide-layout-dashboard" class="size-4 shrink-0" />
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/admin/projects"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          active-class="bg-muted font-medium"
        >
          <UIcon name="i-lucide-folder-open" class="size-4 shrink-0" />
          Projetos
        </NuxtLink>
        <NuxtLink
          to="/admin/posts"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          active-class="bg-muted font-medium"
        >
          <UIcon name="i-lucide-file-text" class="size-4 shrink-0" />
          Posts
        </NuxtLink>

        <div class="my-1 border-t border-default" />

        <NuxtLink
          to="/admin/contact"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          active-class="bg-muted font-medium"
        >
          <UIcon name="i-lucide-mail" class="size-4 shrink-0" />
          Contato
        </NuxtLink>
        <NuxtLink
          to="/admin/visitors"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          active-class="bg-muted font-medium"
        >
          <UIcon name="i-lucide-users" class="size-4 shrink-0" />
          Visitantes
        </NuxtLink>
      </nav>

      <div class="border-t border-default p-2">
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-log-out"
          block
          @click="handleLogout"
        >
          Sair
        </UButton>
      </div>
    </aside>

    <main class="flex-1 overflow-auto p-6">
      <slot />
    </main>
  </div>
</template>
