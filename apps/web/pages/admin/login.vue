<script setup lang="ts">
definePageMeta({ layout: "blank" });

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function handleLogin() {
  loading.value = true;
  errorMsg.value = "";
  try {
    await auth.login(email.value, password.value);
    router.push("/admin");
  } catch {
    errorMsg.value = "Email ou senha incorretos.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UCard class="w-full max-w-sm">
    <template #header>
      <div>
        <h1 class="text-xl font-semibold">Painel Admin</h1>
        <p class="text-sm text-muted">Portfolio · Pedro Maciel</p>
      </div>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
      <UFormField label="Email">
        <UInput
          v-model="email"
          type="email"
          placeholder="admin@portfolio.dev"
          required
          autofocus
        />
      </UFormField>

      <UFormField label="Senha">
        <UInput
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </UFormField>

      <p v-if="errorMsg" class="text-sm text-error">{{ errorMsg }}</p>

      <UButton type="submit" :loading="loading" block>
        Entrar
      </UButton>
    </form>
  </UCard>
</template>
