<script setup lang="ts">
import SceneHotspot from '../components/SceneHotspot.vue'
import { cityHotspots, type Hotspot } from '../content/navigation'

defineEmits<{ activate: [item: Hotspot] }>()
</script>

<template>
  <section class="scene city-scene" aria-label="城市索引场景">
    <SceneHotspot v-for="(item, index) in cityHotspots" :key="item.id" :item="item" :index="index" @activate="$emit('activate', $event)" />
  </section>
</template>

<style scoped>
.city-scene { background-image: linear-gradient(180deg, rgba(12, 20, 39, .34) 0%, rgba(12, 20, 39, .22) 43%, rgba(12, 20, 39, .28) 68%, rgba(10, 17, 32, .56) 100%), var(--city-background, url('/backgrounds/realWorld.webp')); background-position: center; background-size: cover; background-repeat: no-repeat; }
</style>
