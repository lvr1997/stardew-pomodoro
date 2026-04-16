
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const open = ref(false)
  const title = ref('')
  const duration = ref(3000) // 默认 3000ms
  let timer: ReturnType<typeof setTimeout> | null = null

  function show(msg: string, customDuration?: number) {
    title.value = msg
    open.value = true
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    duration.value = customDuration ?? 3000
    timer = setTimeout(() => {
      close()
    }, duration.value)
  }

  function close() {
    open.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return { open, title, duration, show, close }
})
