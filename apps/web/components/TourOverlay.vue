<script setup lang="ts">
import type { PublicVisitor } from "@portfolio/types";

const CONSENT_VERSION = "1.0";

const router = useRouter();
const session = useSessionStore();
const { submit: submitVisitor, listPublic } = useVisitor();
const toast = useToast();

// ── Tour state ────────────────────────────────────────────────────────────────
const active = ref(false);
const step = ref(0);
const revealOpen = ref(false);

const steps = [
  {
    title: "Olá! 👋",
    text: "Este portfólio é uma aplicação full-stack real — Nuxt + NestJS + MongoDB. Deixa eu te mostrar o que foi construído.",
    path: null as string | null,
  },
  {
    title: "Projetos",
    text: "Trabalhos reais com código aberto. Cada projeto tem descrição bilíngue, stack completa, links de repositório e demo ao vivo.",
    path: "/projects",
  },
  {
    title: "Blog técnico",
    text: "Artigos sobre o que foi construído aqui — markdown renderizado, syntax highlight, tempo de leitura estimado. Em PT e EN.",
    path: "/blog",
  },
  {
    title: "Por trás dos panos",
    text: "Este site tem um CMS próprio: editor markdown, gestão bilíngue PT/EN, autenticação JWT com refresh rotation e tradução automática por IA (Claude). O recrutador vê o frontend; o engenheiro vê o stack completo.",
    path: null,
  },
];

const currentStep = computed(() => steps[step.value] ?? steps[0]!);

function startTour() {
  session.collectTechnicalData();
  session.collectLocationData();
  active.value = true;
  step.value = 0;
}

function exitTour() {
  active.value = false;
  revealOpen.value = false;
}

async function next() {
  const target = steps[step.value];
  if (target?.path) {
    await router.push(target.path);
  }

  if (step.value < steps.length - 1) {
    step.value++;
  } else {
    // Last step → open reveal
    active.value = false;
    revealOpen.value = true;
    publicVisitors.value = await listPublic().catch(() => []);
  }
}

function prev() {
  if (step.value > 0) step.value--;
}

// ── URL trigger: ?tour=1 ──────────────────────────────────────────────────────
const route = useRoute();
onMounted(() => {
  if (route.query.tour === "1") startTour();
});

// ── Data reveal & consent ─────────────────────────────────────────────────────
const consentStep = ref<"reveal" | "form" | "visitors">("reveal");
const publicVisitors = ref<PublicVisitor[]>([]);
const submitting = ref(false);
const submitted = ref(false);

const consentForm = reactive({
  name: "",
  email: "",
  company: "",
  role: "",
  interests: [] as string[],
  isPublic: true,
});

function revealNext() {
  if (consentStep.value === "reveal") consentStep.value = "form";
  else if (consentStep.value === "form") consentStep.value = "visitors";
}

async function submitConsent() {
  if (!consentForm.name || !consentForm.email) {
    toast.add({ title: "Nome e email são obrigatórios.", color: "warning" });
    return;
  }
  submitting.value = true;
  try {
    await submitVisitor({
      name: consentForm.name,
      email: consentForm.email,
      company: consentForm.company || undefined,
      role: consentForm.role || undefined,
      interests: consentForm.interests,
      isPublic: consentForm.isPublic,
      consentVersion: CONSENT_VERSION,
      technicalData: session.technicalData,
      behavioralData: session.getBehavioralData(true),
      locationData: session.locationData,
    });
    submitted.value = true;
    if (consentForm.isPublic) {
      publicVisitors.value = await listPublic().catch(() => publicVisitors.value);
    }
    toast.add({ title: "Perfil registrado com sucesso!", color: "success" });
    consentStep.value = "visitors";
  } catch {
    toast.add({ title: "Erro ao registrar. Tente novamente.", color: "error" });
  } finally {
    submitting.value = false;
  }
}

function skipConsent() {
  consentStep.value = "visitors";
}

// ── Interest chips (derived from projects viewed + manual) ────────────────────
const suggestedInterests = [
  "Nuxt",
  "Vue",
  "NestJS",
  "TypeScript",
  "MongoDB",
  "Node.js",
  "Docker",
  "AWS",
];

function toggleInterest(i: string) {
  const idx = consentForm.interests.indexOf(i);
  if (idx === -1) consentForm.interests.push(i);
  else consentForm.interests.splice(idx, 1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

defineExpose({ startTour });
</script>

<template>
  <!-- ── Floating action button ────────────────────────────────────────────── -->
  <div v-if="!active && !revealOpen" class="fixed right-6 bottom-6 z-40">
    <!-- pulse ring -->
    <span
      class="animate-ping-slow bg-primary absolute inset-0 rounded-full opacity-30"
      aria-hidden="true"
    />
    <button
      class="bg-primary relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:opacity-90 active:scale-95"
      @click="startTour"
    >
      <UIcon name="i-lucide-play" class="size-4" />
      Tour
    </button>
  </div>

  <!-- ── Tour floating card (steps 1–4) ────────────────────────────────────── -->
  <Transition name="slide-up">
    <div
      v-if="active"
      class="border-default bg-default fixed right-6 bottom-6 z-50 w-80 rounded-xl border shadow-2xl"
    >
      <div class="flex items-start justify-between p-4 pb-3">
        <p class="text-sm font-semibold">{{ currentStep.title }}</p>
        <button class="text-muted hover:text-default transition" @click="exitTour">
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </div>

      <p class="text-muted px-4 pb-4 text-sm leading-relaxed">{{ currentStep.text }}</p>

      <div class="border-default flex items-center justify-between border-t px-4 py-3">
        <!-- Progress dots -->
        <div class="flex gap-1.5">
          <div
            v-for="(_, i) in steps"
            :key="i"
            :class="[
              'h-1.5 rounded-full transition-all',
              i === step ? 'bg-primary w-4' : 'bg-muted w-1.5',
            ]"
          />
        </div>

        <div class="flex items-center gap-2">
          <UButton v-if="step > 0" variant="ghost" size="xs" @click="prev">←</UButton>
          <UButton size="xs" @click="next">
            {{ step < steps.length - 1 ? "Próximo →" : "Ver dados →" }}
          </UButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ── Full-screen data reveal ────────────────────────────────────────────── -->
  <Transition name="fade">
    <div
      v-if="revealOpen"
      class="bg-background/98 fixed inset-0 z-50 overflow-auto backdrop-blur-sm"
    >
      <div class="mx-auto max-w-2xl px-6 py-12">
        <!-- Close button -->
        <button
          class="text-muted hover:text-default absolute top-6 right-6 transition"
          @click="exitTour"
        >
          <UIcon name="i-lucide-x" class="size-5" />
        </button>

        <!-- ── Step: Reveal ──────────────────────────────────────────────── -->
        <div v-if="consentStep === 'reveal'">
          <div class="mb-8">
            <p class="text-primary mb-2 text-xs font-medium tracking-widest uppercase">
              Transparência de dados
            </p>
            <h2 class="mb-2 text-3xl font-bold">Uma palavra sobre dados.</h2>
            <p class="text-muted">
              Durante os seus {{ session.formatTimeOnSite() }} de visita, coletamos:
            </p>
          </div>

          <!-- What we DID collect -->
          <div class="mb-8 space-y-3">
            <div
              class="bg-success/10 border-success/20 flex items-start gap-3 rounded-lg border p-3"
            >
              <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-4 shrink-0" />
              <div>
                <p class="text-sm font-medium">Navegador e sistema</p>
                <p class="text-muted mt-0.5 text-xs">
                  {{ session.technicalData.userAgent?.split(") ")[0]?.replace("(", "") || "—" }}
                </p>
              </div>
            </div>

            <div
              class="bg-success/10 border-success/20 flex items-start gap-3 rounded-lg border p-3"
            >
              <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-4 shrink-0" />
              <div>
                <p class="text-sm font-medium">Idioma e fuso horário</p>
                <p class="text-muted mt-0.5 text-xs">
                  {{ session.technicalData.language || "—" }} ·
                  {{ session.technicalData.timezone || "—" }}
                </p>
              </div>
            </div>

            <div
              class="bg-success/10 border-success/20 flex items-start gap-3 rounded-lg border p-3"
            >
              <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-4 shrink-0" />
              <div>
                <p class="text-sm font-medium">Resolução e tema</p>
                <p class="text-muted mt-0.5 text-xs">
                  {{ session.technicalData.screenResolution || "—" }} · tema
                  {{ session.technicalData.colorScheme || "—" }}
                </p>
              </div>
            </div>

            <div
              v-if="session.locationData.country"
              class="bg-success/10 border-success/20 flex items-start gap-3 rounded-lg border p-3"
            >
              <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-4 shrink-0" />
              <div>
                <p class="text-sm font-medium">Localização aproximada</p>
                <p class="text-muted mt-0.5 text-xs">
                  {{ session.locationData.city }}, {{ session.locationData.region }},
                  {{ session.locationData.country }}
                  <span class="text-warning">(via IP — enviado a ip-api.com)</span>
                </p>
              </div>
            </div>

            <div
              class="bg-success/10 border-success/20 flex items-start gap-3 rounded-lg border p-3"
            >
              <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-4 shrink-0" />
              <div>
                <p class="text-sm font-medium">Páginas visitadas nesta sessão</p>
                <p class="text-muted mt-0.5 text-xs">
                  {{ session.pagesVisited.join(" → ") || "/" }}
                </p>
              </div>
            </div>

            <div
              class="bg-success/10 border-success/20 flex items-start gap-3 rounded-lg border p-3"
            >
              <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-4 shrink-0" />
              <div>
                <p class="text-sm font-medium">Tempo no site</p>
                <p class="text-muted mt-0.5 text-xs">{{ session.formatTimeOnSite() }}</p>
              </div>
            </div>
          </div>

          <p class="text-default mb-6 text-sm font-medium">
            E isso é genuinamente tudo. Sem cookies de rastreamento, sem fingerprinting, sem pixels
            de anúncio.
          </p>

          <!-- What we COULD have collected (ironic) -->
          <div class="mb-8">
            <p class="text-muted mb-3 text-sm font-medium">
              Mas se eu seguisse o manual da maioria dos sites na internet...
            </p>
            <div class="border-error/20 bg-error/5 space-y-2 rounded-xl border p-4">
              <div
                v-for="item in [
                  'Cookies de rastreamento que vivem 12 meses no seu navegador',
                  'Pixel do Meta e Google Ads acompanhando você no resto da internet',
                  'Fingerprinting: GPU, fontes instaladas, plugins — identificação única sem cookie',
                  'Gravação de scroll, cliques e movimento do cursor (heatmaps)',
                  'Tempo exato em cada elemento da página',
                  'Venda desses dados para corretoras de dados (data brokers)',
                  'Criação de perfil inferido: renda, interesses, comportamento político',
                ]"
                :key="item"
                class="flex items-start gap-2"
              >
                <UIcon name="i-lucide-x-circle" class="text-error mt-0.5 size-4 shrink-0" />
                <p class="text-muted text-xs">{{ item }}</p>
              </div>
            </div>
          </div>

          <div class="border-default bg-muted/20 mb-8 rounded-xl border p-4">
            <p class="text-muted text-sm">
              <span class="text-default font-medium">A LGPD</span> (Lei Geral de Proteção de Dados)
              garante que você tem o direito de saber o que é coletado sobre você e o direito de não
              ter seus dados processados sem consentimento. Achei que você gostaria de ver isso na
              prática.
            </p>
          </div>

          <div class="flex gap-3">
            <UButton @click="revealNext">Deixar um rastro voluntário →</UButton>
            <UButton variant="ghost" @click="skipConsent">Só ver quem visitou</UButton>
          </div>
        </div>

        <!-- ── Step: Consent form ────────────────────────────────────────── -->
        <div v-else-if="consentStep === 'form'">
          <div class="mb-6">
            <button
              class="text-muted hover:text-default mb-4 flex items-center gap-1 text-sm transition"
              @click="consentStep = 'reveal'"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" /> Voltar
            </button>
            <h2 class="mb-2 text-2xl font-bold">Deixe seu rastro.</h2>
            <p class="text-muted text-sm">
              Compartilhe o que quiser. Seus dados ficam armazenados com a política de privacidade
              da LGPD — você pode pedir a remoção a qualquer momento em
              <span class="font-medium">pedro.maciel@institutomix.com.br</span>.
            </p>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="submitConsent">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Nome *">
                <UInput v-model="consentForm.name" required placeholder="João Silva" />
              </UFormField>
              <UFormField label="Email *">
                <UInput
                  v-model="consentForm.email"
                  type="email"
                  required
                  placeholder="joao@empresa.com"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Empresa">
                <UInput v-model="consentForm.company" placeholder="Empresa ABC" />
              </UFormField>
              <UFormField label="Cargo">
                <UInput v-model="consentForm.role" placeholder="Engenheiro de Software" />
              </UFormField>
            </div>

            <UFormField label="Interesses em tecnologia">
              <div class="mt-1 flex flex-wrap gap-2">
                <button
                  v-for="i in suggestedInterests"
                  :key="i"
                  type="button"
                  :class="[
                    'rounded-full border px-3 py-1 text-xs transition',
                    consentForm.interests.includes(i)
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-default text-muted hover:border-primary hover:text-default',
                  ]"
                  @click="toggleInterest(i)"
                >
                  {{ i }}
                </button>
              </div>
            </UFormField>

            <div class="border-default bg-muted/20 flex items-center gap-3 rounded-lg border p-3">
              <USwitch v-model="consentForm.isPublic" />
              <div>
                <p class="text-sm font-medium">Aparecer na lista pública de visitantes</p>
                <p class="text-muted text-xs">
                  Seu nome e cargo ficam visíveis para outros visitantes
                </p>
              </div>
            </div>

            <p class="text-muted text-xs">
              Ao enviar, você consente com o armazenamento dos dados informados acima + os dados
              técnicos passivos coletados durante a visita, conforme a LGPD (versão
              {{ CONSENT_VERSION }}).
            </p>

            <div class="flex gap-3">
              <UButton type="submit" :loading="submitting">Enviar</UButton>
              <UButton variant="ghost" @click="skipConsent">Pular</UButton>
            </div>
          </form>
        </div>

        <!-- ── Step: Public visitors ─────────────────────────────────────── -->
        <div v-else-if="consentStep === 'visitors'">
          <div class="mb-6">
            <p class="text-primary mb-2 text-xs font-medium tracking-widest uppercase">
              Quem passou por aqui
            </p>
            <h2 class="mb-2 text-2xl font-bold">
              {{
                publicVisitors.length > 0
                  ? `${publicVisitors.length} visitantes`
                  : "Nenhum visitante público ainda"
              }}
            </h2>
            <p class="text-muted text-sm">
              Pessoas que visitaram e autorizaram exibição pública do perfil.
            </p>
          </div>

          <div v-if="publicVisitors.length" class="mb-8 grid gap-3 sm:grid-cols-2">
            <div
              v-for="v in publicVisitors"
              :key="v.id"
              class="border-default bg-muted/10 flex items-center gap-3 rounded-lg border p-3"
            >
              <div
                class="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              >
                {{ initials(v.name) }}
              </div>
              <div class="overflow-hidden">
                <p class="truncate text-sm font-medium">{{ v.name }}</p>
                <p v-if="v.role || v.company" class="text-muted truncate text-xs">
                  {{ [v.role, v.company].filter(Boolean).join(" · ") }}
                </p>
                <div v-if="v.interests.length" class="mt-1 flex flex-wrap gap-1">
                  <span
                    v-for="i in v.interests.slice(0, 3)"
                    :key="i"
                    class="bg-muted rounded-full px-1.5 py-0.5 text-[10px]"
                    >{{ i }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="border-default text-muted mb-8 rounded-xl border border-dashed p-8 text-center text-sm"
          >
            Seja o primeiro a deixar um rastro.
          </div>

          <UButton @click="exitTour" variant="outline" block>Fechar</UButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
