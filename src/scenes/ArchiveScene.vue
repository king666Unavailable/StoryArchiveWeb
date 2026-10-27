<script setup lang="ts">
import SceneHotspot from '../components/SceneHotspot.vue'
import { archiveHotspots, type Hotspot } from '../content/navigation'

defineEmits<{ activate: [item: Hotspot] }>()
</script>

<template>
  <section class="scene archive-scene" aria-label="主神空间场景">
    <SceneHotspot v-for="(item, index) in archiveHotspots" :key="item.id" :item="item" :index="index" @activate="$emit('activate', $event)" />
  </section>
</template>

<style scoped>
.archive-scene { background-image: linear-gradient(180deg, rgba(9, 14, 32, .24) 0%, rgba(12, 18, 39, .22) 43%, rgba(14, 20, 43, .32) 68%, rgba(10, 16, 34, .52) 100%), url('/backgrounds/gameWorld2.webp'); background-position: center; background-size: cover; background-repeat: no-repeat; }
</style>
