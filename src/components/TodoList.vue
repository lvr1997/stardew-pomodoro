<template>
    <div class="w-full flex flex-col">
        <!-- Header -->
        <div class="panel-header">
            <h2 class="text-sm font-bold text-center text-text">{{ t('todos.title') }}</h2>
        </div>

        <!-- Todo List -->
        <div class="panel flex-1 flex flex-col">
            <div class="flex-1 overflow-y-auto px-3 py-2">
                <!-- Empty State -->
                <div v-if="todos.length === 0" class="text-center text-gray-500 py-4">
                    <p class="text-xs">{{ t('todos.empty') }}</p>
                </div>
                <!-- Todo Items -->
                <div v-else class="space-y-1">
                    <div v-for="todo in todos" :key="todo.id"
                        class="flex items-center gap-2 px-2 py-1.5 bg-[var(--color-surface)]/60 rounded hover:bg-[var(--color-surface)]/80 transition group">
                        <!-- Edit Mode -->
                        <div v-if="editingTodoId === todo.id" class="flex-1 flex gap-1">
                            <input v-model="editingTodoText" type="text"
                                class="flex-1 p-1 text-gray-900 placeholder-gray-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autofocus @keyup.enter="handleSaveEdit(todo.id)" @keyup.escape="handleCancelEdit" />
                            <button @click="handleSaveEdit(todo.id)"
                                class="px-1.5 py-0.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs">
                                <i class="i-pixelarticons:check w-3 h-3" />
                            </button>
                            <button @click="handleCancelEdit"
                                class="px-1.5 py-0.5 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs">
                                <i class="i-pixelarticons:close w-3 h-3" />
                            </button>
                        </div>
                        <!-- View Mode -->
                        <template v-else>
                            <CheckBox :model-value="todo.completed"
                                @update:model-value="todoStore.toggleTodo(todo.id)" />
                            <p @dblclick="handleStartEdit(todo.id, todo.title)" :class="[
                                'flex-1 min-w-0 text-xs transition truncate cursor-text',
                                todo.completed ? 'line-through' : 'text-gray-900'
                            ]" :title="todo.title">{{ todo.title }}</p>
                            <button @click="todoStore.deleteTodo(todo.id)"
                                class="p-1 opacity-0 text-red-600 hover:text-red-700 rounded transition group-hover:opacity-100 flex-shrink-0">
                                <i class="i-pixelarticons:trash w-3 h-3" />
                            </button>
                        </template>
                    </div>
                </div>
            </div>

        <!-- Bottom Input Area -->
        <div class="p-3 flex gap-2 border-t-2 border-border">
            <input v-model="newTodoText" type="text" :placeholder="t('todos.task')" 
                class="input-base flex-1 px-2"
                @keyup.enter="handleAddTodo" />
            <button @click="handleAddTodo" :disabled="!newTodoText.trim()" class="btn">
                <i class="i-pixelarticons:plus w-4 h-4" />
            </button>
        </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTodoStore } from '../stores/todolist'
import CheckBox from './common/CheckBox.vue'


const { t } = useI18n()
const todoStore = useTodoStore()

// State
const newTodoText = ref('')
const editingTodoId = ref<string | null>(null)
const editingTodoText = ref('')

// Computed - 所有 todo 按创建时间倒序排列
const todos = computed(() => {
    return [...todoStore.todos].sort((a, b) => b.createdAt - a.createdAt)
})

// Methods
const handleAddTodo = () => {
    const text = newTodoText.value.trim()
    if (!text) return

    todoStore.addTodo(text)
    newTodoText.value = ''
}

const handleStartEdit = (todoId: string, currentTitle: string) => {
    editingTodoId.value = todoId
    editingTodoText.value = currentTitle
}

const handleSaveEdit = (todoId: string) => {
    const text = editingTodoText.value.trim()
    if (text) {
        todoStore.updateTodo(todoId, text)
    } else {
        todoStore.deleteTodo(todoId)
    }

    editingTodoId.value = null
    editingTodoText.value = ''
}

const handleCancelEdit = () => {
    editingTodoId.value = null
    editingTodoText.value = ''
}
</script>

<style scoped>
.panel {
    background-image: url('../assets/themes/letterBG.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
</style>
