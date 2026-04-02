<template>
  <div class="flex flex-col h-64 bg-white">
    <!-- Header -->
    <div class="p-3 border-b border-gray-200">
      <h2 class="text-sm font-bold text-gray-900">
        {{ sessionStore.hasSession ? 'Todos' : 'TodoList' }}
      </h2>
    </div>

    <!-- Todo List -->
    <div class="flex-1 overflow-y-auto px-3">
      <div v-if="sessionTodos.length === 0" class="text-center text-gray-400 py-4">
        <p class="text-xs">{{ sessionStore.hasSession ? 'No todos yet' : 'Wait for session' }}</p>
      </div>
      
      <div v-else class="space-y-1">
        <div
          v-for="todo in sessionTodos"
          :key="todo.id"
          class="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition group border border-gray-200 text-sm"
        >
          <!-- Edit Mode -->
          <div v-if="editingTodoId === todo.id" class="flex-1 flex gap-1">
            <input
              v-model="editingTodoText"
              type="text"
              class="flex-1 p-2 py-1 text-gray-900 placeholder-gray-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              autofocus
              @keyup.enter="handleSaveEdit(todo.id)"
              @keyup.escape="handleCancelEdit"
            />
            <button
              @click="handleSaveEdit(todo.id)"
              class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
            >
              <i class="i-tabler-check w-3 h-3" />
            </button>
            <button
              @click="handleCancelEdit"
              class="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs"
            >
              <i class="i-tabler-x w-3 h-3" />
            </button>
          </div>

          <!-- View Mode -->
          <template v-else>
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
                @dblclick="handleStartEdit(todo.id, todo.title)"
                :class="[
                  'text-xs transition truncate cursor-text',
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
              class="p-1 opacity-0 text-red-600 rounded transition group-hover:opacity-100 flex-shrink-0"
            >
              <i class="i-tabler-trash w-3 h-3" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Bottom Buttons: Always visible -->
    <div class="p-3 border-t border-gray-200">
      <div class="flex gap-2">
        <button
          @click="handleNewTask"
          :disabled="!sessionStore.hasSession || editingTodoId !== null"
          class="flex-1 px-2 py-1 rounded font-medium text-xs flex items-center justify-center gap-1 transition"
          :class="(sessionStore.hasSession && editingTodoId === null)
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
        >
          <i class="i-tabler-plus w-3 h-3" />
          <span>New Task</span>
        </button>
        <button
          @click="handleNewGroup"
          :disabled="!sessionStore.hasSession || editingTodoId !== null"
          class="flex-1 px-2 py-1 rounded font-medium text-xs flex items-center justify-center gap-1 transition"
          :class="(sessionStore.hasSession && editingTodoId === null)
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
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

const editingTodoId = ref<string | null>(null)
const editingTodoText = ref('')

const sessionTodos = computed(() => {
  if (!sessionStore.currentSession) return []
  return todoStore.getTodosBySession(sessionStore.currentSession.id)
})

const handleNewTask = () => {
  if (!sessionStore.currentSession) return
  
  // 添加一个空的待编辑的todo
  const newTodo = todoStore.addTodo('', sessionStore.currentSession.id)
  
  // 立即进入编辑模式
  editingTodoId.value = newTodo.id
  editingTodoText.value = ''
}

const handleNewGroup = () => {
  if (!sessionStore.currentSession) return
  alert('Group功能开发中...')
}

const handleStartEdit = (todoId: string, currentTitle: string) => {
  editingTodoId.value = todoId
  editingTodoText.value = currentTitle
}

const handleSaveEdit = (todoId: string) => {
  if (editingTodoText.value.trim()) {
    todoStore.updateTodo(todoId, editingTodoText.value.trim())
  } else {
    // 如果为空则删除
    todoStore.deleteTodo(todoId)
  }
  
  editingTodoId.value = null
  editingTodoText.value = ''
}

const handleCancelEdit = () => {
  // 如果是新建的todo且为空，则删除
  if (editingTodoId.value && editingTodoText.value.trim() === '') {
    const todo = todoStore.todos.find(t => t.id === editingTodoId.value)
    if (todo && todo.title === '') {
      todoStore.deleteTodo(editingTodoId.value)
    }
  }
  
  editingTodoId.value = null
  editingTodoText.value = ''
}
</script>

<style scoped>
</style>
