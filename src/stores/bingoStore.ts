import { computed } from 'vue'
import { defineStore } from 'pinia'
import { checkBingo } from '@/utils/bingoChecker'
import { useTaskStore } from '@/stores/taskStore'

export const useBingoStore = defineStore('bingo-status', () => {
  const taskStore = useTaskStore()

  const completedCount = computed(() => {
    return taskStore.currentList?.tasks.filter((task) => task.completed).length ?? 0
  })

  const currentBingoLines = computed(() => {
    if (!taskStore.currentList) return []

    const completedPositions = taskStore.currentList.tasks
      .filter((task) => task.completed)
      .map((task) => task.position)

    return checkBingo(completedPositions, taskStore.currentList.size)
  })

  const bingoCount = computed(() => currentBingoLines.value.length)
  const hasBingo = computed(() => bingoCount.value > 0)

  return {
    completedCount,
    currentBingoLines,
    bingoCount,
    hasBingo,
  }
})
