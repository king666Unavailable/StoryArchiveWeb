<script setup lang="ts">
import type { Hotspot } from '../content/navigation'

defineProps<{ active: 'city' | 'archive' }>()
defineEmits<{ activate: [item: Hotspot] }>()

const dockItems: Hotspot[] = [
  { id: 'profile', title: '拾录者', eyebrow: 'CURATOR', description: '个人收藏与阅读进度。', x: 0, y: 0 },
  { id: 'side-story', title: '侧影', eyebrow: 'SIDE STORIES', description: '与主线并行的故事片段。', x: 0, y: 0 },
  { id: 'exchange', title: '记忆兑换', eyebrow: 'MEMORY EXCHANGE', description: '未来可放置精选合集与特别篇入口。', x: 0, y: 0 },
]
</script>

<template>
  <footer class="bottom-dock">
    <div class="dock-orbit" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="dock-items">
      <button v-for="(item, index) in dockItems" :key="item.id" class="dock-item" @click="$emit('activate', item)">
        <span class="dock-icon" :class="`dock-icon-${index + 1}`"><i></i></span>
        <span>{{ item.title }}</span>
      </button>
    </div>
    <div class="dock-scene"><span class="dock-scene-dot"></span>{{ active === 'city' ? 'CITY / 01' : 'ARCHIVE / 02' }}</div>
  </footer>
</template>
