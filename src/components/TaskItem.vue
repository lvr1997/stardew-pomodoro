<script setup lang="ts">
import { computed } from 'vue'
import type { TaskItem as BingoTaskItem } from '@/types/task'

const props = defineProps<{
  task: BingoTaskItem
  highlighted?: boolean
}>()

const emit = defineEmits<{
  toggle: [taskId: string]
}>()

const cardClass = computed(() => {
  if (props.highlighted) return 'task-card task-card-bingo'
  if (props.task.completed) return 'task-card task-card-done'
  return 'task-card task-card-idle'
})
</script>

<template>
  <div :class="cardClass">
    <div class="task-stamp">{{ task.position + 1 }}</div>
    <button
      type="button"
      class="task-button"
      :disabled="task.completed"
      @click="emit('toggle', task.id)"
    >
      <span class="task-copy">{{ task.text }}</span>
      <span class="task-state">{{ task.completed ? 'DONE' : 'TODO' }}</span>
    </button>
  </div>
</template>

<style scoped>
.task-card {
  position: relative;
  display: flex;
  min-height: 100%;
  border: 2px solid #7c4a1e;
  border-radius: 8px;
  box-shadow: inset 0 0 0 2px rgba(255, 245, 210, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.task-card:hover {
  transform: translateY(-1px);
}

.task-card-idle {
  background: linear-gradient(180deg, #f6d88d 0%, #efc676 100%);
}

.task-card-done {
  background: linear-gradient(180deg, #d9b466 0%, #c79a49 100%);
}

.task-card-bingo {
  background: linear-gradient(180deg, #f7e8a8 0%, #e0ad45 100%);
  box-shadow: 0 0 0 2px rgba(255, 237, 138, 0.6), 0 0 14px rgba(244, 185, 52, 0.45);
}

.task-stamp {
  position: absolute;
  top: 6px;
  left: 8px;
  font-size: 10px;
  color: rgba(94, 44, 42, 0.7);
}

.task-button {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 22px 10px 10px;
  text-align: left;
  background: transparent;
  border: 0;
  color: #5e2c2a;
  outline: none;
  cursor: pointer;
}

.task-button:disabled {
  cursor: default;
}

.task-copy {
  display: -webkit-box;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.35;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.task-state {
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(94, 44, 42, 0.65);
}
</style>
