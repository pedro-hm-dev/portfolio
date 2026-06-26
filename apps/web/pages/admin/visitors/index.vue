<script setup lang="ts">
import type { Visitor } from "@portfolio/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });

const auth = useAuthStore();
const config = useRuntimeConfig();

function headers(): Record<string, string> {
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
}

const { data: visitors } = await useAsyncData<Visitor[]>("admin-visitors", () =>
  $fetch<Visitor[]>("/admin/visitors", {
    baseURL: config.public.apiBase,
    headers: headers(),
  }),
);

const expanded = ref<string | null>(null);

function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id;
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function formatTime(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r > 0 ? `${m}min ${r}s` : `${m}min`;
}

const publicCount = computed(() => (visitors.value ?? []).filter((v) => v.isPublic).length);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Visitantes</h1>
      <p class="text-sm text-muted">
        {{ visitors?.length ?? 0 }} total ·
        {{ publicCount }} autorizaram exibição pública
      </p>
    </div>

    <div v-if="!visitors?.length" class="py-16 text-center text-muted">
      Nenhum visitante registrado ainda.
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="v in visitors"
        :key="v.id"
        class="rounded-lg border border-default bg-muted/10 overflow-hidden"
      >
        <!-- Row summary -->
        <button
          class="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-muted/20"
          @click="toggle(v.id)"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {{ v.name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() }}
            </div>
            <div class="overflow-hidden">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">{{ v.name }}</span>
                <UBadge v-if="v.isPublic" color="success" size="xs">público</UBadge>
              </div>
              <p class="text-xs text-muted truncate">
                {{ v.email }}
                <span v-if="v.company || v.role">
                  · {{ [v.role, v.company].filter(Boolean).join(", ") }}
                </span>
              </p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3 pl-4">
            <span class="text-xs text-muted">{{ formatDate(v.createdAt) }}</span>
            <UIcon :name="expanded === v.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4 text-muted" />
          </div>
        </button>

        <!-- Expanded details -->
        <div v-if="expanded === v.id" class="border-t border-default px-4 pb-4 pt-3">
          <div class="grid gap-4 sm:grid-cols-2 text-xs">
            <!-- Technical -->
            <div>
              <p class="font-medium text-muted mb-2 uppercase tracking-widest">Técnico</p>
              <dl class="space-y-1">
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Idioma</dt>
                  <dd>{{ v.technicalData.language || "—" }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Fuso</dt>
                  <dd>{{ v.technicalData.timezone || "—" }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Resolução</dt>
                  <dd>{{ v.technicalData.screenResolution || "—" }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Tema</dt>
                  <dd>{{ v.technicalData.colorScheme || "—" }}</dd>
                </div>
                <div v-if="v.locationData.country" class="flex justify-between gap-2">
                  <dt class="text-muted">Localização</dt>
                  <dd>{{ [v.locationData.city, v.locationData.country].filter(Boolean).join(", ") }}</dd>
                </div>
              </dl>
            </div>

            <!-- Behavioral -->
            <div>
              <p class="font-medium text-muted mb-2 uppercase tracking-widest">Comportamental</p>
              <dl class="space-y-1">
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Tempo no site</dt>
                  <dd>{{ formatTime(v.behavioralData.timeOnSite) }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Tour completo</dt>
                  <dd>{{ v.behavioralData.tourCompleted ? "Sim" : "Não" }}</dd>
                </div>
                <div class="flex justify-between gap-2">
                  <dt class="text-muted">Páginas</dt>
                  <dd class="text-right">{{ v.behavioralData.pagesVisited.length }}</dd>
                </div>
                <div v-if="v.behavioralData.pagesVisited.length" class="col-span-2">
                  <p class="text-muted mt-1">{{ v.behavioralData.pagesVisited.join(" → ") }}</p>
                </div>
              </dl>
            </div>
          </div>

          <div v-if="v.interests.length" class="mt-3 flex flex-wrap gap-1">
            <UBadge v-for="i in v.interests" :key="i" variant="outline" size="xs">{{ i }}</UBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
