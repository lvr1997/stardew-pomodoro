<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from 'radix-vue'
import type { GridSize } from '@/types/task'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [payload: { name: string; size: GridSize; tasks: string[] }]
}>()

const { t } = useI18n()

const listName = ref('')
const selectedSize = ref<GridSize>(25)
const taskTags = ref<string[]>([])

const sizeOptions: { value: GridSize; label: string }[] = [
  { value: 4, label: '2 x 2' },
  { value: 9, label: '3 x 3' },
  { value: 16, label: '4 x 4' },
  { value: 25, label: '5 x 5' },
  { value: 49, label: '7 x 7' },
]

const normalizedTaskTags = computed(() => {
  return taskTags.value.map((task) => task.trim()).filter(Boolean)
})

const requiredTaskCount = computed(() => selectedSize.value)
const isTaskCountValid = computed(() => normalizedTaskTags.value.length === requiredTaskCount.value)
const isCreateDisabled = computed(() => listName.value.trim().length === 0 || !isTaskCountValid.value)

const resetForm = () => {
  listName.value = ''
  selectedSize.value = 25
  taskTags.value = []
}

const handleCreate = () => {
  const name = listName.value.trim()
  if (!name || !isTaskCountValid.value) return

  emit('create', {
    name,
    size: selectedSize.value,
    tasks: normalizedTaskTags.value,
  })
  resetForm()
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="handleClose">
    <div class="modal-panel">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-bold text-[#5e2c2a]">{{ t('bingoTodo.createBoard') }}</h3>
        <button type="button" class="icon-btn" @click="handleClose">
          <i class="i-pixelarticons:close" />
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-3">
        <label class="field-label" for="board-name">{{ t('bingoTodo.boardName') }}</label>
        <input
          id="board-name"
          v-model="listName"
          type="text"
          maxlength="32"
          class="field-input"
          :placeholder="t('bingoTodo.boardNamePlaceholder')"
        />
      </div>

      <div class="mt-4">
        <p class="field-label">{{ t('bingoTodo.boardSize') }}</p>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <button
            v-for="option in sizeOptions"
            :key="option.value"
            type="button"
            class="size-chip"
            :class="{ 'size-chip-active': selectedSize === option.value }"
            @click="selectedSize = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between gap-3">
          <p class="field-label">{{ t('bingoTodo.taskNames') }}</p>
          <span class="field-count" :class="{ 'field-count-error': !isTaskCountValid && normalizedTaskTags.length > 0 }">
            {{ normalizedTaskTags.length }} / {{ requiredTaskCount }}
          </span>
        </div>

        <TagsInputRoot
          v-model="taskTags"
          class="tags-root mt-2"
          :max="requiredTaskCount"
          delimiter=","
          add-on-paste
        >
          <div class="tags-list">
            <TagsInputItem
              v-for="task in taskTags"
              :key="task"
              :value="task"
              class="task-tag"
            >
              <TagsInputItemText class="task-tag-text" />
              <TagsInputItemDelete class="task-tag-delete">
                <i class="i-pixelarticons:close" />
              </TagsInputItemDelete>
            </TagsInputItem>

            <TagsInputInput
              class="tags-input"
              :placeholder="t('bingoTodo.taskInputPlaceholder')"
              :max-length="40"
            />
          </div>

          <div class="mt-2 flex items-center justify-between gap-2">
            <p class="helper-text">{{ t('bingoTodo.taskInputHint') }}</p>
            <TagsInputClear class="clear-btn">
              {{ t('bingoTodo.clearTasks') }}
            </TagsInputClear>
          </div>
        </TagsInputRoot>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <button type="button" class="secondary-btn" @click="handleClose">{{ t('bingoTodo.cancel') }}</button>
        <button type="button" class="primary-btn" :disabled="isCreateDisabled" @click="handleCreate">
          {{ t('bingoTodo.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 20, 11, 0.52);
  backdrop-filter: blur(1px);
}

.modal-panel {
  width: min(92%, 460px);
  border: 3px solid #7c4a1e;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8dc9c 0%, #efc071 100%);
  padding: 16px;
  box-shadow: 0 14px 28px rgba(48, 28, 17, 0.24);
}

.icon-btn,
.primary-btn,
.secondary-btn,
.size-chip,
.clear-btn {
  border: 2px solid #7c4a1e;
  border-radius: 8px;
  color: #5e2c2a;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 249, 224, 0.55);
}

.field-label {
  font-size: 11px;
  color: #7a5430;
}

.field-count {
  font-size: 10px;
  color: #7a5430;
}

.field-count-error {
  color: #a13b22;
}

.field-input {
  border: 2px solid #a1692c;
  border-radius: 8px;
  background: rgba(255, 248, 228, 0.92);
  padding: 10px 12px;
  color: #5e2c2a;
  outline: none;
}

.field-input:focus {
  border-color: #d78004;
}

.tags-root {
  border: 2px solid #a1692c;
  border-radius: 8px;
  background: rgba(255, 248, 228, 0.92);
  padding: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #8d5c24;
  border-radius: 999px;
  background: rgba(215, 128, 4, 0.14);
  padding: 6px 8px;
  color: #5e2c2a;
}

.task-tag-text {
  font-size: 11px;
}

.task-tag-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(124, 74, 30, 0.12);
}

.tags-input {
  min-width: 140px;
  flex: 1;
  border: 0;
  background: transparent;
  padding: 6px 4px;
  color: #5e2c2a;
  outline: none;
}

.helper-text {
  font-size: 10px;
  color: #7a5430;
}

.clear-btn {
  background: rgba(255, 248, 228, 0.7);
  padding: 4px 8px;
  font-size: 10px;
}

.size-chip {
  min-height: 40px;
  background: rgba(255, 248, 228, 0.7);
  font-size: 11px;
}

.size-chip-active {
  background: #d78004;
  color: white;
}

.primary-btn,
.secondary-btn {
  min-width: 82px;
  padding: 8px 12px;
}

.primary-btn {
  background: #d78004;
  color: white;
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.secondary-btn {
  background: rgba(255, 248, 228, 0.7);
}
</style>
