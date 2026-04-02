<template>
  <!-- Initial State: Only New Session Button -->
  <div v-if="!sessionStore.hasSession" class="inline-block">
    <button
      @click="openCreateDialog"
      class="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-md"
    >
      <span class="i-tabler-plus" />
        New Session
    </button>
  </div>

  <!-- Session State: Show when session exists -->
  <div v-else class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-2">
      <h2 class="text-lg text-gray-900"> {{ sessionStore.currentSession?.name }}</h2>
      <p>
        <span class="i-tabler-pencil mr-1" @click="openEditDialog"/>
        <span class="i-tabler-trash text-red-500" @click="handleDeleteSession"  />
      </p>
    </div>

    <!-- Session Info -->
    <div class="flex-1 overflow-y-auto">
      <div class="bg-blue-500 text-white rounded p-2">
        <p class="text-blue-100 text-xs mb-3">{{ formatTime.label }}</p>
        <div class="flex items-center justify-center gap-2">               
          <div class="text-center flex-1 flex flex-col items-center">
            <p class="text-3xl font-bold leading-none">{{ formatTime.hours }}</p>
            <p class="text-xs text-blue-100 leading-none">Hours</p>
          </div>
          <p class="text-3xl font-bold leading-none -translate-y-2">:</p>
          <div class="text-center flex-1 flex flex-col items-center">
            <p class="text-3xl font-bold leading-none">{{ formatTime.minutes }}</p>
            <p class="text-xs text-blue-100 leading-none">Minutes</p>
          </div>
          <p class="text-3xl font-bold leading-none -translate-y-2">:</p>
          <div class="text-center flex-1 flex flex-col items-center">
            <p class="text-3xl font-bold leading-none">{{ formatTime.seconds }}</p>
            <p class="text-xs text-blue-100 leading-none">Seconds</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Session Dialog -->
  <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-center">
    <div class="bg-white rounded-lg p-8 w-full max-w-sm shadow-xl">
      <h3 class="text-xl font-bold mb-6 text-gray-900">{{ isEditing ? 'Edit Session' : 'Create New Session' }}</h3>
      
      <div class="space-y-5">
        <!-- Session Name Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Session Name
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="e.g., Morning Study"
            class="px-4 py-2 text-gray-900 placeholder-gray-400 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 border-0"
            @keyup.enter="handleSubmit"
          />
        </div>

        <!-- Timer Mode Toggle (Only show when creating) -->
        <div v-if="!isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Timer Mode
          </label>
          <div class="flex gap-2">
            <button
              @click="formData.timerMode = 'countdown'"
              :class="[
                'flex-1 py-2 px-3 rounded-lg font-medium transition border-0',
                formData.timerMode === 'countdown'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              ⏱️ Countdown
            </button>
            <button
              @click="formData.timerMode = 'accumulate'"
              :class="[
                'flex-1 py-2 px-3 rounded-lg font-medium transition border-0',
                formData.timerMode === 'accumulate'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              ⏲️ Accumulate
            </button>
          </div>
        </div>

        <!-- Focus Time Input (Only show when creating) -->
        <div v-if="!isEditing && formData.timerMode === 'countdown'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Focus Time (minutes)
          </label>
          <input
            v-model.number="formData.focusTime"
            type="number"
            placeholder="e.g., 25"
            min="1"
            max="999"
            class="px-4 py-2 text-gray-900 placeholder-gray-400 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 border-0"
            @keyup.enter="handleSubmit"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 mt-8">
        <button
          @click="showDialog = false"
          class="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition bg-gray-100 border-0"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition border-0"
        >
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSessionStore } from '../stores/session'
import { useTodoStore } from '../stores/todolist'

const sessionStore = useSessionStore()
const todoStore = useTodoStore()

const showDialog = ref(false)
const isEditing = ref(false)
const formData = ref({
  name: '',
  focusTime: 25,
  timerMode: 'countdown' as 'countdown' | 'accumulate'
})

// 用于触发实时更新的响应式引用
const currentTime = ref<number>(Date.now())

// 定时器ID
let intervalId: number | null = null

const openCreateDialog = () => {
  isEditing.value = false
  formData.value = { name: '', focusTime: 25, timerMode: 'countdown' }
  showDialog.value = true
}

const openEditDialog = () => {
  isEditing.value = true
  formData.value = {
    name: sessionStore.currentSession?.name || '',
    focusTime: sessionStore.currentSession?.focusTime || 25,
    timerMode: sessionStore.currentSession?.timerMode || 'countdown'
  }
  showDialog.value = true
}

const handleSubmit = () => {
  if (!formData.value.name.trim() || formData.value.focusTime < 1) {
    alert('Please enter a valid session name and focus time')
    return
  }

  if (isEditing.value) {
    sessionStore.updateSession(formData.value.name, formData.value.focusTime)
  } else {
    sessionStore.createSession(formData.value.name, formData.value.focusTime, formData.value.timerMode)
  }

  formData.value = { name: '', focusTime: 25, timerMode: 'countdown' }
  showDialog.value = false
}

const handleDeleteSession = () => {
  if (confirm('Are you sure you want to delete this session and all its todos?')) {
    const sessionId = sessionStore.currentSession?.id
    if (sessionId) {
      todoStore.deleteSessionTodos(sessionId)
      sessionStore.deleteSession()
      stopTimer() // 确保删除时清除定时器
    }
  }
}

// Track if alert has been shown
const alertShown = ref(false)

// Calculate remaining time from session start
const formatTime = computed(() => {
  // 触发依赖关系，使组件每秒更新
  currentTime.value
  
  if (!sessionStore.currentSession) {
    return { hours: '00', minutes: '00', seconds: '00', remainingSeconds: 0, label: '' }
  }

  const timerMode = sessionStore.currentSession.timerMode
  
  if (timerMode === 'countdown') {
    // 倒计时模式
    const totalFocusSeconds = sessionStore.currentSession.focusTime * 60
    const elapsedSeconds = Math.floor((Date.now() - sessionStore.currentSession.createdAt) / 1000)
    const remainingSeconds = Math.max(0, totalFocusSeconds - elapsedSeconds)
    
    const hours = Math.floor(remainingSeconds / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds % 60
    
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      remainingSeconds,
      label: 'Focus Time Remaining'
    }
  } else {
    // 正计时模式 - 显示已工作时间
    const elapsedSeconds = Math.floor((Date.now() - sessionStore.currentSession.createdAt) / 1000)
    
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60
    
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      remainingSeconds: elapsedSeconds,
      label: 'Time Worked'
    }
  }
})

// Setup timer for real-time countdown
const startTimer = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
}

const stopTimer = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Watch for session changes
watch(
  () => sessionStore.currentSession,
  (newSession) => {
    if (newSession) {
      alertShown.value = false // 重置标志，新会话开始时
      startTimer()
    } else {
      stopTimer()
    }
  }
)

// Watch for countdown completion (only in countdown mode)
watch(
  () => formatTime.value.remainingSeconds,
  (newVal) => {
    if (sessionStore.currentSession?.timerMode === 'countdown' && newVal === 0 && !alertShown.value) {
      alertShown.value = true
      alert('🎉 焦点时间到了！休息一下吧')
      stopTimer()
      
      // 自动清空 session 和相关 todos
      const sessionId = sessionStore.currentSession?.id
      if (sessionId) {
        todoStore.deleteSessionTodos(sessionId)
        sessionStore.deleteSession()
      }
    }
  }
)

onMounted(() => {
  if (sessionStore.hasSession) {
    startTimer()
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
</style>
