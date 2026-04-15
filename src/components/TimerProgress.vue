<script lang="ts" setup>
import { ProgressIndicator, ProgressRoot } from 'radix-vue'
import { computed } from 'vue'
import Junimo from '@/assets/icons/Junimo.gif'

interface Props {
  /** Current progress value (0-100) */
  value?: number
  /** Whether to show the percentage text */
  showLabel?: boolean
  /** Whether to show Junimo animation */
  showJunimo?: boolean
  /** Junimo position follows progress */
  junimoFollowsProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  showLabel: true,
  showJunimo: true,
  junimoFollowsProgress: true,
})

const percentageLabel = computed(() => `${Math.round(props.value)}%`)

const junimoStyle = computed(() => {
  if (!props.junimoFollowsProgress) {
    return { left: '50%', transform: 'translateX(-50%)' }
  }
  return {
    left: `${Math.min(props.value, 100)}%`,
    transform: 'translateX(-50%)',
  }
})
</script>

<template>
  <div class="timer-progress-container">
    <!-- Main progress bar -->
    <ProgressRoot
      :model-value="value"
      :max="100"
      class="progress-root"
      data-testid="timer-progress"
    >
      <ProgressIndicator
        class="progress-indicator"
        :style="`transform: scaleX(${value / 100})`"
      />
    </ProgressRoot>

    <!-- Junimo animation overlay -->
    <div v-if="showJunimo" :style="junimoStyle" class="junimo-wrapper">
      <img
        :src="Junimo"
        alt="Junimo"
        class="junimo-sprite"
      />
    </div>

    <!-- Percentage label -->
    <div v-if="showLabel" class="progress-label">
      {{ percentageLabel }}
    </div>
  </div>
</template>

<style scoped>
.timer-progress-container {
  position: relative;
  width: 100%;
  margin: 0.5rem 0;
}

.progress-root {
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  width: 100%;
  height: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) inset;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.progress-indicator {
  height: 100%;
  background: linear-gradient(
    90deg,
    #7dba5f 0%,
    #9dd84b 50%,
    #a4d657 100%
  );
  box-shadow: 
    inset -1px 0 0 rgba(0, 0, 0, 0.1),
    inset 1px 0 0 rgba(255, 255, 255, 0.3),
    0 0 6px rgba(157, 216, 75, 0.4);
  transform-origin: left;
  transition: transform 200ms ease-out;
}

.junimo-wrapper {
  position: absolute;
  top: 0;
  transform: translateY(-50%);
  transition: left 200ms ease-out;
  z-index: 2;
}

.junimo-sprite {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.progress-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.6);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  pointer-events: none;
  z-index: 1;
}
</style>
