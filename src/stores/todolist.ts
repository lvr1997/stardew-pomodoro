import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

export const useTodoStore = defineStore('todo', () => {
  // 使用 useLocalStorage 自动同步
  const todos = useLocalStorage<Todo[]>('todos', [])

  const addTodo = (title: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now()
    }
    todos.value.push(newTodo)
    return newTodo
  }

  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  const updateTodo = (id: string, title: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.title = title
    }
  }

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo
  }
})
