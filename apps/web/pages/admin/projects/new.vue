<script setup lang="ts">
import type { ContentStatus } from "@portfolio/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });

const router = useRouter();
const { create } = useAdminProjects();
const { translate, generateMeta } = useAdminAi();
const toast = useToast();

const saving = ref(false);
const translating = ref(false);
const metaLoading = reactive({ pt: false, en: false });
const stackInput = ref("");
const activeTab = ref("pt");

const form = reactive({
  status: "draft" as ContentStatus,
  featured: false,
  stack: [] as string[],
  links: { repo: "", demo: "" },
  coverImage: "",
  content: {
    pt: { title: "", summary: "", body: "" },
    en: { title: "", summary: "", body: "" },
  },
});

const tabs = [
  { label: "🇧🇷 PT (obrigatório)", slot: "pt" },
  { label: "🇺🇸 EN", slot: "en" },
];

const statusOptions = [
  { label: "Rascunho", value: "draft" },
  { label: "Publicado", value: "published" },
];

function addStack() {
  const val = stackInput.value.trim();
  if (val && !form.stack.includes(val)) form.stack.push(val);
  stackInput.value = "";
}

function removeStack(s: string) {
  form.stack = form.stack.filter((x) => x !== s);
}

async function handleTranslate() {
  if (!form.content.pt.title || !form.content.pt.body) {
    toast.add({ title: "Preencha título e conteúdo em PT primeiro.", color: "warning" });
    return;
  }
  translating.value = true;
  try {
    const res = await translate(form.content.pt);
    form.content.en.title = res.title;
    form.content.en.summary = res.summary;
    form.content.en.body = res.body;
    toast.add({ title: "Tradução concluída!", color: "success" });
  } catch {
    toast.add({ title: "Erro ao traduzir. Verifique a ANTHROPIC_API_KEY.", color: "error" });
  } finally {
    translating.value = false;
  }
}

async function handleMeta(locale: "pt" | "en") {
  const c = form.content[locale];
  if (!c.title || !c.body) {
    toast.add({ title: `Preencha título e conteúdo em ${locale.toUpperCase()} primeiro.`, color: "warning" });
    return;
  }
  metaLoading[locale] = true;
  try {
    const res = await generateMeta({ title: c.title, body: c.body, locale });
    form.content[locale].summary = res.metaDescription;
    toast.add({ title: "Meta description gerada!", color: "success" });
  } catch {
    toast.add({ title: "Erro ao gerar meta description.", color: "error" });
  } finally {
    metaLoading[locale] = false;
  }
}

async function onSubmit() {
  if (!form.content.pt.title || !form.content.pt.body) {
    toast.add({ title: "Título e conteúdo em PT são obrigatórios.", color: "warning" });
    return;
  }
  saving.value = true;
  try {
    await create({
      status: form.status,
      featured: form.featured,
      stack: form.stack,
      links: {
        repo: form.links.repo || undefined,
        demo: form.links.demo || undefined,
      },
      coverImage: form.coverImage || undefined,
      content: form.content,
    });
    toast.add({ title: "Projeto criado!", color: "success" });
    router.push("/admin/projects");
  } catch {
    toast.add({ title: "Erro ao salvar o projeto.", color: "error" });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-6 flex items-center gap-3">
      <UButton to="/admin/projects" variant="ghost" icon="i-lucide-arrow-left" size="sm" />
      <h1 class="text-2xl font-bold">Novo Projeto</h1>
    </div>

    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <!-- Configurações -->
      <UCard>
        <template #header>
          <span class="font-medium">Configurações</span>
        </template>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Status">
              <USelect v-model="form.status" :items="statusOptions" value-key="value" />
            </UFormField>

            <UFormField label="Destaque na home">
              <div class="flex items-center gap-2 pt-1">
                <UToggle v-model="form.featured" />
                <span class="text-sm text-muted">{{ form.featured ? "Sim" : "Não" }}</span>
              </div>
            </UFormField>
          </div>

          <UFormField label="Stack (pressione Enter para adicionar)">
            <UInput
              v-model="stackInput"
              placeholder="ex: Nuxt, NestJS, MongoDB..."
              @keydown.enter.prevent="addStack"
            />
            <div v-if="form.stack.length" class="mt-2 flex flex-wrap gap-1">
              <UBadge
                v-for="s in form.stack"
                :key="s"
                class="cursor-pointer select-none"
                @click="removeStack(s)"
              >
                {{ s }} ×
              </UBadge>
            </div>
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Link Repositório">
              <UInput v-model="form.links.repo" placeholder="https://github.com/..." />
            </UFormField>
            <UFormField label="Link Demo">
              <UInput v-model="form.links.demo" placeholder="https://..." />
            </UFormField>
          </div>

          <UFormField label="URL da imagem de capa">
            <UInput v-model="form.coverImage" placeholder="https://..." />
          </UFormField>
        </div>
      </UCard>

      <!-- Conteúdo bilíngue -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">Conteúdo</span>
            <UButton
              type="button"
              variant="outline"
              size="sm"
              icon="i-lucide-languages"
              :loading="translating"
              @click="handleTranslate"
            >
              Traduzir PT→EN
            </UButton>
          </div>
        </template>

        <UTabs v-model="activeTab" :items="tabs">
          <template #pt>
            <div class="flex flex-col gap-4 pt-4">
              <UFormField label="Título *">
                <UInput v-model="form.content.pt.title" required placeholder="Nome do projeto" />
              </UFormField>

              <UFormField label="Resumo / Meta description">
                <div class="flex gap-2">
                  <UTextarea
                    v-model="form.content.pt.summary"
                    :rows="2"
                    class="flex-1"
                    placeholder="Breve descrição (aparece nos cards e SEO)"
                  />
                  <UButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    :loading="metaLoading.pt"
                    title="Gerar com IA"
                    icon="i-lucide-sparkles"
                    @click="handleMeta('pt')"
                  />
                </div>
              </UFormField>

              <UFormField label="Conteúdo (Markdown) *">
                <AdminMarkdownEditor v-model="form.content.pt.body" />
              </UFormField>
            </div>
          </template>

          <template #en>
            <div class="flex flex-col gap-4 pt-4">
              <UFormField label="Title">
                <UInput v-model="form.content.en.title" placeholder="Project name" />
              </UFormField>

              <UFormField label="Summary / Meta description">
                <div class="flex gap-2">
                  <UTextarea
                    v-model="form.content.en.summary"
                    :rows="2"
                    class="flex-1"
                    placeholder="Short description (shown in cards and SEO)"
                  />
                  <UButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    :loading="metaLoading.en"
                    title="Generate with AI"
                    icon="i-lucide-sparkles"
                    @click="handleMeta('en')"
                  />
                </div>
              </UFormField>

              <UFormField label="Content (Markdown)">
                <AdminMarkdownEditor v-model="form.content.en.body" />
              </UFormField>
            </div>
          </template>
        </UTabs>
      </UCard>

      <div class="flex gap-3">
        <UButton type="submit" :loading="saving">Salvar projeto</UButton>
        <UButton to="/admin/projects" variant="ghost">Cancelar</UButton>
      </div>
    </form>
  </div>
</template>
