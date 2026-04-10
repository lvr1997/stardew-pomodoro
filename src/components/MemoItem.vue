<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import LetterBg from '@/assets/themes/letterBG.png'
import TagIcon from '@/assets/icons/tag.png'
import type { Memo } from '../stores/memo'

const props = defineProps<{
  memo: Memo
  initialX: number
  initialY: number
  containerElement: any
}>()

const emit = defineEmits<{
  click: [memo: Memo]
  positionChange: [position: { x: number; y: number }]
}>()

const cardRef = useTemplateRef<HTMLElement>('cardRef')
const handleRef = useTemplateRef<HTMLElement>('handleRef')

const rotate = (Math.random() - 0.5) * 16

const { style } = useDraggable(cardRef, {
  handle: handleRef,
  initialValue: { x: props.initialX, y: props.initialY },
  containerElement: () => props.containerElement,
  restrictInView: true,
  onEnd: (position) => {
    emit('positionChange', {
      x: Math.round(position.x),
      y: Math.round(position.y),
    })
  },
})

const handleClick = (e: MouseEvent) => {
  if (handleRef.value && handleRef.value.contains(e.target as Node)) return
  emit('click', props.memo)
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getPreview = (content: string): string => {
  const lines = content.split('\n')
  const firstLine = lines[0] || ''
  if (firstLine.length > 20) {
    return firstLine.slice(0, 20) + '...'
  }
  return firstLine || '(空白便签)'
}
</script>

<template>
  <div
    ref="cardRef"
    class="memo-card p-2 cursor-pointer transition hover:shadow-md select-none"
    :style="[style, {
      backgroundImage: `url(${LetterBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transform: `rotate(${rotate}deg)`,
      position: 'absolute',
    }]"
    @click="handleClick"
  >
    <div
      ref="handleRef"
      class="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 z-10 cursor-move"
      @click.stop
    >
      <img
        :src="TagIcon"
        class="w-full h-full object-contain"
        alt="tag"
        draggable="false"
      />
    </div>
    <p class="text-[10px] text-gray-700 leading-tight line-clamp-3 mt-2">
      {{ getPreview(memo.content) }}
    </p>
    <p class="text-[8px] text-gray-500 mt-1">
      {{ formatDate(memo.createdAt) }}
    </p>
  </div>
</template>

<style scoped>
.memo-card {
  position: relative;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  overflow: visible;
}

.memo-card::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0px;
  right: 0px;
  height: 10px;
  background: inherit;
  background-size: cover;
  background-position: bottom;
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.15));
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 82%,
    97% 88%, 92% 76%, 88% 91%, 82% 78%, 77% 95%,
    72% 81%, 66% 98%, 61% 75%, 54% 92%, 49% 79%,
    43% 96%, 36% 83%, 30% 94%, 24% 77%, 18% 98%,
    11% 80%, 5% 93%, 0% 74%
  );
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
