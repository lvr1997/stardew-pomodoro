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
  <div v-else class="flex flex-col h-full bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-900"> {{ sessionStore.currentSession?.name }}</h2>
      <p>
        <span class="i-tabler-pencil mr-1" @click="openEditDialog"/>
        <span class="i-tabler-trash text-red-500" @click="handleDeleteSession"  />
      </p>
    </div>

    <!-- Session Info -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="bg-blue-500 text-white rounded-lg p-4">
        <p class="font-semibold text-lg"></p>
        <p class="text-blue-100 text-sm mt-2">{{ sessionStore.currentSession?.focusTime }} min</p>
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

        <!-- Focus Time Input -->
        <div>
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
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/session'
import { useTodoStore } from '../stores/todolist'

const sessionStore = useSessionStore()
const todoStore = useTodoStore()

const showDialog = ref(false)
const isEditing = ref(false)
const formData = ref({
  name: '',
  focusTime: 25
})

const openCreateDialog = () => {
  isEditing.value = false
  formData.value = { name: '', focusTime: 25 }
  showDialog.value = true
}

const openEditDialog = () => {
  isEditing.value = true
  formData.value = {
    name: sessionStore.currentSession?.name || '',
    focusTime: sessionStore.currentSession?.focusTime || 25
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
    sessionStore.createSession(formData.value.name, formData.value.focusTime)
  }

  formData.value = { name: '', focusTime: 25 }
  showDialog.value = false
}

const handleDeleteSession = () => {
  if (confirm('Are you sure you want to delete this session and all its todos?')) {
    const sessionId = sessionStore.currentSession?.id
    if (sessionId) {
      todoStore.deleteSessionTodos(sessionId)
      sessionStore.deleteSession()
    }
  }
}
</script>

<style scoped>
</style>
