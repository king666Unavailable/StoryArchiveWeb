<script setup lang="ts">
import { BookImage, Hourglass, VenetianMask } from '@lucide/vue'
import type { Hotspot } from '../content/navigation'

defineEmits<{ activate: [item: Hotspot] }>()

const dockItems: Array<{ item: Hotspot; icon: typeof VenetianMask }> = [
  { item: { id: 'profile', title: '玩家', eyebrow: 'CURATOR', description: '玩家信息', x: 0, y: 0 }, icon: VenetianMask },
  { item: { id: 'side-story', title: '侧影', eyebrow: 'SIDE STORIES', description: '侧影', x: 0, y: 0 }, icon: BookImage },
  { item: { id: 'exchange', title: '积分兑换', eyebrow: 'POITNS EXCHANGE', description: '未来可放置特别入口。', x: 0, y: 0 }, icon: Hourglass },
]
</script>

<template>
  <footer class="bottom-dock">
    <div class="dock-orbit" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="dock-items">
      <button v-for="entry in dockItems" :key="entry.item.id" class="dock-item" @click="$emit('activate', entry.item)">
        <span class="dock-icon"><component :is="entry.icon" :size="16" :stroke-width="1.55" aria-hidden="true" /></span>
        <span>{{ entry.item.title }}</span>
      </button>
    </div>
  </footer>
</template>
