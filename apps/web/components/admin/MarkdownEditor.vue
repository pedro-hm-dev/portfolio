<script setup lang="ts">
const model = defineModel<string>({ default: "" });

const showPreview = ref(false);
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <UButton
        type="button"
        size="xs"
        :variant="!showPreview ? 'solid' : 'ghost'"
        @click="showPreview = false"
      >
        Editor
      </UButton>
      <UButton
        type="button"
        size="xs"
        :variant="showPreview ? 'solid' : 'ghost'"
        @click="showPreview = true"
      >
        Preview
      </UButton>
    </div>

    <UTextarea
      v-if="!showPreview"
      v-model="model"
      :rows="14"
      class="font-mono text-sm"
      placeholder="Escreva em Markdown..."
    />

    <div
      v-else
      class="prose dark:prose-invert max-w-none min-h-64 rounded-md border border-default p-4 text-sm"
    >
      <MDC v-if="model" :value="model" />
      <p v-else class="text-muted italic">Nenhum conteúdo para pré-visualizar.</p>
    </div>
  </div>
</template>
