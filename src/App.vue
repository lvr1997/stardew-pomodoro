<script setup lang="ts">
import { ToastProvider } from 'radix-vue';
import Home from '@/pages/index.vue';
import Toast from '@/components/common/Toast.vue';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
</script>

<template>
  <ToastProvider>
    <Home />
    <Toast :open="toast.open" :title="toast.title" :onClose="toast.close" />
  </ToastProvider>
</template>
