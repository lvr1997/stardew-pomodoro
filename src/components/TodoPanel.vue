<template>
  <div class="flex flex-col h-64 bg-white">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200">
      <h2 class="text-sm font-bold text-gray-900">
        {{ sessionStore.hasSession ? 'Todos' : 'TodoList' }}
      </h2>
    </div>

    <!-- Todo List -->
    <div v-if="sessionStore.hasSession" class="flex-1 overflow-y-auto p-3">
      <div v-if="sessionTodos.length === 0" class="text-center text-gray-400 py-4">
        <p class="text-xs">No todos yet</p>
      </div>
      
      <div v-else class="space-y-1">
        <div
          v-for="todo in sessionTodos"
          :key="todo.id"
          class="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition group border border-gray-200 text-sm"
        >
          <!-- Checkbox -->
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="todoStore.toggleTodo(todo.id)"
            class="w-4 h-4 cursor-pointer flex-shrink-0"
          />

          <!-- Todo Text -->
          <div class="flex-1 min-w-0">
            <p
              :class="[
                'text-xs transition truncate',
                todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
              ]"
              :title="todo.title"
            >
              {{ todo.title }}
            </p>
          </div>

          <!-- Delete Button -->
          <button
            @click="todoStore.deleteTodo(todo.id)"
            class="p-1 opacity-0 hover:bg-red-100 text-red-600 rounded transition group-hover:opacity-100 flex-shrink-0"
          >
            <i class="i-tabler-trash w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center p-3">
      <div class="text-center">
        <i class="i-tabler-inbox w-8 h-8 text-gray-300 mx-auto mb-1" />
        <p class="text-gray-400 text-xs">待创建</p>
      </div>
    </div>

    <!-- Add Todo Input or Disabled Buttons -->
    <div class="p-3 border-t border-gray-200">
      <div v-if="sessionStore.hasSession" class="flex gap-2">
        <input
          v-model="newTodoTitle"
          type="text"
          placeholder="Add todo..."
          class="flex-1 px-2 py-1 text-gray-900 placeholder-gray-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="handleAddTodo"
        />
        <button
          @click="handleAddTodo"
          class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          :disabled="!newTodoTitle.trim()"
        >
          <i class="i-tabler-plus w-3 h-3" />
        </button>
      </div>

      <!-- Disabled Buttons State -->
      <div v-else class="flex gap-2">
        <button
          disabled
          class="flex-1 px-2 py-1 bg-gray-200 text-gray-500 rounded font-medium cursor-not-allowed text-xs flex items-center justify-center gap-1"
        >
          <i class="i-tabler-plus w-3 h-3" />
          <span>Todo</span>
        </button>
        <button
          disabled
          class="flex-1 px-2 py-1 bg-gray-200 text-gray-500 rounded font-medium cursor-not-allowed text-xs flex items-center justify-center gap-1"
        >
          <i class="i-tabler-plus w-3 h-3" />
          <span>Group</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/session'
import { useTodoStore } from '../stores/todolist'

const sessionStore = useSessionStore()
const todoStore = useTodoStore()

const newTodoTitle = ref('')

const sessionTodos = computed(() => {
  if (!sessionStore.currentSession) return []
  return todoStore.getTodosBySession(sessionStore.currentSession.id)
})

const handleAddTodo = () => {
  if (!newTodoTitle.value.trim() || !sessionStore.currentSession) return

  todoStore.addTodo(newTodoTitle.value, sessionStore.currentSession.id)
  newTodoTitle.value = ''
}
</script>

<style scoped>
</style>
