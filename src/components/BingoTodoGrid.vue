<script setup lang="ts">
import { computed } from 'vue'
import TaskItem from '@/components/TaskItem.vue'
import type { BingoLine, GridSize, TaskItem as BingoTaskItem } from '@/types/task'

const props = defineProps<{
  tasks: BingoTaskItem[]
  gridSize: GridSize
  bingoLines: BingoLine[]
}>()

const emit = defineEmits<{
  toggle: [taskId: string]
}>()

const dimension = computed(() => Math.sqrt(props.gridSize))

const sortedTasks = computed(() => {
  return [...props.tasks].sort((left, right) => left.position - right.position)
})

const bingoTaskPositions = computed(() => {
  return new Set(props.bingoLines.flatMap((line) => line.positions))
})

const overlayStyles = computed(() => {
  return props.bingoLines.map((line, index) => {
    if (line.type === 'horizontal') {
      return {
        key: `${line.type}-${line.index}-${index}`,
        style: {
          top: `calc(${((line.index + 0.5) / dimension.value) * 100}% - 4px)`,
          left: '4%',
          width: '92%',
          transform: 'rotate(0deg)',
        },
      }
    }

    if (line.type === 'vertical') {
      return {
        key: `${line.type}-${line.index}-${index}`,
        style: {
          top: '4%',
          left: `calc(${((line.index + 0.5) / dimension.value) * 100}% - 4px)`,
          width: '8px',
          height: '92%',
          transform: 'rotate(0deg)',
        },
      }
    }

    return {
      key: `${line.type}-${line.index}-${index}`,
      style: line.index === 0
        ? {
            top: '50%',
            left: '50%',
            width: '132%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
          }
        : {
            top: '50%',
            left: '50%',
            width: '132%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
          },
    }
  })
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${dimension.value}, minmax(0, 1fr))`,
}))
</script>

<template>
  <div class="board-shell">
    <div class="board-grid" :style="gridStyle">
      <TaskItem
        v-for="task in sortedTasks"
        :key="task.id"
        :task="task"
        :highlighted="bingoTaskPositions.has(task.position)"
        @toggle="emit('toggle', $event)"
      />

      <div
        v-for="line in overlayStyles"
        :key="line.key"
        class="bingo-line"
        :style="line.style"
      />
    </div>
  </div>
</template>

<style scoped>
.board-shell {
  position: relative;
  width: 100%;
}

.board-grid {
  position: relative;
  display: grid;
  gap: 8px;
  aspect-ratio: 1 / 1;
}

.bingo-line {
  position: absolute;
  z-index: 20;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 246, 192, 0.1) 0%, rgba(245, 183, 47, 0.95) 15%, rgba(255, 246, 192, 0.95) 50%, rgba(245, 183, 47, 0.95) 85%, rgba(255, 246, 192, 0.1) 100%);
  box-shadow: 0 0 12px rgba(236, 181, 37, 0.45);
  pointer-events: none;
}
</style>
