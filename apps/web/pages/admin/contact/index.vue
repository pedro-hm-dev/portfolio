<script setup lang="ts">
import type { ContactMessage } from "@portfolio/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });

const auth = useAuthStore();
const config = useRuntimeConfig();
const toast = useToast();

function headers(): Record<string, string> {
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

const { data: messages, refresh } = await useAsyncData<ContactMessage[]>("admin-contact", () =>
  $fetch<ContactMessage[]>("/admin/contact", {
    baseURL: config.public.apiBase,
    headers: headers(),
  }),
);

const unread = computed(() => (messages.value ?? []).filter((m) => !m.read).length);

async function toggleRead(msg: ContactMessage) {
  try {
    await $fetch(`/admin/contact/${msg.id}/read`, {
      method: "PATCH",
      baseURL: config.public.apiBase,
      headers: headers(),
      body: { read: !msg.read },
    });
    await refresh();
  } catch {
    toast.add({ title: "Erro ao atualizar mensagem.", color: "error" });
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Contato</h1>
        <p v-if="unread" class="text-sm text-muted">{{ unread }} não lida{{ unread > 1 ? "s" : "" }}</p>
      </div>
    </div>

    <div v-if="!messages?.length" class="py-16 text-center text-muted">
      Nenhuma mensagem recebida ainda.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="[
          'rounded-lg border p-4 transition',
          msg.read ? 'border-default bg-muted/10' : 'border-primary/30 bg-primary/5',
        ]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="overflow-hidden">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-sm">{{ msg.name }}</span>
              <span class="text-xs text-muted">{{ msg.email }}</span>
              <UBadge v-if="!msg.read" color="primary" size="xs">Nova</UBadge>
            </div>
            <p class="text-sm text-muted leading-relaxed">{{ msg.message }}</p>
            <p class="text-xs text-muted mt-2">{{ formatDate(msg.createdAt) }}</p>
          </div>
          <UButton
            variant="ghost"
            size="xs"
            :icon="msg.read ? 'i-lucide-mail' : 'i-lucide-mail-open'"
            :title="msg.read ? 'Marcar como não lida' : 'Marcar como lida'"
            class="shrink-0"
            @click="toggleRead(msg)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
