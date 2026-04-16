<script lang="ts" setup>
import CheckBox from '@/components/common/CheckBox.vue';
import Listbox from '@/components/common/Listbox.vue';
import Tabs from '@/components/common/Tabs.vue';
import TabContent from '@/components/common/TabContent.vue';
import { availableLocales, localeLabels } from '@/i18n';
import { useThemeStore, type AppFont, type Theme } from '@/stores/settings';
import { usePomodoroStore } from '@/stores/pomodoro';
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToastStore } from '@/stores/toast';

// Settings component - manages user preferences stored in userSettings

const themeStore = useThemeStore()
const pomodoroStore = usePomodoroStore()
const toast = useToastStore()
const { locale, t } = useI18n()

const isFullscreenEnabled = ref(false)
const showSaveConfirm = ref(false)
const isPomodoroRunning = computed(() => {
  // 直接读取pinia store的isRunning状态
  // 由于Settings和Pomodoro是分离组件，需通过localStorage同步
  // 但更推荐用pinia全局状态
  // 这里假设Pomodoro的isRunning是全局唯一
  // 若不是全局唯一，需事件总线或全局store
  // 这里直接读取store
  try {
    // 优先从store
    return pomodoroStore.isRunning ?? false
  } catch {
    return false
  }
})

// Tab configuration
const tabs = [
  { id: 'general', label: t('settings.general') },
  { id: 'pomodoro', label: t('settings.pomodoro') }
]

// Initialize settings from store
themeStore.loadSavedSettings()

// Sync i18n locale with store
locale.value = themeStore.currentLanguage

const themeOptions = [
  { id: 'theme-spring', name: 'Spring', unavailable: false },
  { id: 'theme-summer', name: 'Summer', unavailable: false },
  { id: 'theme-autumn', name: 'Autumn', unavailable: false },
  { id: 'theme-winter', name: 'Winter', unavailable: false },
]
const selectedTheme = ref(themeOptions[0])

const languageOptions = availableLocales.map((code) => ({
  id: `lang-${code}`,
  name: localeLabels[code],
  unavailable: false,
}))
const selectedLanguage = ref(
  languageOptions.find((option) => option.id === `lang-${themeStore.currentLanguage}`) ?? languageOptions[0]
)
const fontOptions = [
  { id: 'font-fusion-pixel', name: 'fusion-pixel', unavailable: false },
  { id: 'font-KNMaiyuan', name: 'KNMaiyuan', unavailable: false },
]
const selectedFont = ref(
  fontOptions.find((option) => option.id === `font-${themeStore.currentFont}`) ?? fontOptions[0]
)

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('currentTheme') as Theme
if (savedTheme) {
  const themeOption = themeOptions.find(t => t.id === `theme-${savedTheme}`)
  if (themeOption) {
    selectedTheme.value = themeOption
  }
}

watch(selectedLanguage, (next) => {
  const code = next?.id?.replace('lang-', '') as 'zh' | 'en'
  if (code && code !== locale.value) {
    locale.value = code
    themeStore.setLanguage(code)
  }
})

watch(selectedTheme, (next) => {
  if (next) {
    const theme = next.id.replace('theme-', '') as Theme
    themeStore.applyTheme(theme)
  }
})

watch(selectedFont, (next) => {
  const font = next?.id?.replace('font-', '') as AppFont
  if (font && font !== themeStore.currentFont) {
    themeStore.setFont(font)
  }
})

const savePomodoroSettings = () => {
  // Settings are automatically saved via localStorage by pinia
  // Just show confirmation
  toast.show(t('settings.saved'))
}

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

const updateFullscreenState = () => {
  isFullscreenEnabled.value = !!document.fullscreenElement
}

// Initialize fullscreen state
updateFullscreenState()

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', updateFullscreenState)
</script>

<template>
  <div class="p-6 space-y-4 text-[#5e2c2a] min-w-sm">
    <Tabs :tabs="tabs">
      <!-- General Settings Tab -->
      <TabContent value="general">

        <!-- General Toggle Controls -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm mb-2">{{ $t('settings.titleLabel') }}</p>
            <input class="p-1 input-base" v-model="themeStore.title" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('settings.theme') }}</p>
            <Listbox v-model="selectedTheme" :options="themeOptions" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('settings.language') }}</p>
            <Listbox v-model="selectedLanguage" :options="languageOptions" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('settings.font') }}</p>
            <Listbox v-model="selectedFont" :options="fontOptions" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('settings.music') }}</p>
            <CheckBox v-model="themeStore.isMusicEnabled" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('settings.fullscreen') }}</p>
            <CheckBox v-model="isFullscreenEnabled" @change="toggleFullscreen" />
          </div>
        </div>
      </TabContent>

      <!-- Pomodoro Settings Tab -->
      <TabContent value="pomodoro">
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <span class="text-sm">{{ $t('pomodoro.focusMinutes') }}</span>
            <div class="flex items-center gap-2">
              <input v-model.number="pomodoroStore.settings.focusMinutes" type="number" min="1"
                class="input-base w-16 px-2 py-1 text-center" :disabled="isPomodoroRunning" />
              <span class="text-xs">{{ $t('pomodoro.minutes') }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-sm">{{ $t('pomodoro.shortMinutes') }}</span>
            <div class="flex items-center gap-2">
              <input v-model.number="pomodoroStore.settings.shortMinutes" type="number" min="1"
                class="input-base w-16 px-2 py-1 text-center" :disabled="isPomodoroRunning" />
              <span class="text-xs">{{ $t('pomodoro.minutes') }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-sm">{{ $t('pomodoro.longMinutes') }}</span>
            <div class="flex items-center gap-2">
              <input v-model.number="pomodoroStore.settings.longMinutes" type="number" min="1"
                class="input-base w-16 px-2 py-1 text-center" :disabled="isPomodoroRunning" />
              <span class="text-xs">{{ $t('pomodoro.minutes') }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-sm">{{ $t('pomodoro.cyclesBeforeLong') }}</span>
            <div class="flex items-center gap-2">
              <input v-model.number="pomodoroStore.settings.cyclesBeforeLong" type="number" min="1"
                class="input-base w-16 px-2 py-1 text-center" :disabled="isPomodoroRunning" />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('pomodoro.autoStart') }}</p>
            <CheckBox v-model="pomodoroStore.settings.autoSwitch" :disabled="isPomodoroRunning" />
          </div>

          <div class="flex items-center justify-between">
            <p class="text-sm">{{ $t('pomodoro.soundEnabled') }}</p>
            <CheckBox v-model="pomodoroStore.settings.soundEnabled" :disabled="isPomodoroRunning" />
          </div>

          <div class="flex justify-center mt-6">
            <button
              class="btn-primary px-6 py-2 rounded-lg text-sm font-medium"
              :disabled="isPomodoroRunning"
              @click="savePomodoroSettings"
            >
              {{ $t('settings.saveSettings') }}
            </button>
          </div>

          <div v-if="showSaveConfirm" class="text-center text-sm text-green-600 mt-2">
            {{ $t('settings.saved') }}
          </div>
        </div>
      </TabContent>
    </Tabs>
  </div>
</template>
