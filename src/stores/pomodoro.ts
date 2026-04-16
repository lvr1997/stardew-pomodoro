import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  name: string
  focusTime: number // 专注时间（分钟）
  timerMode: 'countdown' | 'accumulate' // 倒计时或正计时
  createdAt: number
}

export interface PomodoroSettings {
  focusMinutes: number
  shortMinutes: number
  longMinutes: number
  cyclesBeforeLong: number
  autoSwitch: boolean
  soundEnabled: boolean
}

// const DEFAULT_SETTINGS: PomodoroSettings = {
//   focusMinutes: 25,
//   shortMinutes: 5,
//   longMinutes: 15,
//   cyclesBeforeLong: 4,
//   autoSwitch: true,
//   soundEnabled: true
// }


const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  cyclesBeforeLong: 4,
  autoSwitch: true,
  soundEnabled: true
}


const SETTINGS_STORAGE_KEY = 'pomodoroSettings'
const SESSION_STORAGE_KEY = 'currentSession'

export const usePomodoroStore = defineStore('pomodoro', () => {

  const currentSession = useLocalStorage<PomodoroSession | null>(SESSION_STORAGE_KEY, null)
  const settings = useLocalStorage<PomodoroSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)


  // 更新设置
  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }


  // 重置设置
  const resetSettings = () => {
    settings.value = DEFAULT_SETTINGS
  }


  const createSession = (name: string, focusTime: number, timerMode: 'countdown' | 'accumulate' = 'countdown') => {
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      name,
      focusTime,
      timerMode,
      createdAt: Date.now()
    }
    currentSession.value = newSession
    return newSession
  }


  const deleteSession = () => {
    currentSession.value = null
  }


  const updateSession = (name: string, focusTime: number) => {
    if (currentSession.value) {
      currentSession.value.name = name
      currentSession.value.focusTime = focusTime
    }
  }

  const hasSession = computed(() => currentSession.value !== null)

  // 全局运行状态（由Pomodoro.vue维护）
  const isRunning = ref(false)

  return {
    currentSession,
    settings,
    isRunning,
    createSession,
    deleteSession,
    updateSession,
    hasSession,
    updateSettings,
    resetSettings
  }
})
