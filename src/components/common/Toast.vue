<script lang="ts" setup>
import { ToastRoot, ToastViewport } from 'radix-vue'
import { computed } from 'vue'

const props = defineProps<{
    open: boolean
    onClose?: () => void
    title?: string
}>()

const titleText = computed(() => props.title || '')
</script>

<template>
    <ToastRoot :open="props.open" @update:open="props.onClose?.()">
        <div class="toast text-base px-6 py-2 flex items-center gap-2">
            <span class="font-semibold">{{ titleText }}</span>
        </div>
    </ToastRoot>
    <ToastViewport class="fixed bottom-4 left-4 z-50" />
</template>

<style scoped>
.toast {
    border: 12px solid transparent;
    border-image: url(../../assets/themes/border.png) 15 stretch;
    background: #fbc16b;
    box-shadow: none;
    border-radius: 15px;
}
</style>
