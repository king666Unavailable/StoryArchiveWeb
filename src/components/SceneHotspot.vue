<script setup lang="ts">
import type { Hotspot } from '../content/navigation'

defineProps<{ item: Hotspot; index: number }>()
defineEmits<{ activate: [item: Hotspot] }>()
</script>

<template>
  <button
    class="hotspot"
    :class="[`align-${item.align || 'center'}`, { 'hotspot-large': item.size === 'large' }]"
    :style="{ left: `${item.x}%`, top: `${item.y}%`, '--delay': `${index * 90}ms` }"
    @click="$emit('activate', item)"
  >
    <span v-if="item.eyebrow" class="hotspot-eyebrow">{{ item.eyebrow }}</span>
    <span class="hotspot-title">{{ item.title }}</span>
    <span class="hotspot-ornament"><i></i><b></b><i></i></span>
  </button>
</template>
