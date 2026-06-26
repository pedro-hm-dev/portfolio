<script setup lang="ts">
import type { ContentStatus } from "@portfolio/types";

definePageMeta({ layout: "admin", middleware: ["admin"] });

const route = useRoute();
const router = useRouter();
const { get, update, remove } = useAdminPosts();
const { translate, generateMeta } = useAdminAi();
const toast = useToast();

const { data: post } = await useAsyncData(`post-${route.params.id}`, () =>
  get(route.params.id as string),
);

if (!post.value) {
  throw createError({ statusCode: 404, message: "Post não encontrado" });
}

const saving = ref(false);
const translating = ref(false);
const metaLoading = reactive({ pt: false, en: false });
const tagInput = ref("");
const activeTab = ref("pt");

const form = reactive({
  status: post.value.status as ContentStatus,
  tags: [...post.value.tags],
  coverImage: post.value.coverImage ?? "",
  content: {
    pt: { ...post.value.content.pt },
    en: { ...post.value.content.en },
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

function addTag() {
  const val = tagInput.value.trim().toLowerCase();
  if (val && !form.tags.includes(val)) form.tags.push(val);
  tagInput.value = "";
}

function removeTag(t: string) {
  form.tags = form.tags.filter((x) => x !== t);
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
    await update(route.params.id as string, {
      status: form.status,
      tags: form.tags,
      coverImage: form.coverImage || undefined,
      content: form.content,
    });
    toast.add({ title: "Post salvo!", color: "success" });
  } catch {
    toast.add({ title: "Erro ao salvar o post.", color: "error" });
  } finally {
    saving.value = false;
  }
}

async function onDelete() {
  if (!confirm(`Excluir "${form.content.pt.title}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await remove(route.params.id as string);
    toast.add({ title: "Post excluído.", color: "success" });
    router.push("/admin/posts");
  } catch {
    toast.add({ title: "Erro ao excluir o post.", color: "error" });
  }
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton to="/admin/posts" variant="ghost" icon="i-lucide-arrow-left" size="sm" />
        <h1 class="text-2xl font-bold">Editar Post</h1>
      </div>
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon name="i-lucide-clock" class="size-4" />
        {{ post?.readingTime }} min de leitura
        <UButton
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          size="sm"
          @click="onDelete"
        >
          Excluir
        </UButton>
      </div>
    </div>

    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <!-- Configurações -->
      <UCard>
        <template #header>
          <span class="font-medium">Configurações</span>
        </template>

        <div class="flex flex-col gap-4">
          <UFormField label="Status">
            <USelect v-model="form.status" :items="statusOptions" value-key="value" />
          </UFormField>

          <UFormField label="Tags (pressione Enter para adicionar)">
            <UInput
              v-model="tagInput"
              placeholder="ex: nuxt, nestjs..."
              @keydown.enter.prevent="addTag"
            />
            <div v-if="form.tags.length" class="mt-2 flex flex-wrap gap-1">
              <UBadge
                v-for="t in form.tags"
                :key="t"
                class="cursor-pointer select-none"
                @click="removeTag(t)"
              >
                {{ t }} ×
              </UBadge>
            </div>
          </UFormField>

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
                <UInput v-model="form.content.pt.title" required />
              </UFormField>

              <UFormField label="Resumo / Meta description">
                <div class="flex gap-2">
                  <UTextarea v-model="form.content.pt.summary" :rows="2" class="flex-1" />
                  <UButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    :loading="metaLoading.pt"
                    icon="i-lucide-sparkles"
                    title="Gerar com IA"
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
                <UInput v-model="form.content.en.title" />
              </UFormField>

              <UFormField label="Summary / Meta description">
                <div class="flex gap-2">
                  <UTextarea v-model="form.content.en.summary" :rows="2" class="flex-1" />
                  <UButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    :loading="metaLoading.en"
                    icon="i-lucide-sparkles"
                    title="Generate with AI"
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
        <UButton type="submit" :loading="saving">Salvar alterações</UButton>
        <UButton to="/admin/posts" variant="ghost">Cancelar</UButton>
      </div>
    </form>
  </div>
</template>
