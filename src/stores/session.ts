import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Session {
  id: string
  name: string
  focusTime: number // 专注时间（分钟）
  createdAt: number
}

export const useSessionStore = defineStore('session', () => {
  const currentSession = ref<Session | null>(null)

  // 从localStorage加载数据
  const loadSession = () => {
    const stored = localStorage.getItem('currentSession')
    if (stored) {
      currentSession.value = JSON.parse(stored)
    }
  }

  // 保存到localStorage
  const saveSession = () => {
    if (currentSession.value) {
      localStorage.setItem('currentSession', JSON.stringify(currentSession.value))
    } else {
      localStorage.removeItem('currentSession')
    }
  }

  const createSession = (name: string, focusTime: number) => {
    const newSession: Session = {
      id: Date.now().toString(),
      name,
      focusTime,
      createdAt: Date.now()
    }
    currentSession.value = newSession
    saveSession()
    return newSession
  }

  const deleteSession = () => {
    currentSession.value = null
    saveSession()
  }

  const updateSession = (name: string, focusTime: number) => {
    if (currentSession.value) {
      currentSession.value.name = name
      currentSession.value.focusTime = focusTime
      saveSession()
    }
  }

  const hasSession = computed(() => currentSession.value !== null)

  return {
    currentSession,
    createSession,
    deleteSession,
    updateSession,
    hasSession,
    loadSession,
    saveSession
  }
})
