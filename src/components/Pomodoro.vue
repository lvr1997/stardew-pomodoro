<script lang="ts" setup>
import TimerProgress from '@/components/TimerProgress.vue';
import { useThemeStore } from '@/stores/settings';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useTitle } from '@vueuse/core';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import TomatoImg from '@/assets/icons/36px-Tomato.png'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'

type PomodoroMode = 'focus' | 'short' | 'long'

const mode = ref<PomodoroMode>('focus')
const remainingMs = ref(0)
const isRunning = computed({
  get: () => pomodoroStore.isRunning,
  set: (val: boolean) => { pomodoroStore.isRunning = val }
})
const cycleCount = ref(0)
const { t } = useI18n()
const toast = useToastStore()

const achievementTitle = ref('')

watch(cycleCount, (val, oldVal) => {
  if (val > 0 && val % pomodoroStore.settings.cyclesBeforeLong === 0 && oldVal % pomodoroStore.settings.cyclesBeforeLong !== 0) {
    achievementTitle.value = t('pomodoro.achievementTitle')
    toast.show(achievementTitle.value)
  }
})
const themeStore = useThemeStore()
const pomodoroStore = usePomodoroStore()

let intervalId: number | null = null
let lastTick = 0
let audioContext: AudioContext | null = null

/**
 * Get the duration in milliseconds for a given mode.
 */
const getDurationMs = (targetMode: PomodoroMode): number => {
  const minutes = targetMode === 'focus'
    ? pomodoroStore.settings.focusMinutes
    : targetMode === 'short'
      ? pomodoroStore.settings.shortMinutes
      : pomodoroStore.settings.longMinutes
  return minutes * 60 * 1000
}

/**
 * Format milliseconds to a time string.
 */
const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}



/**
 * Switch mode and reset timer.
 */
const setMode = (targetMode: PomodoroMode) => {
  if (mode.value === targetMode) return
  mode.value = targetMode
  remainingMs.value = getDurationMs(targetMode)
  if (isRunning.value) {
    startTimer()
  }
}

/**
 * Play a short notification sound.
 */
const playSound = () => {
  if (!pomodoroStore.settings.soundEnabled) return
  const ctx = audioContext ?? new AudioContext()
  audioContext = ctx
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 880
  gainNode.gain.value = 0.12

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.2)
}

/**
 * Handle a completed timer cycle.
 */
const handleComplete = () => {
  pauseTimer()
  playSound()

  if (mode.value === 'focus') {
    cycleCount.value += 1
    const nextMode = cycleCount.value % pomodoroStore.settings.cyclesBeforeLong === 0 ? 'long' : 'short'
    mode.value = nextMode
  } else {
    mode.value = 'focus'
  }

  remainingMs.value = getDurationMs(mode.value)
  if (pomodoroStore.settings.autoSwitch) {
    startTimer()
  }
}

/**
 * Timer tick to update remaining time.
 */
const tick = () => {
  const now = Date.now()
  const delta = now - lastTick
  lastTick = now
  remainingMs.value = Math.max(0, remainingMs.value - delta)
  if (remainingMs.value === 0) {
    handleComplete()
  }
}

/**
 * Start the timer.
 */
const startTimer = () => {
  if (isRunning.value) return
  if (remainingMs.value <= 0) {
    remainingMs.value = getDurationMs(mode.value)
  }
  isRunning.value = true
  lastTick = Date.now()
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(tick, 200)
}

/**
 * Pause the timer.
 */
const pauseTimer = () => {
  isRunning.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

/**
 * Reset the timer for current mode.
 */
const resetTimer = () => {
  pauseTimer()
  remainingMs.value = getDurationMs(mode.value)
}

const timeLabel = computed(() => formatTime(remainingMs.value))
const documentTitle = useTitle()

const cycleProgress = computed(() => {
  const total = pomodoroStore.settings.cyclesBeforeLong
  if (total <= 0) return 1
  return (cycleCount.value % total) + 1
})


const completedCycles = computed(() => {
  const total = pomodoroStore.settings.cyclesBeforeLong
  return Math.min(Math.max(0, cycleCount.value), total)
})

// 番茄品质 class 计算
const qualityClass = computed(() => {
  if (completedCycles.value >= 4) return 'iridium'
  if (completedCycles.value === 3) return 'gold'
  if (completedCycles.value === 2) return 'silver'
  return ''
})

const timerProgress = computed(() => {
  const duration = getDurationMs(mode.value)
  return Math.max(0, Math.min(100, ((duration - remainingMs.value) / duration) * 100))
})

watchEffect(() => {
  documentTitle.value = `${timeLabel.value} | ${isRunning.value ? 'Running' : 'Pause'}`
})


// 响应 store.settings 变化自动刷新 remainingMs
watch(
  () => [pomodoroStore.settings.focusMinutes, pomodoroStore.settings.shortMinutes, pomodoroStore.settings.longMinutes],
  () => {
    remainingMs.value = getDurationMs(mode.value)
  }
)


onMounted(() => {
  remainingMs.value = getDurationMs(mode.value)
})

onUnmounted(() => {
  pauseTimer()
  documentTitle.value = themeStore.title
})
</script>

<template>
  <div class="w-full max-h-95 max-w-sm mx-auto bg-backdrop p-3 rounded-3xl  mt-3 sm:mt-9">

    <div class="flex flex-col gap-6 sm:m-6">
      <div class="flex items-center justify-center gap-3">
        <button class="btn" @click="isRunning ? pauseTimer() : startTimer()">
          <i :class="isRunning ? 'i-pixelarticons:pause' : 'i-pixelarticons:play'"></i>
        </button>
        <button class="btn" @click="resetTimer">
          <i class="i-pixelarticons:reload"></i>
        </button>
        <button class="btn" @click="pomodoroStore.settings.soundEnabled = !pomodoroStore.settings.soundEnabled;">
          <i :class="pomodoroStore.settings.soundEnabled ? 'i-pixelarticons:volume-3' : 'i-pixelarticons:volume'"></i>
        </button>
      </div>

      <div class="text-6xl font-semibold text-center tracking-widest select-none"
        @click="isRunning ? pauseTimer() : startTimer()">
        {{ timeLabel }}
      </div>

      <!-- Timer Progress Bar with Junimo -->
      <TimerProgress :value="timerProgress" :show-junimo="true" :junimo-follows-progress="true" />



      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>{{ t('pomodoro.circle') }} {{ cycleProgress }}</span>
          <div class="quality">
            <div class="quality-badge" :class="qualityClass"></div>
            <img :src="TomatoImg" alt="Tomato" class="tomato-img" />
          </div>
        </div>
      </div>



      <div class="grid grid-cols-3 gap-3">
        <button class="btn" @click="setMode('focus')">
          {{ t('pomodoro.focus') }}
        </button>
        <button class="btn" @click="setMode('short')">
          {{ t('pomodoro.short') }}
        </button>
        <button class="btn" @click="setMode('long')">
          {{ t('pomodoro.long') }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.quality {
  position: relative;
  width: 24px;
  height: 24px;
}

.quality-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 2;
  transition: background 0.2s;
}

.quality-badge.silver {
  background: url('../assets/icons/24px-Silver_Quality_Icon.png') no-repeat center / cover;
}

.quality-badge.gold {
  background: url('../assets/icons/24px-Gold_Quality_Icon.png') no-repeat center / cover;
}

.quality-badge.iridium {
  background: url('../assets/icons/24px-Iridium_Quality_Icon.png') no-repeat center / cover;
}

.tomato-img {
  width: 24px;
  height: 24px;
  display: block;
  z-index: 1;
}
</style>
