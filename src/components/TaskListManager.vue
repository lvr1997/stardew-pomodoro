<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CreateTaskList from '@/components/CreateTaskList.vue'
import type { GridSize, TaskList } from '@/types/task'

const props = defineProps<{
  lists: TaskList[]
  currentList: TaskList | null
}>()

const emit = defineEmits<{
  select: [listId: string]
  create: [payload: { name: string; size: GridSize; tasks: string[] }]
  rename: [payload: { listId: string; name: string }]
  reset: []
  delete: [listId: string]
}>()

const { t } = useI18n()

const showCreateModal = ref(false)
const isRenaming = ref(false)
const draftName = ref(props.currentList?.name ?? '')

watch(() => props.currentList?.name, (nextName) => {
  draftName.value = nextName ?? ''
  isRenaming.value = false
})

const boardOptions = computed(() => {
  return props.lists.map((list) => ({
    id: list.id,
    label: `${list.name} · ${Math.sqrt(list.size)}x${Math.sqrt(list.size)}`,
  }))
})

const commitRename = () => {
  if (!props.currentList) return
  emit('rename', { listId: props.currentList.id, name: draftName.value })
  isRenaming.value = false
}
</script>

<template>
  <div class="manager-shell">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="manager-title">{{ t('bingoTodo.title') }}</p>
        <div v-if="currentList" class="mt-2">
          <input
            v-if="isRenaming"
            v-model="draftName"
            type="text"
            maxlength="32"
            class="rename-input"
            autofocus
            @blur="commitRename"
            @keyup.enter="commitRename"
            @keyup.esc="isRenaming = false"
          />
          <button
            v-else
            type="button"
            class="board-name"
            @click="isRenaming = true"
          >
            {{ currentList.name }}
          </button>
        </div>
      </div>

      <div class="flex gap-2">
        <button type="button" class="icon-btn" :title="t('bingoTodo.createBoard')" @click="showCreateModal = true">
          <i class="i-pixelarticons:plus" />
        </button>
        <button type="button" class="icon-btn" :title="t('bingoTodo.resetBoard')" :disabled="!currentList" @click="emit('reset')">
          <i class="i-pixelarticons:reload" />
        </button>
        <button
          type="button"
          class="icon-btn icon-btn-danger"
          :title="t('bingoTodo.deleteBoard')"
          :disabled="!currentList"
          @click="currentList && emit('delete', currentList.id)"
        >
          <i class="i-pixelarticons:trash" />
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <label class="manager-label" for="board-select">{{ t('bingoTodo.chooseBoard') }}</label>
      <select
        id="board-select"
        class="board-select"
        :value="currentList?.id ?? ''"
        @change="emit('select', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="option in boardOptions" :key="option.id" :value="option.id">
          {{ option.label }}
        </option>
      </select>
    </div>

    <CreateTaskList
      :open="showCreateModal"
      @close="showCreateModal = false"
      @create="(payload) => { emit('create', payload); showCreateModal = false }"
    />
  </div>
</template>

<style scoped>
.manager-shell {
  position: relative;
}

.manager-title {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #875621;
}

.board-name {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 18px;
  color: #5e2c2a;
  text-align: left;
}

.rename-input,
.board-select {
  width: 100%;
  border: 2px solid #a1692c;
  border-radius: 8px;
  background: rgba(255, 248, 228, 0.92);
  padding: 8px 10px;
  color: #5e2c2a;
  outline: none;
}

.manager-label {
  font-size: 11px;
  color: #7a5430;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 2px solid #7c4a1e;
  border-radius: 8px;
  background: rgba(255, 248, 228, 0.74);
  color: #5e2c2a;
}

.icon-btn-danger {
  color: #a13b22;
}

.icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
