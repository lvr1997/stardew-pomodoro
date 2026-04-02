import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Todo {
  id: string
  title: string
  completed: boolean
  sessionId: string
  createdAt: number
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])

  // 从localStorage加载数据
  const loadTodos = () => {
    const stored = localStorage.getItem('todos')
    if (stored) {
      todos.value = JSON.parse(stored)
    }
  }

  // 保存到localStorage
  const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos.value))
  }

  const addTodo = (title: string, sessionId: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      sessionId,
      createdAt: Date.now()
    }
    todos.value.push(newTodo)
    saveTodos()
    return newTodo
  }

  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      saveTodos()
    }
  }

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
    saveTodos()
  }

  const updateTodo = (id: string, title: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.title = title
      saveTodos()
    }
  }

  const getTodosBySession = computed(() => {
    return (sessionId: string) => {
      return todos.value.filter(t => t.sessionId === sessionId)
    }
  })

  const deleteSessionTodos = (sessionId: string) => {
    todos.value = todos.value.filter(t => t.sessionId !== sessionId)
    saveTodos()
  }

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    getTodosBySession,
    deleteSessionTodos,
    loadTodos,
    saveTodos
  }
})
