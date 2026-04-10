import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { GridSize, TaskItem, TaskList } from '@/types/task'

const DEFAULT_GRID_SIZE: GridSize = 25

const DEFAULT_TASK_LABELS = [
  'Morning stretch',
  'Drink water',
  'Inbox zero',
  'Read 20 minutes',
  'Plan top 3',
  'Quick walk',
  'Focus sprint',
  'Healthy snack',
  'Journal one line',
  'Desk reset',
  'Reply important mail',
  'Language practice',
  'Study notes',
  'Budget check',
  'Meditate',
  'Call family',
  'Tidy room',
  'Review goals',
  'Practice hobby',
  'Prepare tomorrow',
  'No doomscrolling',
  'Cook something',
  'Workout',
  'Stretch break',
  'Sleep on time',
]

const createTasks = (taskNames: string[]): TaskItem[] => {
  return taskNames.map((taskName, index) => ({
    id: `task-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    text: taskName,
    completed: false,
    position: index,
  }))
}

const normalizeTaskNames = (taskNames: string[], size: GridSize) => {
  return taskNames
    .map((taskName) => taskName.trim())
    .filter(Boolean)
    .slice(0, size)
}

const getDefaultTaskNames = (size: GridSize) => {
  return Array.from({ length: size }, (_, index) => DEFAULT_TASK_LABELS[index] ?? `Task ${index + 1}`)
}

const createTaskListRecord = (name: string, size: GridSize, taskNames: string[], isDefault = false): TaskList => {
  return {
    id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    size,
    tasks: createTasks(normalizeTaskNames(taskNames, size)),
    createdAt: Date.now(),
    isDefault,
  }
}

export const useTaskStore = defineStore('task-board', () => {
  const taskLists = useLocalStorage<TaskList[]>('bingo-task-lists', [])
  const currentListId = useLocalStorage<string>('bingo-current-list-id', '')

  const ensureInitialized = () => {
    if (taskLists.value.length === 0) {
      const defaultList = createTaskListRecord(
        'My First Bingo',
        DEFAULT_GRID_SIZE,
        getDefaultTaskNames(DEFAULT_GRID_SIZE),
        true
      )
      taskLists.value = [defaultList]
      currentListId.value = defaultList.id
      return
    }

    if (!taskLists.value.some((list) => list.id === currentListId.value)) {
      currentListId.value = taskLists.value[0]?.id ?? ''
    }
  }

  ensureInitialized()

  const currentList = computed(() => {
    return taskLists.value.find((list) => list.id === currentListId.value) ?? null
  })

  const sortedTaskLists = computed(() => {
    return [...taskLists.value].sort((left, right) => right.createdAt - left.createdAt)
  })

  const createTaskList = (name: string, size: GridSize, taskNames: string[]) => {
    const nextList = createTaskListRecord(name, size, taskNames)
    taskLists.value.unshift(nextList)
    currentListId.value = nextList.id
    return nextList
  }

  const selectTaskList = (listId: string) => {
    if (taskLists.value.some((list) => list.id === listId)) {
      currentListId.value = listId
    }
  }

  const renameTaskList = (listId: string, name: string) => {
    const taskList = taskLists.value.find((list) => list.id === listId)
    if (taskList) {
      taskList.name = name.trim() || taskList.name
    }
  }

  const deleteTaskList = (listId: string) => {
    taskLists.value = taskLists.value.filter((list) => list.id !== listId)
    ensureInitialized()
  }

  const toggleTask = (taskId: string) => {
    const task = currentList.value?.tasks.find((entry) => entry.id === taskId)
    if (task && !task.completed) {
      task.completed = true
    }
  }

  const resetCurrentList = () => {
    currentList.value?.tasks.forEach((task) => {
      task.completed = false
    })
  }

  return {
    currentListId,
    currentList,
    taskLists,
    sortedTaskLists,
    createTaskList,
    selectTaskList,
    renameTaskList,
    deleteTaskList,
    toggleTask,
    resetCurrentList,
  }
})
