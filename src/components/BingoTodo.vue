<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BingoTodoGrid from '@/components/BingoTodoGrid.vue'
import TaskListManager from '@/components/TaskListManager.vue'
import { useBingoStore } from '@/stores/bingoStore'
import { useTaskStore } from '@/stores/taskStore'
import type { GridSize } from '@/types/task'

const { t } = useI18n()
const taskStore = useTaskStore()
const bingoStore = useBingoStore()

const dimensionLabel = computed(() => {
  const size = taskStore.currentList?.size
  if (!size) return '--'
  const dimension = Math.sqrt(size)
  return `${dimension} x ${dimension}`
})

const progressLabel = computed(() => {
  const total = taskStore.currentList?.tasks.length ?? 0
  return `${bingoStore.completedCount} / ${total}`
})

const handleCreate = (payload: { name: string; size: GridSize; tasks: string[] }) => {
  taskStore.createTaskList(payload.name, payload.size, payload.tasks)
}
</script>

<template>
  <div class="bingo-panel">
    <div class="panel-header">
      <TaskListManager
        :lists="taskStore.sortedTaskLists"
        :current-list="taskStore.currentList"
        @select="taskStore.selectTaskList"
        @create="handleCreate"
        @rename="taskStore.renameTaskList($event.listId, $event.name)"
        @reset="taskStore.resetCurrentList"
        @delete="taskStore.deleteTaskList"
      />
    </div>

    <div class="panel-body">
      <div class="stats-strip">
        <div class="stat-card">
          <span class="stat-label">{{ t('bingoTodo.grid') }}</span>
          <strong class="stat-value">{{ dimensionLabel }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">{{ t('bingoTodo.progress') }}</span>
          <strong class="stat-value">{{ progressLabel }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">{{ t('bingoTodo.bingoCount') }}</span>
          <strong class="stat-value">{{ bingoStore.bingoCount }}</strong>
        </div>
      </div>

      <div v-if="taskStore.currentList" class="grid-wrap">
        <div v-if="bingoStore.hasBingo" class="bingo-banner">
          {{ t('bingoTodo.banner', { count: bingoStore.bingoCount }) }}
        </div>

        <BingoTodoGrid
          :tasks="taskStore.currentList.tasks"
          :grid-size="taskStore.currentList.size"
          :bingo-lines="bingoStore.currentBingoLines"
          @toggle="taskStore.toggleTask"
        />
      </div>

      <div v-else class="empty-state">
        <p>{{ t('bingoTodo.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bingo-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.panel-header,
.panel-body {
  border: 12px solid transparent;
  border-image: url('../assets/themes/border.png') 15 stretch;
  background: #fbc16b;
  box-shadow: none;
  border-radius: 15px;
}

.panel-body {
  margin-top: 10px;
  padding: 14px;
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.stat-card {
  border: 2px solid rgba(124, 74, 30, 0.58);
  border-radius: 10px;
  background: rgba(255, 247, 223, 0.52);
  padding: 10px;
}

.stat-label {
  display: block;
  font-size: 10px;
  color: #875621;
}

.stat-value {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  color: #5e2c2a;
}

.grid-wrap {
  margin-top: 14px;
}

.bingo-banner {
  margin-bottom: 10px;
  border: 2px solid #9b611d;
  border-radius: 10px;
  background: linear-gradient(90deg, #f7e5aa 0%, #f0c86b 100%);
  padding: 10px 12px;
  text-align: center;
  color: #714012;
}

.empty-state {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  color: #875621;
  text-align: center;
}

@media (max-width: 640px) {
  .stats-strip {
    grid-template-columns: 1fr;
  }
}
</style>
